import {
    Heading as PureHeading,
    HeadingProps as PureHeadingProps,
} from '@ifrc-go/ui';

interface HeadingProps extends PureHeadingProps {}

function WrappedHeading(props: HeadingProps) {
    return (
        <PureHeading {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedHeading;
