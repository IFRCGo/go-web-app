import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    value?: boolean | null;
    invalidText?: React.ReactNode;
}

/**
 * Renders a boolean as localised Yes/No text (raw layer).
 *
 * The root is a native `<data value>` carrying the raw boolean as the
 * machine-readable / test contract. The visible Yes/No text is not
 * lossy, so no `role="img"` / `aria-label` is added — the text reads
 * correctly on its own.
 */
function BooleanDisplay(props: Props) {
    const {
        className,
        invalidText,
        value,
    } = props;

    const strings = useTranslation(i18n);

    let content;
    if (value === true) {
        content = strings.booleanYesLabel;
    } else if (value === false) {
        content = strings.booleanNoLabel;
    } else {
        content = invalidText;
    }

    return (
        <data
            className={_cs(styles.booleanDisplay, className)}
            value={isNotDefined(value) ? '' : String(value)}
        >
            {content}
        </data>
    );
}

export default BooleanDisplay;
