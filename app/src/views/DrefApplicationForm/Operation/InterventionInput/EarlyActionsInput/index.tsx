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
type EarlyActionsFormFields = NonNullable<PlannedInterventionFormFields['early_action_block']>[number];

const defaultEarlyActionsValue: EarlyActionsFormFields = {
    client_id: '-1',
};

interface Props {
    value: EarlyActionsFormFields;
    error: ArrayError<EarlyActionsFormFields> | undefined;
    onChange: (value: SetValueArg<EarlyActionsFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function EarlyActionsInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultEarlyActionsValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.earlyActions}>
            <NonFieldError error={error} />
            <TextInput
                className={styles.titleInput}
                label={strings.drefFormEarlyActionsTitleLabel}
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
                disabled={disabled}
            />
            <NumberInput
                className={styles.numberInput}
                label={strings.drefFormEarlyActionsTimeframeLabel}
                name="timeframe"
                value={value.timeframe}
                onChange={onFieldChange}
                error={error?.timeframe}
                disabled={disabled}
            />
            <Button
                name={index}
                className={styles.removeButton}
                onClick={onRemove}
                variant="tertiary"
                title={strings.drefEatlyActionsRemoveButtonLabel}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default EarlyActionsInput;
