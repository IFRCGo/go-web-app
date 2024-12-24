import {
    SelectInput,
    type SelectInputProps,
} from '@ifrc-go/ui';

import { type DisasterTypes } from '#contexts/domain';
import useDisasterType from '#hooks/domain/useDisasterType';

export type DisasterTypeItem = NonNullable<DisasterTypes['results']>[number];

function keySelector(type: DisasterTypeItem) {
    return type.id;
}
function labelSelector(type: DisasterTypeItem) {
    return type.name ?? '?';
}

type Props<NAME> = SelectInputProps<
    number,
    NAME,
    DisasterTypeItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    'value' | 'name' | 'options' | 'keySelector' | 'labelSelector'
> & {
    className?: string;
    name: NAME;
    onChange: (
        newValue: number | undefined,
        name: NAME,
        option: DisasterTypeItem | undefined,
    ) => void;
    value: number | undefined | null;
    optionsFilter?: (item: DisasterTypeItem) => boolean;
}

function DisasterTypeSelectInput<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        onChange,
        value,
        optionsFilter,
        ...otherProps
    } = props;

    const disasterTypes = useDisasterType();

    const options = optionsFilter
        ? disasterTypes?.filter(optionsFilter)
        : disasterTypes;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={className}
            name={name}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            value={value}
            onChange={onChange}
        />
    );
}

export default DisasterTypeSelectInput;
