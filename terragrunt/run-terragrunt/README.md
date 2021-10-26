# Run Terragrunt 

 This action uses Terve to install Terraform and Terragrunt. It can be used to run plan,
apply and destroy. 

 It will post the result of running the Terragrunt command as PR comments. 
 
## Why does this action exist? 
 Previously we have been using the Hashicorp action to set up Terraform. This action creates a
wrapper script around the Terraform binary. This wrapper exposes `stderror`, `stdout` and the 
`exit_code` as GitHub actions outputs. This is useful, but it makes impossible to use the `dependency`
blocks in Terragrunt modules. You can disable the wrapper but that makes really difficult to access 
`stderror` and `stdout` as action outputs.
 
The goal of this action is to support `dependency` blocks and not having to deal with `stderror`, `stdout` and 
`exit_code` as outputs.  

## Developing

The action is written in javascript and compiled to a single file (`dist/index.js`) using `ncc`. 

After making your changes, please compile by running `npm run prepare` and make sure you commit `dist/index.js`.

### Git hooks

There's git hook provided in [.githooks/pre-commit].

The hook will make sure that the code is compiled if any js file has been changed.

To install it, run this:

```bash
$ cd terraform-actions # Run it in the root of the repo
$ git config core.hooksPath .githooks
```
