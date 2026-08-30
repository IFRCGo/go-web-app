import {
    ExpandableContainer as PureExpandableContainer,
    ExpandableContainerProps,
} from '@ifrc-go/ui';

function ExpandableContainer(props: ExpandableContainerProps) {
    return (
        <PureExpandableContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default ExpandableContainer;
