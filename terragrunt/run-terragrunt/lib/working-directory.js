class WorkingDirectory {
    constructor(workspace, relative_path) {
        this.workspace = workspace;
        this.relative_path = relative_path;
    }

    absolute_path() {
        return `${this.workspace}/${this.relative_path}`
    }
}

module.exports = WorkingDirectory;
