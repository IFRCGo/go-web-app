import { _cs } from '@togglecorp/fujs';

import {
    getTextSizeClassName,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'size'> {
    /** Ref to the root DOM node */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Use the medium font weight */
    strong?: boolean;
    /** Text size token from the shared scale (default 'md') */
    textSize?: Extract<TextSizeType, 'sm' | 'md' | 'lg'>;
    /** Transform the label text to uppercase */
    withUppercaseLetters?: boolean;
}

/**
 * DisplayLabel is a generic typography component for short labelling text.
 * It is presentational only (not a form `<label>` — use InputLabel for that).
 * Renders nothing when there are no children.
 */
function DisplayLabel(props: Props) {
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
                getTextSizeClassName(textSize),
                withUppercaseLetters && styles.withUppercaseLetters,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default DisplayLabel;
