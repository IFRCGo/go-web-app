import {
    Header as PureHeader,
    type HeaderProps,
} from '@ifrc-go/ui';

function Header(props: HeaderProps) {
    return (
        <PureHeader {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Header;
