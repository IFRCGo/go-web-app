import {
    BooleanDisplay as PureBooleanDisplay,
    BooleanDisplayProps,
} from '@ifrc-go/ui';

function BooleanDisplay(props: BooleanDisplayProps) {
    return (
        <PureBooleanDisplay {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default BooleanDisplay;
