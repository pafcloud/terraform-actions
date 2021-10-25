const exec = require('@actions/exec');

let no_command = async function () {
    throw new Error("Invalid run-type");
}

let plan = async function (working_directory) {
    return await exec.getExecOutput(
        "terragrunt",
        ['plan', '-no-color', '-input=false'],
        { cwd: working_directory, env: { ...process.env, ...{ TF_CLI_ARGS_init: '-no-color' } } });
};

let commands = {
    'plan-for-apply': plan
}

let run = async function (run_type, working_directory) {
    let command = commands[run_type] || no_command

    return command(working_directory);
}

module.exports = { run };
