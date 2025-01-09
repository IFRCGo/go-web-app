import PERContainer from '../../../ui/src/components/PERContainer';
import type { Props as PERContainerProps } from '../../../ui/src/components/PERContainer';

function StoryPERContainer(props: PERContainerProps) {
    return (
        <PERContainer {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default StoryPERContainer;
