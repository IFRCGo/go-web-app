import {
    Container as PureContainer,
    type ContainerProps,
} from '@ifrc-go/ui';

function Container(props: ContainerProps) {
    return (
        <PureContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Container;
