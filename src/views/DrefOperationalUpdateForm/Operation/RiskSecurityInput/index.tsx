import {
    type ArrayError,
    useFormObject,
    getErrorObject,
    type SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { randomString } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import Button from '#components/Button';
import TextArea from '#components/TextArea';
import useTranslation from '#hooks/useTranslation';

import { type PartialOpsUpdate } from '../../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

type RiskSecurityFormFields = NonNullable<PartialOpsUpdate['risk_security']>[number];

interface Props {
    value: RiskSecurityFormFields;
    error: ArrayError<RiskSecurityFormFields> | undefined;
    onChange: (value: SetValueArg<RiskSecurityFormFields>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    disabled?: boolean;
}

function RiskSecurityInput(props: Props) {
    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
        disabled,
    } = props;

    const strings = useTranslation(i18n);

    const onFieldChange = useFormObject(
        index,
        onChange,
        () => ({
            client_id: randomString(),
        }),
    );

    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.riskSecurityInput}>
            <NonFieldError error={error} />
            <TextArea
                className={styles.input}
                label={strings.drefFormRiskSecurityRiskLabel}
                name="risk"
                value={value.risk}
                error={error?.risk}
                onChange={onFieldChange}
                disabled={disabled}
                withAsterisk
            />
            <TextArea
                className={styles.input}
                label={strings.drefFormRiskSecurityMitigationLabel}
                name="mitigation"
                value={value.mitigation}
                error={error?.mitigation}
                onChange={onFieldChange}
                disabled={disabled}
                withAsterisk
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
                disabled={disabled}
                // FIXME: use translations
                title="Delete Risk"
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default RiskSecurityInput;
