import {
    PERRatingAnalysis as PurePERRatingAnalysis,
    type PERRatingAnalysisProps,
} from '@ifrc-go/ui';

function StoryPERRatingAnalysis(props: PERRatingAnalysisProps) {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <PurePERRatingAnalysis {...props} />
    );
}

export default StoryPERRatingAnalysis;
