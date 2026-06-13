import {
    NumberDisplay as PureNumberDisplay,
    NumberDisplayProps,
} from '@ifrc-go/ui';

function NumberDisplay(props: NumberDisplayProps) {
    return (
        <PureNumberDisplay {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NumberDisplay;
