import {
    Chip as PureChip,
    ChipProps as PureChipProps,
} from '@ifrc-go/ui';

type ChipProps<N> = PureChipProps<N>

function Chip<const N>(props: ChipProps<N>) {
    return (
        <PureChip {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Chip;
