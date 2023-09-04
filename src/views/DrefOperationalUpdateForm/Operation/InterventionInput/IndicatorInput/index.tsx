import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    type ArrayError,
    getErrorObject,
    useFormObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';

import Button from '#components/Button';
import NumberInput from '#components/NumberInput';
import TextInput from '#components/TextInput';
import useTranslation from '#hooks/useTranslation';

import { PartialDref } from '../../../schema';
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
            <div className={styles.inputs}>
                <TextInput
                    label={strings.drefFormIndicatorTitleLabel}
                    name="title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.title}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.drefFormIndicatorTargetLabel}
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                    disabled={disabled}
                />
                <NumberInput
                    label={strings.drefOperationalUpdateIndicatorActualLabel}
                    name="actual"
                    value={value.actual}
                    onChange={onFieldChange}
                    error={error?.actual}
                    disabled={disabled}
                />
            </div>
            <div>
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.drefIndicatorRemoveButtonLabel}
                    disabled={disabled}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            </div>
        </div>
    );
}

export default IndicatorInput;
