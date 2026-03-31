import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    className?: string;
    children?: React.ReactNode;
    withCenteredContent?: boolean;
    elementRef?: React.RefObject<HTMLDivElement>;
    textSize?: 'sm' | 'md' | 'lg';
    withLightText?: boolean;
}

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
                textSize === 'sm' && styles.textSizeSmall,
                textSize === 'md' && styles.textSizeMedium,
                textSize === 'lg' && styles.textSizeLarge,
                withLightText && styles.withLightText,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Description;
