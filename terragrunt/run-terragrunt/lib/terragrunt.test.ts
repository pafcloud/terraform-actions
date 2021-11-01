import {jest} from '@jest/globals';
import * as terragrunt from './terragrunt';
import * as exec from "@actions/exec";
import WorkingDirectory from "./working-directory";
import RunType from "./run_type";

jest.mock('@actions/exec');

beforeEach(() => {
    jest.clearAllMocks(); // Otherwise, calls will be persisted between runs
});

const working_directory = new WorkingDirectory('workspace', 'relative_path');

describe('terragrunt.run', () => {
    describe('when working-directory is not set', () => {
       ['plan-for-apply', 'plan-for-destroy', 'apply-on-comment'].forEach(run_type => {
          test(`running ${run_type} throws an error`, async () => {
              await expect(() => terragrunt.run(run_type as RunType, null))
                  .rejects
                  .toThrowError('working-directory is not set');
          });
       });
    });

    describe('when working-directory is present', () => {
        describe('and run_type is plan-for-apply', () => {
            test('it calls terragrunt plan', async () => {
                await terragrunt.run('plan-for-apply', working_directory);

                const call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                const [binary, [command], options] = [...call];
                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("plan");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

        describe('and run_type is apply-on-comment', () => {
            test('it calls terragrunt apply', async () => {
                await terragrunt.run('apply-on-comment', working_directory);

                const call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                const [binary, [command, ...restOfArgs], options] = [...call];
                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("apply");
                expect(restOfArgs).toContain("-auto-approve");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

        describe('and run_type is plan-for-destroy', () => {
            test('it calls terragrunt plan -destroy', async () => {
                await terragrunt.run('plan-for-destroy', working_directory);

                const call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                const [binary, [command, ...restOfArgs], options] = [...call];

                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("plan");
                expect(restOfArgs).toContain("-destroy");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

        describe('and run_type is destroy-on-merge', () => {
           it('calls terragrunt destroy -no-color -auto-approve -input=false', async () => {
               await terragrunt.run('destroy-on-merge', working_directory);

               const call = (exec.getExecOutput as jest.Mock).mock.calls[0];

               const [binary, [command, ...restOfArgs], options] = [...call];

               expect(binary).toEqual("terragrunt");
               expect(command).toEqual("destroy");
               expect(restOfArgs).toContain("-auto-approve");
               expect(restOfArgs).toContain("-input=false");
               expect(options.cwd).toEqual('workspace/relative_path');
           });
        });
    });
});
