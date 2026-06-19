import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RawDisplay, { Props as RawDisplayProps } from '#components/RawDisplay';
import {
    getTextSizeClassName,
    TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export type KeyFigureTextSize = Extract<TextSizeType, '2xl' | '3xl' | '4xl'>;

interface CommonProps {
    className?: string;
    label?: React.ReactNode;
    /** De-emphasised trailing text shown beside the value (e.g. "/ 4"). */
    supplement?: React.ReactNode;
    /**
     * Font size token for the figure value, narrowed to the large end
     * of the text-size scale (the old size prop mapped sm/md/lg to
     * 2xl/3xl/4xl)
     */
    textSize?: KeyFigureTextSize;
}

export type Props = CommonProps & RawDisplayProps;

/**
 * Embeddable key figure: a large typed value over a small label
 * (specific layer).
 *
 * Value rendering is delegated to RawDisplay, so the `valueType`
 * discriminated union (boolean/number/date/text or a plain node)
 * and the per-type props come from RawDisplayProps. The big value
 * therefore inherits the value-output treatment (native `<data>` /
 * `<time>` plus a full reading for assistive tech) from the display
 * primitives.
 */
function KeyFigure(props: Props) {
    const {
        className,
        label,
        supplement,
        textSize = '3xl',
        ...rawDisplayProps
    } = props;

    return (
        <div
            className={_cs(
                styles.keyFigure,
                className,
            )}
        >
            <div className={styles.valueRow}>
                <div
                    className={_cs(
                        styles.value,
                        getTextSizeClassName(textSize),
                    )}
                >
                    <RawDisplay
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...rawDisplayProps}
                    />
                </div>
                {isDefined(supplement) && (
                    <div className={styles.supplement}>
                        {supplement}
                    </div>
                )}
            </div>
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default KeyFigure;
