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

import { type PartialDref } from '../../../schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

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
}

function IndicatorInput(props: Props) {
    const strings = useTranslation(i18n);

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
        <div className={styles.indicator}>
            <NonFieldError error={error} />
            <TextInput
                className={styles.titleInput}
                label={strings.drefFormIndicatorTitleLabel}
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
                disabled={disabled}
            />
            <NumberInput
                className={styles.numberInput}
                label={strings.drefFormIndicatorTargetLabel}
                name="target"
                value={value.target}
                onChange={onFieldChange}
                error={error?.target}
                disabled={disabled}
            />
            <Button
                name={index}
                className={styles.removeButton}
                onClick={onRemove}
                variant="tertiary"
                title={strings.drefIndicatorRemoveButtonLabel}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default IndicatorInput;
