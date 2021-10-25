const core = require('@actions/core');
const terve = require('./terve');
const terragrunt = require('./terragrunt');
const pr = require('./pr')

let run = async function () {
    try {
        await terve.install("0.6.1");

        let tf_default = core.getInput('default-terraform-version');
        let tg_default = core.getInput('default-terragrunt-version');
        let working_directory = core.getInput('working-directory', {required: true});
        let run_type = core.getInput('run-type', {required: true});

        await terve.setup(working_directory, tf_default, tg_default);

        let result = await terragrunt.run(run_type, working_directory);

        await pr.comment(run_type, working_directory, result);
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
