import {
    BaseProps,
    BooleanProps,
    DateProps,
    NodeProps,
    TextOutput as PureTextOutput,
    TextOutputProps as PureTextOutputProps,
    TextProps,
} from '@ifrc-go/ui';

type ExtendedProps = BaseProps & (NodeProps | TextProps | DateProps | BooleanProps);
type TextOutputProps = PureTextOutputProps & ExtendedProps;

function WrappedTextOutput(props: TextOutputProps) {
    return (
        <PureTextOutput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTextOutput;
