import {
    Footer as PureFooter,
    FooterProps,
} from '@ifrc-go/ui';

function Footer(props: FooterProps) {
    return (
        <PureFooter {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Footer;
