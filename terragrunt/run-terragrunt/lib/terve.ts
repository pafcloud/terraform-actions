import * as io from '@actions/io';
import { exec } from '@actions/exec';
import { chmodSync, readFileSync } from 'fs';
import * as core from '@actions/core';
import * as findUp from 'find-up';
import { chdir, env } from 'process';

let prepare = async function() {
    let terve_etc = `${env.HOME}/.terve/etc`;
    let hashicorp_key = `${terve_etc}/terraform.asc`;

    await io.mkdirP(terve_etc);

    await exec('gpg --keyserver keyserver.ubuntu.com --recv-keys 72D7468F');
    await exec(`gpg --export -a --output ${hashicorp_key} 72D7468F`);

    chmodSync(hashicorp_key, '0444');
}

export let install = async function(version) {
    await prepare();

    let base_url = 'https://github.com/superblk/terve/releases/download';

    let get_artifact_url = function (artifact) {
        return `${base_url}/v${version}/${artifact}`
    };

    let download = async function (artifact) {
        await exec(`curl -L -o ${artifact} ${get_artifact_url(artifact)}`);
    }

    await Promise.all([
        download('terve_linux_amd64'),
        download('SHA256SUMS')]);

    await exec('sha256sum -c --ignore-missing SHA256SUMS');

    await io.cp('terve_linux_amd64', '/usr/local/bin/terve');
    chmodSync('/usr/local/bin/terve', '0700');

    await exec("terve", ['--bootstrap']);

    core.addPath(`${env.HOME}/.terve/bin`)
}

let readFileOrDefault = async function(path, default_value) {
    let file = await findUp.default(path); // This looks funky b/c of some kind of incompatibility between this version of findUp and ES modules
    if(!file) {
        return default_value;
    }
    return readFileSync(file, 'utf-8').trim() || default_value.trim();
}

let resolveVersions = async function(default_tf, default_tg) {
    let terraform_version = await readFileOrDefault('.terraform-version', default_tf);
    let terragrunt_version = await readFileOrDefault('.terragrunt-version', default_tg);
    return { terraform_version, terragrunt_version }
}

export let setup = async function(working_directory, default_tf, default_tg) {
    chdir(working_directory.absolute_path());
    let { terragrunt_version, terraform_version } = await resolveVersions(default_tf, default_tg);
    core.info(`Preparing to install terraform ${terraform_version} and terragrunt ${terragrunt_version}`);
    await exec("terve", ['install', 'tf', terraform_version]);
    await exec("terve", ['install', 'tg', terragrunt_version]);
    await exec("terve", ['select', 'tf', terraform_version]);
    await exec("terve", ['select', 'tg', terragrunt_version]);
}
