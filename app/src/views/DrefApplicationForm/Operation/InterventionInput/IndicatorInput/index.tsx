import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    InlineLayout,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import { type PartialDref } from '../../../schema';

import i18n from './i18n.json';

type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type IndicatorFormFields = NonNullable<PlannedInterventionFormFields['indicators']>[number];

const defaultIndicatorValue: IndicatorFormFields = {
    client_id: '-1',
};

interface Props {
    value: IndicatorFormFields;
    error: ArrayError<IndicatorFormFields> | undefined;
    onChange: (value: SetValueArg<IndicatorFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function IndicatorInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        readOnly,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultIndicatorValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <InlineLayout
            after={(
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.drefIndicatorRemoveButtonLabel}
                    disabled={disabled || readOnly}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            )}
            spacing="sm"
        >
            <ListView
                layout="grid"
                spacing="sm"
            >
                <TextInput
                    label={strings.drefFormIndicatorTitleLabel}
                    name="title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <NumberInput
                    label={strings.drefFormIndicatorTargetLabel}
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </ListView>
        </InlineLayout>
    );
}

export default IndicatorInput;
