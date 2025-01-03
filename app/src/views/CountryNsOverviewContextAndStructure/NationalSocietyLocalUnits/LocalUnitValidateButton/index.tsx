import { useMemo } from 'react';
import { CheckboxCircleLineIcon } from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    isValidated: boolean;
    onClick: () => void;
    hasValidatePermission: boolean;
    readOnly?: boolean
}
function LocalUnitValidateButton(props: Props) {
    const {
        isValidated,
        onClick,
        hasValidatePermission,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const validateButtonLabel = useMemo(
        () => {
            if (isValidated) {
                return strings.localUnitsValidated;
            }

            if (readOnly) {
                return strings.localUnitsNotValidated;
            }

            return strings.localUnitsValidate;
        },
        [isValidated, strings, readOnly],
    );

    return (
        <Button
            className={_cs(isValidated
                ? styles.localUnitValidatedButton
                : styles.localUnitValidateButton)}
            name={undefined}
            onClick={onClick}
            spacing="compact"
            disabled={
                !hasValidatePermission
                    || isValidated
            }
            icons={
                isValidated
                    && (
                        <CheckboxCircleLineIcon
                            className={styles.icon}
                        />
                    )
            }
        >
            {validateButtonLabel}
        </Button>
    );
}

export default LocalUnitValidateButton;
