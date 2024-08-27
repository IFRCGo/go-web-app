import { Checkbox } from '@ifrc-go/ui';

interface Option {
    key: number;
    label: string;
}

export interface Props {
    options: Option;
    value: Record<number, boolean>;
    onChange: (value: boolean, name: number) => void;
}

function LayerDetails(props: Props) {
    const {
        options,
        value,
        onChange,
    } = props;

    return (
        <Checkbox
            label={options.label}
            key={options.key}
            name={options.key}
            value={!!value[options.key]}
            onChange={onChange}
        />
    );
}

export default LayerDetails;
