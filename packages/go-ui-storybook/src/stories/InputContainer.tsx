import {
    InputContainer as PureInputContainer,
    InputContainerProps as PureInputContainerProps,
} from '@ifrc-go/ui';

export type InputContainerProps = PureInputContainerProps;
function InputContainer(props: InputContainerProps) {
    return (
        <PureInputContainer {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InputContainer;
