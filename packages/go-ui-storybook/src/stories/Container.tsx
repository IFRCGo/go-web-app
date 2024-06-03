import {
    Container as PureContainer,
    ContainerProps as PureContainerProps,
} from '@ifrc-go/ui';

type ContainerProps = PureContainerProps

function WrappedContainer(props: ContainerProps) {
    return (
        <PureContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedContainer;
