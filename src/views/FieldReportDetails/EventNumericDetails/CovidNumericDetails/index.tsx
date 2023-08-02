import type { paths } from '#generated/types';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import TextOutput from '#components/TextOutput';

import i18n from './i18n.json';

type FieldReportResponse = paths['/api/v2/field_report/{id}/']['get']['responses']['200']['content']['application/json'];

interface Props {
    value: FieldReportResponse | undefined;
}

function CovidNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    return (
        <>
            <KeyFigure
                description={strings.covidCumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                description={strings.assistedRcLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.covidCumulativeDeadLabel}
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
            <KeyFigure
                description={strings.volunteersLabel}
                value={value?.num_volunteers}
            />
            <TextOutput
                label={strings.sourceLabel}
                value={value?.other_sources}
                strongLabel
            />
            <TextOutput
                label={strings.notesLabel}
                value={value?.epi_notes_since_last_fr}
                strongLabel
            />
            <TextOutput
                label={strings.sourcesForDataMarkedLabel}
                value={value?.other_sources}
                strongLabel
            />
            <TextOutput
                label={strings.dateOfData}
                value={value?.sit_fields_date}
                strongLabel
            />
        </>
    );
}

export default CovidNumericDetails;
