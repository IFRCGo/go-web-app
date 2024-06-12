import {
    Container as PureContainer,
    ContainerProps,
} from '@ifrc-go/ui';

function Container(props: ContainerProps) {
    return (
        <PureContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Container;
