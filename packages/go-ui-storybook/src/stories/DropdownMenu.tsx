import {
    DropdownMenu as PureDropdownMenu,
    DropdownMenuProps as PureDropdownMenuProps,
} from '@ifrc-go/ui';

export type DropdownMenuProps = PureDropdownMenuProps;

function DropdownMenu(props: DropdownMenuProps) {
    return (
        <PureDropdownMenu {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default DropdownMenu;
