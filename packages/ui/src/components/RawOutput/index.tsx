import BooleanOutput, { Props as BooleanOutputProps } from '#components/BooleanOutput';
import DateOutput, { Props as DateOutputProps } from '#components/DateOutput';
import NumberOutput, { Props as NumberOutputProps } from '#components/NumberOutput';

export interface BooleanValueProps extends BooleanOutputProps {
    valueType: 'boolean';
}

export interface NumberValueProps extends NumberOutputProps {
    valueType: 'number';
}

export interface DateValueProps extends DateOutputProps {
    valueType: 'date';
}

export interface TextValueProps {
    valueType: 'text';
    value: string | null | undefined;
    /** Rendered when value is absent or empty */
    invalidText?: React.ReactNode;
}

export interface NodeValueProps {
    valueType?: never;
    value?: React.ReactNode;
    /** Rendered when value is absent or empty */
    invalidText?: React.ReactNode;
}

export type Props =
    | BooleanValueProps
    | DateValueProps
    | NodeValueProps
    | NumberValueProps
    | TextValueProps;

/**
 * Value-type multiplexer shared by labelled output components
 * (generic layer).
 *
 * Renders the output primitive matching `valueType` (BooleanOutput,
 * DateOutput or NumberOutput, forwarding their respective props), plain
 * text for 'text', or the value as-is when `valueType` is omitted.
 * Carries no styling of its own; compose it inside styled components
 * such as TextOutput or KeyFigure.
 *
 * `invalidText` has no default here: each output primitive applies its
 * own fallback, so wrappers can opt into a shared fallback by passing
 * one explicitly.
 */
function RawOutput(props: Props) {
    const {
        invalidText,
        ...otherProps
    } = props;

    if (otherProps.valueType === 'boolean') {
        return (
            <BooleanOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    if (otherProps.valueType === 'number') {
        return (
            <NumberOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    if (otherProps.valueType === 'date') {
        return (
            <DateOutput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...otherProps}
                invalidText={invalidText}
            />
        );
    }

    const { value } = otherProps;

    // A raw Date is not a renderable node; treat it as an invalid value
    if (value instanceof Date) {
        return invalidText;
    }

    return value || invalidText;
}

export default RawOutput;
