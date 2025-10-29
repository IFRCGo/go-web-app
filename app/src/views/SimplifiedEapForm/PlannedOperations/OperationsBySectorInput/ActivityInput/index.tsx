import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    TextArea,
} from '@ifrc-go/ui';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

import { type PartialSimplifiedEapType } from '../../../schema';

type PlannedInterventionFormFields = NonNullable<PartialSimplifiedEapType['planned_operations']>[number];
type IndicatorFormFields = NonNullable<PlannedInterventionFormFields['early_action_activities']>[number];

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
}

function ActivityInput(props: Props) {
    const {
        error: errorFromProps,
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
        <div>
            <NonFieldError error={error} />
            <TextArea
                label="Readiness"
                name="activity"
                value={value.activity}
                error={error?.activity}
                onChange={onFieldChange}
                disabled={disabled}
                withAsterisk
            />
            {/* TODO: Add timespan component */}
            <Button
                name={index}
                onClick={onRemove}
                variant="tertiary"
                title="Remove"
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default ActivityInput;
