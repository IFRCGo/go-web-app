import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import Checkbox from './index';

describe('Checkbox', () => {
    it('reflects the indeterminate state on the native input and aria-checked', () => {
        const { getByRole } = render(
            <Checkbox
                name="accept"
                label="Accept"
                value={false}
                onChange={() => undefined}
                indeterminate
            />,
        );

        const input = getByRole('checkbox') as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
        expect(input).toHaveAttribute('aria-checked', 'mixed');
    });
});
