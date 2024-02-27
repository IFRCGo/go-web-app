import {
    ExpandableContainer as PureExpandableContainer,
    ExpandableContainerProps as PureExpandableContainerProps,
} from '@ifrc-go/ui';

interface ExpandableContainerProps extends PureExpandableContainerProps {}

function WrappedExpandableContainer(props: ExpandableContainerProps) {
    return (
        <PureExpandableContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedExpandableContainer;
