import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import {
    Button,
    TextArea,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { randomString } from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';

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
                title={strings.drefOperationalUpdateFormDeleteRisk}
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default RiskSecurityInput;
