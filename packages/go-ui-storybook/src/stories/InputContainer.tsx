import {
    InputContainer as PureInputContainer,
    InputContainerProps as PureInputContainerProps,
} from '@ifrc-go/ui';

interface InputContainerProps extends PureInputContainerProps {}

function WrappedInputContainer(props: InputContainerProps) {
    return (
        <PureInputContainer {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedInputContainer;
