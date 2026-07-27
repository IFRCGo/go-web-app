import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import TextInput from './index';

describe('TextInput accessibility wiring (via InputContainer)', () => {
    it('associates label, error and required state with the control', () => {
        const { getByRole, container } = render(
            <TextInput
                name="email"
                label="Email address"
                value=""
                onChange={() => undefined}
                error="Email is required"
                required
            />,
        );

        const input = getByRole('textbox');
        const errorNode = getByRole('alert');
        const label = container.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`);

        // a real <label htmlFor> pointing at the control
        expect(label).not.toBeNull();
        expect(label).toHaveTextContent('Email address');

        // control carries invalid + required + describedby(error)
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-required', 'true');
        expect(errorNode).toHaveTextContent('Email is required');
        expect(input.getAttribute('aria-describedby') ?? '').toContain(errorNode.id);
    });
});
