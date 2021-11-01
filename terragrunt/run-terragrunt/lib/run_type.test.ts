import { parse } from './run_type';

describe('parseRunType', () => {
    ['apply-on-comment', 'plan-for-apply', 'plan-for-destroy', 'destroy-on-merge'].forEach(run_type => {
        describe(`when argument is ${run_type}`, () => {
            it('returns true', () => {
                const parsed_run_type = parse(run_type);
                expect(typeof parsed_run_type).not.toBeNull();
                expect(parsed_run_type.toString()).toEqual(run_type);
            });
        });
    });

    describe('when argument is invalid', () => {
       it('returns false', () => {
           expect(() => { parse('foobar') }).toThrowError('foobar');
       });
    });
});
