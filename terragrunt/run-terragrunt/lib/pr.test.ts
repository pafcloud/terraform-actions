import { jest } from '@jest/globals';

jest.mock('./gh');

import * as gh from './gh';
import * as pr from './pr';

beforeEach(() => {
    jest.clearAllMocks();
});

const successfulResult = {
    exitCode: 0,
    stdout: "stdout",
    stderr: "stderr"
};
const failedResult = {
    exitCode: 1,
    stdout: "stdout",
    stderr: "stderr"
};

describe('.comment', () => {
    describe('plan-for-apply', () => {
        test('when successful', async() => {
            await pr.comment('plan-for-apply', 'working/path', successfulResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(plan_message);
        });

        test( 'when not successful', async () => {
            await pr.comment('plan-for-apply', 'working/path', failedResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(plan_failure);
        });
    });

    describe('plan-for-destroy', () => {
        test('when successful', async () => {
            await call_pr_comment_with('plan-for-destroy', successfulResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(plan_for_destroy_message);
        });

        test('when not successful', async () => {
            await pr.comment('plan-for-destroy', 'working/path', failedResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(plan_failure);
        });
    });

    describe('apply-on-comment', () => {
        test('when successful', async () => {
            await call_pr_comment_with('apply-on-comment', successfulResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(apply_on_comment_message);
        });

        test('when not successful', async () => {
            await pr.comment('apply-on-comment', 'working/path', failedResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(apply_failure);
        });
    });

    describe('destroy-on-merge', () => {
       test('when successful', async () => {
          await call_pr_comment_with('destroy-on-merge', successfulResult);

          expect(gh.post_pr_comment).toHaveBeenLastCalledWith(destroy_on_merge_comment);
       });

        test('when successful', async () => {
            (gh.base_sha as jest.Mock).mockReturnValue(Promise.resolve('base_sha'));

            await call_pr_comment_with('destroy-on-merge', failedResult);

            expect(gh.post_pr_comment).toHaveBeenLastCalledWith(destroy_on_merge_failure_comment);
        });
    });
});

const call_pr_comment_with = async function (run_type, result) {
    await pr.comment(run_type, 'working/path', result);
};

const plan_message =
    `### Terraform \`plan\` (working/path)
<details><summary>Show output</summary>

\`\`\`text

stdout

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform apply by commenting <code>/apply</code> or merging this PR
`

const plan_failure =
    `### Terraform \`plan\` failed (working/path)
<details open><summary>Show output</summary>

\`\`\`text

stderrstdout

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;

const plan_for_destroy_message =
    `### Terraform \`plan\` (working/path)
<details><summary>Show output</summary>

\`\`\`text

stdout

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform destroy by merging this PR
`;

const apply_on_comment_message =
    `### Terraform \`apply\` (working/path)
<details><summary>Show output</summary>

\`\`\`text

stdout

\`\`\`

</details>

Please merge this pull request to keep Git base branch and terraform-managed resource state in sync
`;

const apply_failure =
    `### Terraform \`apply\` failed (working/path)
<details open><summary>Show output</summary>

\`\`\`text

stderrstdout

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;

const destroy_on_merge_comment =
    `### Terraform \`destroy\` (working/path)
<details><summary>Show output</summary>

\`\`\`text

stdout

\`\`\`

</details>
`;

const destroy_on_merge_failure_comment =
    `### Terraform \`destroy\` failed (working/path)
<details open><summary>Show output</summary>

\`\`\`text

stderrstdout

\`\`\`

</details>

Please run terraform destroy manually (do \`git checkout base_sha\` to restore \`terragrunt.hcl\`)
`;
