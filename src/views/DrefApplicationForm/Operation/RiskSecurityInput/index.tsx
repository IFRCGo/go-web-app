import {
    ArrayError,
    useFormObject,
    getErrorObject,
    SetValueArg,
} from '@togglecorp/toggle-form';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';

import { randomString } from '@togglecorp/fujs';

import Button from '#components/Button';
import TextArea from '#components/TextArea';
import useTranslation from '#hooks/useTranslation';

import { PartialDref } from '../../schema';
import i18n from './i18n.json';
import styles from './styles.module.css';

type RiskSecurityFormFields = NonNullable<PartialDref['risk_security']>[number];

const defaultCountryDistrictValue: RiskSecurityFormFields = {
    client_id: randomString(),
};

interface Props {
  value: RiskSecurityFormFields;
  error: ArrayError<RiskSecurityFormFields> | undefined;
  onChange: (value: SetValueArg<RiskSecurityFormFields>, index: number) => void;
  onRemove: (index: number) => void;
  index: number;
}

function RiskSecurityInput(props: Props) {
    const strings = useTranslation(i18n);

    const {
        error: errorFromProps,
        onChange,
        value,
        index,
        onRemove,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultCountryDistrictValue);
    const error = (value && value.client_id && errorFromProps)
        ? getErrorObject(errorFromProps?.[value.client_id])
        : undefined;

    return (
        <div className={styles.riskSecurityInput}>
            <TextArea
                label={strings.drefFormRiskSecurityRiskLabel}
                name="risk"
                value={value.risk}
                error={error?.risk}
                onChange={onFieldChange}
            />
            <TextArea
                label={strings.drefFormRiskSecurityMitigationLabel}
                name="mitigation"
                value={value.mitigation}
                error={error?.mitigation}
                onChange={onFieldChange}
            />
            <Button
                className={styles.removeButton}
                name={index}
                onClick={onRemove}
                variant="tertiary"
            >
                <DeleteBinTwoLineIcon />
            </Button>
        </div>
    );
}

export default RiskSecurityInput;
