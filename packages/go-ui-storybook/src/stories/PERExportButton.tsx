import {
    PERExportButton as PurePERExportButton,
    type PERExportButtonProps,
} from '@ifrc-go/ui';

function StoryPERExportButton(props: PERExportButtonProps) {
    return (
        <PurePERExportButton {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERExportButton;
