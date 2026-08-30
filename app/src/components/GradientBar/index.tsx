import { type RefObject } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'size'> {
    startColor: string;
    endColor: string;
    elementRef?: RefObject<HTMLDivElement | null>;
}

function GradientBar(props: Props) {
    const {
        startColor,
        endColor,
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
                background: `linear-gradient(90deg, ${startColor}, ${endColor})`,
            }}
            className={_cs(styles.gradientBar, className)}
        />
    );
}

export default GradientBar;
