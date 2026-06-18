import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import PasswordInput from './index';

describe('PasswordInput', () => {
    it('gives the show/hide toggle an accessible name and pressed state', () => {
        const { getByRole } = render(
            <PasswordInput
                name="pw"
                value=""
                onChange={() => undefined}
                label="Password"
            />,
        );

        const toggle = getByRole('button', { name: 'Show password' });
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });
});
