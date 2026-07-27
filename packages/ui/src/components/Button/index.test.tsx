import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import Button from './index';

describe('Button', () => {
    it('is queryable by role + accessible name and fires onClick', async () => {
        const handleClick = vi.fn();
        const { getByRole } = render(
            <Button name="save" onClick={handleClick}>
                Save
            </Button>,
        );

        const button = getByRole('button', { name: 'Save' });
        expect(button).toBeEnabled();

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('reflects the disabled state', () => {
        const { getByRole } = render(
            <Button name="save" disabled>
                Save
            </Button>,
        );

        expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    });
});
