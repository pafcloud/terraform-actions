const gh = require('./gh');

let plan_for_apply_message = (working_path, plan) => {
    return `### Terraform \`plan\` (${working_path})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform apply by commenting <code>/apply</code> or merging this PR
`;
};

let plan_for_apply_failure_message = (working_path, plan) => {
    return `### Terraform \`plan\` failed (${working_path})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;
};

let plan_for_destroy_message = (working_path, plan) => {
    return `### Terraform \`plan\` (${working_path})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform destroy by merging this PR
`;
};

let no_command = function (run_type) {
    return async () => { throw new Error(`Invalid run-type ${run_type}`) };
}

let plan_for_apply = async function (working_path, result) {
    let body;
    if (result.exitCode === 0) {
        // If the run is a success, we don't want to print stderr
        body = plan_for_apply_message(working_path, result.stdout);
    } else {
        body = plan_for_apply_failure_message(working_path, result.stderr + result.stdout);
    }
    await gh.post_pr_comment(body);
}

let plan_for_destroy = async function (working_path, result) {
    let body;
    if (result.exitCode === 0) {
        // If the run is a success, we don't want to print stderr
        body = plan_for_destroy_message(working_path, result.stdout);
    } else {
        body = plan_for_apply_failure_message(working_path, result.stderr + result.stdout);
    }
    await gh.post_pr_comment(body);
}

let commands = {
    'plan-for-apply': plan_for_apply,
    'plan-for-destroy': plan_for_destroy
}

let comment = async function (run_type, working_path, run_result) {
    try {
        let command = commands[run_type] || no_command(run_type);
        return await command(working_path, run_result);
    } catch (e) {
        throw new Error(e);
    }
}

module.exports = { comment };
