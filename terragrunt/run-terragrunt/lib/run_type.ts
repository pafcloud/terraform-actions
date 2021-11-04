// This is a 'hack' to achieve an iterable union type
const run_types = ['plan-for-apply', 'plan-for-destroy', 'apply-on-comment', 'destroy-on-merge', 'apply-on-merge'] as const;
export type RunType = typeof run_types[number];

export const parse = function(maybe_run_type: string) : RunType {
    const found = run_types.find(valid_type => valid_type === maybe_run_type);
    if (found) {
        return found;
    }
    throw new Error(`${maybe_run_type} is not a valid run type`);
}

export default RunType;
