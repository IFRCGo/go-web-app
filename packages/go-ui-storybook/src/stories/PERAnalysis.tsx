import {
    PERAnalysis as PurePERAnalysis,
    PERAnalysisProps,
} from '@ifrc-go/ui';

function PERAnalysis(props: PERAnalysisProps) {
    return (
        <PurePERAnalysis {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PERAnalysis;