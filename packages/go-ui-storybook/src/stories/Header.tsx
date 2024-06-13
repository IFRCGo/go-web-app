import {
    Header as PureHeader,
    HeaderProps as PureHeaderProps,
} from '@ifrc-go/ui';

type HeaderProps = PureHeaderProps

function Header(props:HeaderProps) {
    return (
        <PureHeader {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Header;
