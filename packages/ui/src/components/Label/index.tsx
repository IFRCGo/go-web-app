import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type TextSize = 'sm' | 'md' | 'lg';

const textSizeToClassName: Record<TextSize, string> = {
    sm: styles.textSizeSmall,
    md: styles.textSizeMedium,
    lg: styles.textSizeLarge,
};

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'size'> {
    elementRef?: React.RefObject<HTMLDivElement | null>;
    strong?: boolean;
    textSize?: TextSize;
    withUppercaseLetters?: boolean;
}

function Label(props: Props) {
    const {
        children,
        elementRef,
        className,
        strong,
        textSize = 'md',
        withUppercaseLetters,
    } = props;

    if (!children) {
        return null;
    }

    return (
        <div
            ref={elementRef}
            className={_cs(
                styles.label,
                strong && styles.strong,
                textSizeToClassName[textSize],
                withUppercaseLetters && styles.withUppercaseLetters,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Label;
