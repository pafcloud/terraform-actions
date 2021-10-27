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

let apply_failure_message = (working_path, plan) => {
    return `### Terraform \`apply\` failed (${working_path})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;
};

let apply_on_comment_message = (working_path, plan) => {
    return `### Terraform \`apply\` (${working_path})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please merge this pull request to keep Git base branch and terraform-managed resource state in sync
`;
};

let no_command = function (run_type) {
    return async () => { throw new Error(`Invalid run-type ${run_type}`) };
}

let run_with_messages = function(success, failure) {
    return async (working_path, result) => {
      let body;
      if (result.exitCode === 0) {
          body = success(working_path, result);
      } else {
          body = failure(working_path, result);
      }
      await gh.post_pr_comment(body);
    };
}

let plan_for_apply = run_with_messages(
    (working_path, result) => plan_for_apply_message(working_path, result.stdout),
    (working_path, result) => plan_for_apply_failure_message(working_path, result.stderr + result.stdout)
);

let plan_for_destroy = run_with_messages(
    (working_path, result) => plan_for_destroy_message(working_path, result.stdout),
    (working_path, result) => plan_for_apply_failure_message(working_path, result.stderr + result.stdout)
)

let apply_on_comment = run_with_messages(
    (working_path, result) => apply_on_comment_message(working_path, result.stdout),
    (working_path, result) => apply_failure_message(working_path, result.stderr + result.stdout),
);

let commands = {
    'plan-for-apply': plan_for_apply,
    'plan-for-destroy': plan_for_destroy,
    'apply-on-comment': apply_on_comment
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
