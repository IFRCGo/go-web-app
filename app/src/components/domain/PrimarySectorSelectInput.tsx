import {
    SelectInput,
    SelectInputProps,
} from '@ifrc-go/ui';

import { useRequest } from '#utils/restRequest';

type Sector = {
    key: number;
    label: string;
};

const keySelector = (d: Sector) => d.key;
const labelSelector = (d: Sector) => d.label;

type Props<NAME> = SelectInputProps<
    number,
    NAME,
    Sector,
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'|'placeholder'
> & {
    className?: string;
    placeholder?:string,
    name: NAME;
    onChange: (newValue: number | undefined, name: NAME) => void;
    value: number | undefined | null;
}

function PrimarySectorSelectInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        placeholder,
        onChange,
        value,
        className,
    } = props;

    const {
        response: PrimarySectorOptions,
        pending: PrimarySectorOptionsPending,
    } = useRequest({
        url: '/api/v2/primarysector',
        preserveResponse: true,
    });

    return (
        <SelectInput
            placeholder={placeholder}
            className={className}
            name={name}
            keySelector={keySelector}
            labelSelector={labelSelector}
            options={PrimarySectorOptions}
            optionsPending={PrimarySectorOptionsPending}
            value={value}
            onChange={onChange}
        />
    );
}

export default PrimarySectorSelectInput;
