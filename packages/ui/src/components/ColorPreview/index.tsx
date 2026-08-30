import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'size'> {
    elementRef?: React.RefObject<HTMLDivElement | null>;
    value: string;
    shape?: 'round' | 'square';
    size?: 'sm' | 'md' | 'lg';
}

function ColorPreview(props: Props) {
    const {
        value,
        shape = 'round',
        size = 'md',
        elementRef,
        style,
        className,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            style={{
                ...style,
                backgroundColor: value,
            }}
            className={_cs(
                styles.colorPreview,
                shape === 'round' && styles.roundShape,
                shape === 'square' && styles.squareShape,
                size === 'sm' && styles.smallSize,
                size === 'md' && styles.mediumSize,
                size === 'lg' && styles.largeSize,
                className,
            )}
        />
    );
}

export default ColorPreview;
