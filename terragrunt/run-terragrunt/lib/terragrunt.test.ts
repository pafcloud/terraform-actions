import {jest} from '@jest/globals';
import * as terragrunt from './terragrunt';
import * as exec from "@actions/exec";
import WorkingDirectory from "./working-directory";

jest.mock('@actions/exec');

beforeEach(() => {
    jest.clearAllMocks(); // Otherwise, calls will be persisted between runs
});

let working_directory = new WorkingDirectory('workspace', 'relative_path');

describe('terragrunt.run', () => {
    describe('when run_type is unknown', () => {
        test('it throws an error', async () => {
            await expect(() => terragrunt.run('foobar', null)).rejects.toThrowError('Invalid run-type');
        });
    });

    describe('when working-directory is not set', () => {
       ['plan-for-apply', 'plan-for-destroy', 'apply-on-comment'].forEach(run_type => {
          test(`running ${run_type} throws an error`, async () => {
              await expect(() => terragrunt.run(run_type, null))
                  .rejects
                  .toThrowError('working-directory is not set');
          });
       });
    });

    describe('when working-directory is present', () => {
        describe('and run_type is plan-for-apply', () => {
            test('it calls terragrunt plan', async () => {
                await terragrunt.run('plan-for-apply', working_directory);

                let call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                let [binary, [command], options] = [...call];
                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("plan");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

        describe('and run_type is apply-on-comment', () => {
            test('it calls terragrunt apply', async () => {
                await terragrunt.run('apply-on-comment', working_directory);

                let call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                let [binary, [command, ...restOfArgs], options] = [...call];
                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("apply");
                expect(restOfArgs).toContain("-auto-approve");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

        describe('and run_type is plan-for-destroy', () => {
            test('it calls terragrunt plan -destroy', async () => {
                await terragrunt.run('plan-for-destroy', working_directory);

                let call = (exec.getExecOutput as jest.Mock).mock.calls[0];

                let [binary, [command, ...restOfArgs], options] = [...call];

                expect(binary).toEqual("terragrunt");
                expect(command).toEqual("plan");
                expect(restOfArgs).toContain("-destroy");
                expect(options.cwd).toEqual('workspace/relative_path');
            });
        });

    });
});
