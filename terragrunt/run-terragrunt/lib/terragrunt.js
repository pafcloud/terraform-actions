const exec = require('@actions/exec');

let no_command = function (run_type) {
    return async () => { throw new Error(`Invalid run-type ${run_type}`) };
}

let exec_terragrunt = async function(args, working_directory) {
    if (!working_directory) {
        throw new TypeError('working-directory is not set');
    }
    return await exec.getExecOutput(
        "terragrunt",
        args,
        { cwd: working_directory, env: { ...process.env, ...{ TF_CLI_ARGS_init: '-no-color' } } });
}

let plan = async function (working_directory) {
    if (!working_directory) {
        throw new TypeError('working-directory is not set');
    }
    return await exec_terragrunt(
        ['plan', '-no-color', '-input=false'],
        working_directory);
};

let apply = async function (working_directory) {
    if (!working_directory) {
        throw new TypeError('working-directory is not set');
    }
    return await exec_terragrunt(
        ['apply', '-no-color', '-auto-approve', '-input=false'],
        working_directory);
}

let commands = {
    'plan-for-apply': plan,
    'apply-on-comment': apply
}

let run = async function (run_type, working_directory) {
    let command = commands[run_type] || no_command(run_type);
    return await command(working_directory);
}

module.exports = { run };
