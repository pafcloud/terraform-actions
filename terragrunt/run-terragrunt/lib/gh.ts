import * as github from '@actions/github';
import * as core from '@actions/core';

export const post_pr_comment = async function(body) {
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

export const base_sha = async function() {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token)
    const context = github.context;
    const pull_number = context.issue.number;

    try {
        let { data: { base: { sha } }} = await octokit.rest.pulls.get({ ...context.repo, pull_number: pull_number});
        return sha
    } catch (e) {
        throw new Error(`Failed to post pull request comment ${e}`);
    }
};
