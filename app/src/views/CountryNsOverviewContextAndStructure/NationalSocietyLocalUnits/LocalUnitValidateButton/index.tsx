import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    EXTERNALLY_MANAGED,
    VALIDATED,
} from '../common';

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

    if (isNotDefined(status)) {
        return null;
    }

    const isValidated = status === VALIDATED || status === EXTERNALLY_MANAGED;

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
