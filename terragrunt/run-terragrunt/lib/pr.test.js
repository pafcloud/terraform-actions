jest.mock('./gh');

const gh = require('./gh');
const pr = require('./pr');

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
});

let call_pr_comment_with = async function (run_type, result) {
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
