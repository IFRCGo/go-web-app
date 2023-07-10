import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    ArrayError,
    getErrorObject,
    useFormObject,
    SetValueArg,
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
}

function IndicatorInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
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
                />
                <NumberInput
                    label={strings.drefFormIndicatorTargetLabel}
                    name="target"
                    value={value.target}
                    onChange={onFieldChange}
                    error={error?.target}
                />
            </div>
            <div>
                <Button
                    name={index}
                    onClick={onRemove}
                    variant="tertiary"
                    title={strings.drefIndicatorRemoveButtonLabel}
                >
                    <DeleteBinTwoLineIcon />
                </Button>
            </div>
        </div>
    );
}

export default IndicatorInput;
