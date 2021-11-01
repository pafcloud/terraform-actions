import * as github from '@actions/github';
import * as core from '@actions/core';

/**
 * Posts a PR comment
 * @param body The body of the comment
 */
export const post_pr_comment = async function(body: string) : Promise<void> {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);
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

/**
 * For the current PR, extracts the base_sha, i.e. the sha of the target branch
 */
export const base_sha = async function() : Promise<string> {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token)
    const context = github.context;
    const pull_number = context.issue.number;

    try {
        const { data: { base: { sha } }} = await octokit.rest.pulls.get({ ...context.repo, pull_number: pull_number});
        return sha
    } catch (e) {
        throw new Error(`Failed to post pull request comment ${e}`);
    }
};
