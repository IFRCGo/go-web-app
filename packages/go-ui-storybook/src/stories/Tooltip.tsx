import {
    Tooltip as PureTooltip,
    TooltipProps,
} from '@ifrc-go/ui';

function Tooltip(props: TooltipProps) {
    return (
        <PureTooltip {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Tooltip;
