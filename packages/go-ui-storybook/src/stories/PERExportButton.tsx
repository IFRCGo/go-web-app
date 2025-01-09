import PERExportButton from '../../../ui/src/components/PERExportButton';
import type { Props as PERExportButtonProps } from '../../../ui/src/components/PERExportButton';

function StoryPERExportButton(props: PERExportButtonProps) {
    return (
        <PERExportButton {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERExportButton;
