import {
    PERRegionToggle as PurePERRegionToggle,
    PERRegionToggleProps,
} from '@ifrc-go/ui';

function PERRegionToggle(props: PERRegionToggleProps) {
    return (
        <PurePERRegionToggle {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PERRegionToggle;
