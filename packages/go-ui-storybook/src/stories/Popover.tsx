import {
    Popover as PurePopover,
    PopoverProps,
} from '@ifrc-go/ui';

function Popover(props: PopoverProps) {
    return (
        <PurePopover {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Popover;
