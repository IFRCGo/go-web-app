import {
    addSeparator as addCommaSeparator,
    formattedNormalize,
    _cs,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    value: number;
    normalize?: boolean;
    addSeparator?: boolean;
    fixedTo?: number;
    className?: string;
}

function FormattedNumber(props: Props) {
    const {
        value,
        normalize,
        addSeparator,
        fixedTo,
        className,
    } = props;

    let displayNumber = value;
    let suffix;
    let displayCommaNumber = '-';

    if (value && !isNaN(value)) {
        if (normalize) {
            const {
                number,
                normalizeSuffix,
            } = formattedNormalize(value);

            displayNumber = number;
            suffix = normalizeSuffix;
        }

        if (addSeparator) {
            displayCommaNumber = addCommaSeparator(displayNumber);
        }

        if (fixedTo) {
            const shouldFix = ((displayNumber - Math.floor(displayNumber)) !== 0);
            displayCommaNumber = Number.parseFloat(String(displayNumber)).toFixed(shouldFix ? fixedTo : 0);
        }
    }

    return (
        <div className={_cs(className, styles.formattedNumber)}>
            <div className={styles.tcNumber}>
                {displayNumber ?? displayCommaNumber}
            </div>
            {suffix && (
                <div className={styles.tcNumberSuffix}>
                    {suffix}
                </div>
            )}
        </div>
    );
}

export default FormattedNumber;
