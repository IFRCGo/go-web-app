import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
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

import NonFieldError from '#components/NonFieldError';

import { PartialDref } from '../../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type PlannedInterventionFormFields = NonNullable<PartialDref['planned_interventions']>[number];
type ReadinessFormFields = NonNullable<PlannedInterventionFormFields['readiness_block']>[number];

const defaultReadinessValue: ReadinessFormFields = {
    client_id: '-1',
};

interface Props {
    value: ReadinessFormFields;
    error: ArrayError<ReadinessFormFields> | undefined;
    onChange: (value: SetValueArg<ReadinessFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function ReadinessInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultReadinessValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.readiness}>
            <NonFieldError error={error} />
            <TextInput
                label={strings.drefFormReadinessTitleLabel}
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
                disabled={disabled}
            />
            <NumberInput
                label={strings.drefFormReadinessTimeframeLabel}
                name="timeframe"
                value={value.timeframe}
                onChange={onFieldChange}
                error={error?.timeframe}
                disabled={disabled}
            />
            <Button
                name={index}
                onClick={onRemove}
                variant="tertiary"
                title={strings.drefReadinessRemoveButtonLabel}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default ReadinessInput;
