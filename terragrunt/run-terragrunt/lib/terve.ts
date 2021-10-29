import * as io from '@actions/io';
import { exec } from '@actions/exec';
import { chmodSync, readFileSync } from 'fs';
import * as core from '@actions/core';
import * as findUp from 'find-up';
import { chdir, env } from 'process';
import WorkingDirectory from "./working-directory";

const prepare = async function() {
    const terve_etc = `${env.HOME}/.terve/etc`;
    const hashicorp_key = `${terve_etc}/terraform.asc`;

    await io.mkdirP(terve_etc);

    await exec('gpg --keyserver keyserver.ubuntu.com --recv-keys 72D7468F');
    await exec(`gpg --export -a --output ${hashicorp_key} 72D7468F`);

    chmodSync(hashicorp_key, '0444');
}

export const install = async function(version: string) : Promise<void> {
    await prepare();

    const base_url = 'https://github.com/superblk/terve/releases/download';

    const get_artifact_url = function (artifact) {
        return `${base_url}/v${version}/${artifact}`
    };

    const download = async function (artifact) {
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

const readFileOrDefault = async function(path: string, default_value: string) : Promise<string> {
    const file = await findUp.default(path); // This looks funky b/c of some kind of incompatibility between this version of findUp and ES modules
    if(!file) {
        return default_value;
    }
    return readFileSync(file, 'utf-8').trim() || default_value.trim();
}

interface TerraVersions {
    terraform_version: string,
    terragrunt_version: string
}

const resolveVersions = async function(default_tf: string, default_tg) : Promise<TerraVersions> {
    const terraform_version = await readFileOrDefault('.terraform-version', default_tf);
    const terragrunt_version = await readFileOrDefault('.terragrunt-version', default_tg);
    return { terraform_version, terragrunt_version }
}

export const setup = async function(working_directory: WorkingDirectory, default_tf: string, default_tg: string) : Promise<void> {
    chdir(working_directory.absolute_path());
    const { terragrunt_version, terraform_version } = await resolveVersions(default_tf, default_tg);
    core.info(`Preparing to install terraform ${terraform_version} and terragrunt ${terragrunt_version}`);
    await exec("terve", ['install', 'tf', terraform_version]);
    await exec("terve", ['install', 'tg', terragrunt_version]);
    await exec("terve", ['select', 'tf', terraform_version]);
    await exec("terve", ['select', 'tg', terragrunt_version]);
}
