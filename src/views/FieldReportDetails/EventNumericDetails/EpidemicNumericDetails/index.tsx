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
                description={strings.epidemicCumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.epidemicSuspectedCasesLabel}
                value={value?.epi_suspected_cases}
            />
            <KeyFigure
                description={strings.epidemicProbableCasesLabel}
                value={value?.epi_probable_cases}
            />
            <KeyFigure
                description={strings.epidemicConfirmedCasesLabel}
                value={value?.epi_confirmed_cases}
            />
            <KeyFigure
                description={strings.epidemicDeadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                description={strings.epidemicAssistedRCLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.epidemicAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                description={strings.epidemicAssistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.epidemicVolunteersLabel}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.epidemicVolunteersLabel}
                value={value?.num_volunteers}
            />
            <KeyFigure
                description={strings.epidemicDelegatesLabel}
                value={value?.num_expats_delegates}
            />
            <TextOutput
                label={strings.epidemicSourceLabel}
                value={value?.other_sources}
                strongLabel
            />
        </>
    );
}

export default EpidemicNumericDetails;
