import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import { VALIDATED } from '../common';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    status: number | undefined;
    onClick: () => void;
    hasValidatePermission: boolean;
}
function LocalUnitValidateButton(props: Props) {
    const {
        status,
        onClick,
        hasValidatePermission,
    } = props;

    const strings = useTranslation(i18n);

    const isValidated = status === VALIDATED;

    if (isValidated || !hasValidatePermission) {
        return null;
    }

    return (
        <Button
            className={_cs(isValidated
                ? styles.localUnitValidatedButton
                : styles.localUnitValidateButton)}
            name={undefined}
            onClick={onClick}
            spacing="sm"
            disabled={
                !hasValidatePermission
                || isValidated
            }
        >
            {strings.localUnitReviewButtonLabel}
        </Button>
    );
}

export default LocalUnitValidateButton;
