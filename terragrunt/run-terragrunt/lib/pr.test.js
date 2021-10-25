jest.mock('./gh');

const gh = require('./gh');
const pr = require('./pr');

const plan_message =
    `### Terraform \`plan\` (working/path)
<details><summary>Show output</summary>

\`\`\`text

stdout

\`\`\`

</details>

Please review the plan above, ask code owners to approve this pull request, and then run terraform apply by commenting <code>/apply</code> or merging this PR
`

const fail_plain_message =
    `### Terraform \`plan\` failed (working/path)
<details open><summary>Show output</summary>

\`\`\`text

stderrstdout

\`\`\`
</details>

Please fix <code>terragrunt.hcl</code> inputs/module. Terraform plan is then automatically run again
`;

describe('plan-for-apply', () => {
    test('when successful', async() => {
        let result = {
            exitCode: 0,
            stdout: "stdout",
            stderr: "stderr"
        };
        await pr.comment('plan-for-apply', 'working/path', result);

        expect(gh.post_pr_comment).toHaveBeenLastCalledWith(plan_message);
    });

    test( 'when not successful', async () => {
        let result = {
            exitCode: 1,
            stdout: "stdout",
            stderr: "stderr"
        };

        await pr.comment('plan-for-apply', 'working/path', result);

        expect(gh.post_pr_comment).toHaveBeenLastCalledWith(fail_plain_message);
    });

})
