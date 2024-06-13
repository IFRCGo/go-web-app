import {
    Footer as PureFooter,
    FooterProps as PureFooterProps,
} from '@ifrc-go/ui';

interface FooterProps extends PureFooterProps {}

function Footer(props:FooterProps) {
    return (
        <PureFooter {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Footer;
