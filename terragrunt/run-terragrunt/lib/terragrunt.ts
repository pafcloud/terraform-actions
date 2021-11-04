import * as exec from '@actions/exec';
import {ExecOutput} from "@actions/exec";
import WorkingDirectory from "./working-directory";
import RunType from "./run_type";

export type RunResult = ExecOutput | void;

const no_command = function (run_type: RunType) : () => Promise<RunResult>  {
    return async () => {
        throw new Error(`Invalid run-type ${run_type}`);
    };
}

const exec_terragrunt = function(args: string[]): (working_directory: WorkingDirectory) => Promise<RunResult> {
    return async (working_directory) => {
        if (!working_directory) {
            throw new TypeError('working-directory is not set');
        }
        return await exec.getExecOutput(
            "terragrunt",
            args,
            { cwd: working_directory.absolute_path(), env: { ...process.env, ...{ TF_CLI_ARGS_init: '-no-color' } } });
    }
}

const plan_for_apply = exec_terragrunt(['plan', '-no-color', '-input=false']);

const plan_for_destroy = exec_terragrunt(['plan', '-destroy', '-no-color', '-input=false']);

const apply = exec_terragrunt(['apply', '-no-color', '-auto-approve', '-input=false']);
const destroy_on_merge = exec_terragrunt(['destroy', '-no-color', '-auto-approve', '-input=false']);

type Command = (working_directory: WorkingDirectory) => Promise<RunResult>;

const commands: Record<RunType, Command> = {
    'plan-for-apply': plan_for_apply,
    'apply-on-comment': apply,
    'plan-for-destroy': plan_for_destroy,
    'destroy-on-merge': destroy_on_merge,
    'apply-on-merge': apply
}

export const run = async function (run_type: RunType, working_directory: WorkingDirectory): Promise<RunResult> {
    const command = commands[run_type] || no_command(run_type);
    return await command(working_directory);
}
