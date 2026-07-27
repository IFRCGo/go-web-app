import { _cs } from '@togglecorp/fujs';

import {
    getTextSizeClassName,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    className?: string;
    children?: React.ReactNode;
    /** Center the text and cap its width to the content max-width */
    withCenteredContent?: boolean;
    /** Ref to the root DOM node */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Text size token from the shared scale (default 'md') */
    textSize?: Extract<TextSizeType, 'xs' | 'sm' | 'md' | 'lg'>;
    /** Render in the light (muted) text color */
    withLightText?: boolean;
}

/**
 * Generic typography component for secondary, descriptive body text.
 */
function Description(props: Props) {
    const {
        className,
        children,
        withCenteredContent,
        elementRef,
        textSize = 'md',
        withLightText,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                styles.description,
                withCenteredContent && styles.withCenteredContent,
                getTextSizeClassName(textSize),
                withLightText && styles.withLightText,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Description;
