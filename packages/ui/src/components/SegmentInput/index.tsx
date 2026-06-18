import { _cs } from '@togglecorp/fujs';

import ButtonLayout, { Props as ButtonLayoutProps } from '#components/ButtonLayout';
import RadioInput, { CommonProps as RadioInputProps } from '#components/RadioInput';
import { Props as RadioProps } from '#components/RadioInput/Radio';
import RawButton from '#components/RawButton';

import styles from './styles.module.css';

// Note: more props can be picked as per requirement
export interface SegmentProps<NAME> extends RadioProps<NAME | 'children'>, Omit<ButtonLayoutProps, 'styleVariant' | 'colorVariant'> {
    name: NAME;
    children?: React.ReactNode;
}

function Segment<NAME>(props: SegmentProps<NAME>) {
    const {
        name,
        onClick,
        value,
        className,
        inputName, // eslint-disable-line @typescript-eslint/no-unused-vars
        children,
        ...otherProps
    } = props;

    return (
        <RawButton
            className={styles.rawButton}
            name={name}
            onClick={onClick}
            role="radio"
            aria-checked={value}
        >
            <ButtonLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                className={_cs(
                    styles.segment,
                    value && styles.active,
                    className,
                )}
                styleVariant={value ? 'filled' : 'transparent'}
                colorVariant={value ? 'primary' : 'text'}
            >
                {children}
            </ButtonLayout>
        </RawButton>
    );
}

export type Props<
    NAME,
    OPTION,
    VALUE,
> = Omit<
    RadioInputProps<NAME, OPTION, VALUE, SegmentProps<VALUE>>,
    'radioListLayout' | 'radioListLayoutPreferredGridColumns' | 'backgroundColor'
> & {
    value: VALUE | undefined | null;
    onChange: (value: VALUE, name: NAME) => void;
    rendererParams?: RadioInputProps<NAME, OPTION, VALUE, SegmentProps<VALUE>>['rendererParams'];
    keySelector: RadioInputProps<NAME, OPTION, VALUE, SegmentProps<VALUE>>['keySelector'];
    labelSelector: RadioInputProps<NAME, OPTION, VALUE, SegmentProps<VALUE>>['labelSelector'];
}

/**
 * Single-select input rendered as a row of segments (a RadioInput with
 * a button-like renderer on a page-gray track) (specific layer).
 */
function SegmentInput<
    const NAME,
    OPTION extends object,
    VALUE extends string | number | boolean,
>(props: Props<NAME, OPTION, VALUE>) {
    const {
        rendererParams,
        keySelector,
        labelSelector,
        className,
        ...otherProps
    } = props;

    return (
        <RadioInput
            className={_cs(className, styles.segmentInput)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            renderer={Segment}
            rendererParams={rendererParams}
            keySelector={keySelector}
            labelSelector={labelSelector}
            backgroundColor="background"
            spacing="none"
        />
    );
}

export default SegmentInput;
