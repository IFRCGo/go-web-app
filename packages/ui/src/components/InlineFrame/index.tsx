import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLIFrameElement>, 'ref' | 'size'> {
    elementRef?: React.RefObject<HTMLIFrameElement | null>;
    size?: 'sm' | 'md' | 'lg';
}

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
