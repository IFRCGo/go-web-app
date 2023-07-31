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
                description={strings.assistedRcLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.cumulativeDeadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                description={strings.assistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                description={strings.numberOfCasesLabel}
                value={value?.epi_cases_since_last_fr}
            />
            <KeyFigure
                description={strings.assistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <KeyFigure
                description={strings.numberOfNewDeathsLabel}
                value={value?.epi_deaths_since_last_fr}
            />
            <KeyFigure
                description={strings.localStaff}
                value={value?.num_localstaff}
            />
            <TextOutput
                label={strings.sourceLabel}
                value={value?.sources?.map((source) => source?.stype)}
            />
            <TextOutput
                label={strings.notesLabel}
                value={value?.epi_notes_since_last_fr}
            />
            <TextOutput
                label={strings.sourcesForDataMarkedLabel}
                value={value?.other_sources}
            />
            <TextOutput
                label={strings.dateOfData}
                value={value?.sit_fields_date}
            />
        </>
    );
}

export default EpidemicNumericDetails;
