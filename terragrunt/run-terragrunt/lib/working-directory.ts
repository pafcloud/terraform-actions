export default class WorkingDirectory {
    workspace: string;
    relative_path: string;
    constructor(workspace, relative_path) {
        this.workspace = workspace;
        this.relative_path = relative_path;
    }

    absolute_path(): string {
        return `${this.workspace}/${this.relative_path}`
    }
}
