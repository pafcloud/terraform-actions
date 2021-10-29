import * as core from '@actions/core';
import * as terve from './terve';
import * as terragrunt from './terragrunt';
import * as pr from './pr';
import WorkingDirectory from './working-directory';

const run = async function () {
    try {
        await terve.install("0.6.1");

        const tf_default = core.getInput('default-terraform-version');
        const tg_default = core.getInput('default-terragrunt-version');
        core.getInput('github-token', {required: true}); // Just for validation
        const relative_working_dir = core.getInput('working-directory', {required: true});
        const working_directory = new WorkingDirectory(process.cwd(), relative_working_dir);
        const run_type = core.getInput('run-type', {required: true});

        await terve.setup(working_directory, tf_default, tg_default);

        const result = await terragrunt.run(run_type, working_directory);

        await pr.comment(run_type, working_directory, result);
    } catch (error) {
        core.setFailed(error.message);
    }
};

run();
