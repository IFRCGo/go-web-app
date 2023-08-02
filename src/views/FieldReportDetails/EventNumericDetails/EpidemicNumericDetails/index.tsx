import KeyFigure from '#components/KeyFigure';
import TextOutput from '#components/TextOutput';
import type { paths } from '#generated/types';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function EpidemicNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.cumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.suspectedCasesLabel}
                value={value?.epi_suspected_cases}
            />
            <KeyFigure
                description={strings.probableCasesLabel}
                value={value?.epi_probable_cases}
            />
            <KeyFigure
                description={strings.confirmedCasesLabel}
                value={value?.epi_confirmed_cases}
            />
            <KeyFigure
                description={strings.deadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                description={strings.assistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.assistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                description={strings.assistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.volunteersLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.volunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                description={strings.delegatesLabel}
                value={value?.num_expats_delegates}
            />
            <TextOutput
                label={strings.sourceLabel}
                value={value?.other_sources}
                strongLabel
            />
        </>
    );
}

export default EpidemicNumericDetails;
