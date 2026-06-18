import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import NumberDisplay from './index';

describe('NumberDisplay accessible value-output contract', () => {
    it('exposes the raw value on the native <data> element (machine/test contract)', () => {
        const { container } = render(<NumberDisplay value={42} />);
        const el = container.querySelector('data');

        expect(el).not.toBeNull();
        // native attribute is the test hook — read el.value, not the text
        expect(el).toHaveAttribute('value', '42');
        // visible text already equals the full reading -> plain <data>, no role
        expect(el).not.toHaveAttribute('role');
        expect(el).not.toHaveAttribute('aria-label');
    });

    it('adds role="img" + full-reading aria-label when the compact text is lossy', () => {
        const { getByRole } = render(<NumberDisplay value={1500000} compact />);
        const el = getByRole('img');

        expect(el).toHaveAttribute('value', '1500000');
        expect(el).toHaveAttribute('aria-label', '1,500,000');
        expect(el.textContent).toMatch(/M/);
    });
});
