import {
    DropdownMenu as PureDropdownMenu,
    DropdownMenuProps as PureDropdownMenuProps,
} from '@ifrc-go/ui';

type DropdownMenuProps = PureDropdownMenuProps

function WrappedDropdownMenu(props: DropdownMenuProps) {
    return (
        <PureDropdownMenu {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedDropdownMenu;
