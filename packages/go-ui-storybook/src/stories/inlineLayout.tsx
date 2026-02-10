import {
    InlineLayout as PureInlineLayout,
    InlineLayoutProps,
} from '@ifrc-go/ui';

function InlineLayout(props: InlineLayoutProps) {
    return (
        <PureInlineLayout {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default InlineLayout;
