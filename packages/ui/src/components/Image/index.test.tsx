import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import Image from './index';

describe('Image accessibility', () => {
    it('keeps the content image accessible (alt preserved, no presentation role)', () => {
        const { container } = render(<Image src="/x.png" alt="A map of the region" />);
        const img = container.querySelector('img');

        expect(img).not.toBeNull();
        expect(img).toHaveAttribute('alt', 'A map of the region');
        expect(img).not.toHaveAttribute('role', 'presentation');
    });

    it('exposes a keyboard-operable, named button when expandable', () => {
        const { getByRole } = render(<Image src="/x.png" alt="A map" expandable />);

        expect(getByRole('button', { name: 'Expand image' })).toBeInTheDocument();
    });
});
