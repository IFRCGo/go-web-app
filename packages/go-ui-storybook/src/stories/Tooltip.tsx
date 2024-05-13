import {
    Tooltip as PureTooltip,
    TooltipProps as PureTooltipProps,
} from '@ifrc-go/ui';

interface TooltipProps extends PureTooltipProps {}

function WrappedTooltip(props: TooltipProps) {
    return (
        <PureTooltip {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTooltip;
