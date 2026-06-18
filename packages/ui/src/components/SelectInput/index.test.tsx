import { render } from '@testing-library/react';
import {
    describe,
    expect,
    it,
} from 'vitest';

import SelectInput from './index';

interface Option {
    id: string;
    label: string;
}

const options: Option[] = [
    { id: 'a', label: 'Apple' },
    { id: 'b', label: 'Banana' },
];

describe('SelectInput combobox semantics', () => {
    it('exposes a labelled combobox with a collapsed state', () => {
        const { getByRole, container } = render(
            <SelectInput
                name="fruit"
                label="Fruit"
                options={options}
                keySelector={(option) => option.id}
                labelSelector={(option) => option.label}
                value={undefined}
                onChange={() => undefined}
            />,
        );

        const combobox = getByRole('combobox');
        expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
        expect(combobox).toHaveAttribute('aria-expanded', 'false');

        // label is associated with the combobox control
        const label = container.querySelector<HTMLLabelElement>(`label[for="${combobox.id}"]`);
        expect(label).not.toBeNull();
        expect(label).toHaveTextContent('Fruit');
    });
});
