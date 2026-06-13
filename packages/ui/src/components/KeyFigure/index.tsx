import { _cs } from '@togglecorp/fujs';

import RawOutput, { Props as RawOutputProps } from '#components/RawOutput';
import {
    getTextSizeClassName,
    TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export type KeyFigureTextSize = Extract<TextSizeType, '2xl' | '3xl' | '4xl'>;

interface CommonProps {
    className?: string;
    label?: React.ReactNode;
    /**
     * Font size token for the figure value, narrowed to the large end
     * of the text-size scale (the old size prop mapped sm/md/lg to
     * 2xl/3xl/4xl)
     */
    textSize?: KeyFigureTextSize;
}

export type Props = CommonProps & RawOutputProps;

/**
 * Embeddable key figure: a large typed value over a small label
 * (specific layer).
 *
 * Value rendering is delegated to RawOutput, so the `valueType`
 * discriminated union (boolean/number/date/text or a plain node)
 * and the per-type props come from RawOutputProps.
 */
function KeyFigure(props: Props) {
    const {
        className,
        label,
        textSize = '3xl',
        ...rawOutputProps
    } = props;

    return (
        <div
            className={_cs(
                styles.keyFigure,
                className,
            )}
        >
            <div
                className={_cs(
                    styles.value,
                    getTextSizeClassName(textSize),
                )}
            >
                <RawOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawOutputProps}
                />
            </div>
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default KeyFigure;
