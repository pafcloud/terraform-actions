jest.mock('@actions/exec');

const terragrunt = require('./terragrunt');
const exec = require("@actions/exec");

beforeEach(() => {
    jest.clearAllMocks(); // Otherwise, calls will be persisted between runs
});

describe('terragrunt.run', () => {
    describe('when run_type is unknown', () => {
        test('it throws an error', async () => {
            await expect(() => terragrunt.run('foobar')).rejects.toThrowError('Invalid run-type');
        });
    });

    describe('when run_type is plan-for-apply', () => {
        describe('and working-directory is present', () => {
            test('it calls terragrunt', async () => {
                await terragrunt.run('plan-for-apply', 'working-directory');

                let call = exec.getExecOutput.mock.calls[0];

                let [binary, [command], options] = [...call];
                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("plan");
                expect(options.cwd).toEqual('working-directory');
            });
        });

        describe('and working directory is not present', () => {
           test('it throws an error', async () => {
               await expect(() => terragrunt.run('plan-for-apply'))
                   .rejects
                   .toThrowError('working-directory is not set');
           });
        });
    });

    describe('when run_type is apply-on-comment', () => {
        describe('and working-directory is present', () => {
           test('it calls terragrunt apply', async () => {
               await terragrunt.run('apply-on-comment', 'working-directory');

               let call = exec.getExecOutput.mock.calls[0];

               let [binary, [command, ...restOfArgs], options] = [...call];
               expect(binary).toEqual("terragrunt");
               expect(command).toEqual("apply");
               expect(restOfArgs).toContain("-auto-approve");
               expect(options.cwd).toEqual('working-directory');
           });
        });
    })
});
