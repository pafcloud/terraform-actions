const exec = require('@actions/exec');

let plan = async function (working_directory) {
    return await exec.getExecOutput(
        "terragrunt",
        ['plan', '-no-color', '-input=false'],
        { cwd: working_directory, env: { ...process.env, ...{ TF_CLI_ARGS_init: '-no-color' } } });
};

module.exports = { plan };
