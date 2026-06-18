import { useState } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    describe,
    expect,
    it,
} from 'vitest';

import RadioInput from './index';

interface Option {
    key: string;
    label: string;
}

const options: Option[] = [
    { key: 'a', label: 'Option A' },
    { key: 'b', label: 'Option B' },
];

function ControlledRadioInput() {
    const [value, setValue] = useState<string | undefined>('a');
    return (
        <RadioInput
            name="pick"
            label="Pick one"
            options={options}
            keySelector={(option) => option.key}
            labelSelector={(option) => option.label}
            value={value}
            clearable
            onChange={(next) => setValue(next)}
        />
    );
}

describe('RadioInput', () => {
    it('names the group and shares a native radio name across options', () => {
        const { getByRole, getAllByRole } = render(<ControlledRadioInput />);

        expect(getByRole('radiogroup')).toHaveAccessibleName('Pick one');

        const radios = getAllByRole('radio') as HTMLInputElement[];
        expect(radios).toHaveLength(2);
        // a shared name makes them one native radio group (arrow-key nav)
        expect(radios[0].name).toBe(radios[1].name);
    });

    it('selects via change (keyboard-operable native radio)', async () => {
        const { getAllByRole } = render(<ControlledRadioInput />);
        const radios = getAllByRole('radio') as HTMLInputElement[];

        await userEvent.click(radios[1]);

        expect(radios[1].checked).toBe(true);
    });
});
