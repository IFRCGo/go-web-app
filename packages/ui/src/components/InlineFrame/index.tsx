import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLIFrameElement>, 'ref' | 'size'> {
    /** Ref to the root DOM node (the iframe element) */
    elementRef?: React.RefObject<HTMLIFrameElement | null>;
    /**
     * Physical dimensions of the frame (max-width/max-height presets,
     * default 'md'). This is true size semantics, not a style variant.
     */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Specific component for embedding an external document in an iframe
 * with preset physical dimensions.
 */
function InlineFrame(props: Props) {
    const {
        className,
        elementRef,
        title = 'Embedded document',
        size = 'md',
        ...otherProps
    } = props;

    return (
        <iframe
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            title={title}
            className={_cs(
                styles.inlineFrame,
                className,
                size === 'sm' && styles.smSize,
                size === 'md' && styles.mdSize,
                size === 'lg' && styles.lgSize,
            )}
            ref={elementRef}
        />
    );
}

export default InlineFrame;
