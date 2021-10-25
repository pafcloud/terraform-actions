const github = require('@actions/github');
const core = require('@actions/core');

const run = async function(body) {
    const token = core.getInput('github-token', { required: true });

    const octokit = github.getOctokit(token)

    const context = github.context;

    const issue_number = context.issue.number;

    try {
        await octokit.rest.issues.createComment({
            ...context.repo,
            issue_number,
            body,
        });
    } catch (e) {
        throw new Error(`Failed to post pull request comment ${e}`);
    }
};

module.exports = { "post_pr_comment":  run }
