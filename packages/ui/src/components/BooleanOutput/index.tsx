import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    value?: boolean | null;
    invalidText?: React.ReactNode;
}

function BooleanOutput(props: Props) {
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
        <div className={_cs(styles.booleanOutput, className)}>
            {content}
        </div>
    );
}

export default BooleanOutput;
