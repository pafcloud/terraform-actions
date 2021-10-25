const gh = require('./gh');

let plan_message = (working_path, plan) => {
    return `### Terraform \`plan\` (${working_path})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform apply by commenting <code>/apply</code> or merging this PR
`;
};

let fail_message = (working_path, plan) => {
    return `### Terraform \`plan\` failed (${working_path})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;
};

let plan_for_apply = async function (working_path, result) {
    let body;
    if (result.exitCode === 0) {
        // If the run is a success, we don't want to print stderr
        body = plan_message(working_path, result.stdout);
    } else {
        body = fail_message(working_path, result.stderr + result.stdout);
    }
    await gh.post_pr_comment(body);
}

let comment = async function (run_type, working_path, run_result) {
    try {
        switch (run_type) {
            case 'plan-for-apply':
                await plan_for_apply(working_path, run_result);
                break;
            default:
                throw new Error(`Unknown run type: ${run_type}`);
        }
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = { comment };
