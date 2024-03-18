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
type EarlyResponseFormFields = NonNullable<PlannedInterventionFormFields['early_response_block']>[number];

const defaultEarlyResponseValue: EarlyResponseFormFields = {
    client_id: '-1',
};

interface Props {
    value: EarlyResponseFormFields;
    error: ArrayError<EarlyResponseFormFields> | undefined;
    onChange: (value: SetValueArg<EarlyResponseFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function EarlyResponseInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultEarlyResponseValue);

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.earlyResponse}>
            <NonFieldError error={error} />
            <TextInput
                className={styles.titleInput}
                label={strings.drefFormEarlyResponseTitleLabel}
                name="title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
                disabled={disabled}
            />
            <NumberInput
                className={styles.numberInput}
                label={strings.drefFormEarlyResponseTimeframeLabel}
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
                title={strings.drefEarlyResponseRemoveButtonLabel}
                disabled={disabled}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default EarlyResponseInput;
