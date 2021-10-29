import * as exec from '@actions/exec';

let no_command = function (run_type) {
    return async () => { throw new Error(`Invalid run-type ${run_type}`) };
}

let exec_terragrunt = function(args) {
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

let plan_for_apply = exec_terragrunt(['plan', '-no-color', '-input=false']);

let plan_for_destroy = exec_terragrunt(['plan', '-destroy', '-no-color', '-input=false']);

let apply = exec_terragrunt(['apply', '-no-color', '-auto-approve', '-input=false']);

let commands = {
    'plan-for-apply': plan_for_apply,
    'apply-on-comment': apply,
    'plan-for-destroy': plan_for_destroy
}

export let run = async function (run_type, working_directory) {
    let command = commands[run_type] || no_command(run_type);
    return await command(working_directory);
}
