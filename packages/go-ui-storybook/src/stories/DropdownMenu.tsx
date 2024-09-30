import {
    DropdownMenu as PureDropdownMenu,
    type DropdownMenuProps,
} from '@ifrc-go/ui';

function DropdownMenu(props: DropdownMenuProps) {
    return (
        <PureDropdownMenu {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default DropdownMenu;
