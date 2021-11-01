import * as gh from './gh';
import RunType from "./run_type";
import WorkingDirectory from "./working-directory";
import {ExecOutput} from "@actions/exec";

export const comment = async function (run_type: RunType, working_path: WorkingDirectory, run_result: ExecOutput) {
    try {
        const base_sha = await gh.base_sha();
        const command: Command = commands[run_type] || no_command(run_type);
        return await command(working_path, run_result, base_sha);
    } catch (e) {
        throw new Error(e);
    }
};

const plan_for_apply_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`plan\` (${working_path.absolute_path()})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform apply by commenting <code>/apply</code> or merging this PR
`;
};

const plan_for_apply_failure_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`plan\` failed (${working_path.absolute_path()})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;
};

const plan_for_destroy_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`plan\` (${working_path.absolute_path()})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform destroy by merging this PR
`;
};

const apply_failure_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`apply\` failed (${working_path.absolute_path()})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;
};

const apply_on_comment_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`apply\` (${working_path.absolute_path()})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please merge this pull request to keep Git base branch and terraform-managed resource state in sync
`;
};

const destroy_on_merge_message = (working_path: WorkingDirectory, plan: string) => {
    return `### Terraform \`destroy\` (${working_path.absolute_path()})
<details><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>
`;
};

const destroy_on_merge_failure_message = (working_path: WorkingDirectory, plan: string, base_sha: string) => {
    return `### Terraform \`destroy\` failed (${working_path.absolute_path()})
<details open><summary>Show output</summary>

\`\`\`text

${plan}

\`\`\`

</details>

Please run terraform destroy manually (do \`git checkout ${base_sha}\` to restore \`terragrunt.hcl\`)
`;
};

const no_command = function (run_type: string) {
    return async () => { throw new Error(`Invalid run-type ${run_type}`) };
}

type CommentBodyCreator = (working_path: WorkingDirectory, result: ExecOutput, base_sha: string) => string;

const run_with_messages = function(success: CommentBodyCreator, failure: CommentBodyCreator): Command {
    return async (working_path: WorkingDirectory, result: ExecOutput, base_sha: string) => {
      let body;
      if (result.exitCode === 0) {
          body = success(working_path, result, base_sha);
      } else {
          body = failure(working_path, result, base_sha);
      }
      await gh.post_pr_comment(body);
    };
}

const plan_for_apply = run_with_messages(
    (working_path, result) => plan_for_apply_message(working_path, result.stdout),
    (working_path, result) => plan_for_apply_failure_message(working_path, result.stderr + result.stdout)
);

const plan_for_destroy = run_with_messages(
    (working_path, result) => plan_for_destroy_message(working_path, result.stdout),
    (working_path, result) => plan_for_apply_failure_message(working_path, result.stderr + result.stdout)
)

const apply_on_comment = run_with_messages(
    (working_path, result) => apply_on_comment_message(working_path, result.stdout),
    (working_path, result) => apply_failure_message(working_path, result.stderr + result.stdout),
);

const destroy_on_merge = run_with_messages(
        (working_path, result) => destroy_on_merge_message(working_path, result.stdout),
        (working_path, result, base_sha) => destroy_on_merge_failure_message(working_path, result.stderr + result.stdout, base_sha),
);
type Command = (working_path: WorkingDirectory, run_result: ExecOutput, base_sha: string) => Promise<void>;

const commands: Record<RunType, Command> = {
    'plan-for-apply': plan_for_apply,
    'plan-for-destroy': plan_for_destroy,
    'apply-on-comment': apply_on_comment,
    'destroy-on-merge': destroy_on_merge
};
