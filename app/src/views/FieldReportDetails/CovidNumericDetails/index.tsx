import {
    KeyFigure,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type FieldReportResponse = GoApiResponse<'/api/v2/field-report/{id}/'>;

interface Props {
    value: FieldReportResponse | undefined;
}

function CovidNumericDetails(props: Props) {
    const { value } = props;
    const strings = useTranslation(i18n);

    // FIXME: Show dynamic labels for disaster type 1

    return (
        <>
            <KeyFigure
                label={strings.covidCumulativeCasesLabel}
                value={value?.epi_cases}
            />
            <KeyFigure
                label={strings.covidCumulativeDeadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                label={strings.covidNumberOfCasesLabel}
                value={value?.epi_cases_since_last_fr}
            />
            <KeyFigure
                label={strings.covidNumberOfNewDeathsLabel}
                value={value?.epi_deaths_since_last_fr}
            />
            <KeyFigure
                label={strings.covidAssistedRcLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                label={strings.covidAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            {/* FIXME: This is not there in old details */}
            <TextOutput
                label={strings.covidSourceLabel}
                value={value?.other_sources}
                strongLabel
            />
            <KeyFigure
                label={strings.covidLocalStaff}
                value={value?.num_localstaff}
            />
            <KeyFigure
                label={strings.covidVolunteersLabel}
                value={value?.num_volunteers}
            />
        </>
    );
}

export default CovidNumericDetails;
