import {
    Heading as PureHeading,
    HeadingProps,
} from '@ifrc-go/ui';

function Heading(props: HeadingProps) {
    return (
        <PureHeading {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Heading;
