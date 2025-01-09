import {
    PERKPITabs as PurePERKPITabs,
    PERKPITabsProps,
} from '@ifrc-go/ui';

function StoryPERKPITabs(props: PERKPITabsProps) {
    return (
        <PurePERKPITabs {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERKPITabs;
