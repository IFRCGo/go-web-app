import type { paths } from '#generated/types';
import KeyFigure from '#components/KeyFigure';
import useTranslation from '#hooks/useTranslation';
import TextOutput from '#components/TextOutput';
import Container from '#components/Container';
import HtmlOutput from '#components/HtmlOutput';

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
                description={strings.covidCumulativeDeadLabel}
                value={value?.epi_num_dead}
            />
            <KeyFigure
                description={strings.covidNumberOfCasesLabel}
                value={value?.epi_cases_since_last_fr}
            />
            <KeyFigure
                description={strings.covidNumberOfNewDeathsLabel}
                value={value?.epi_deaths_since_last_fr}
            />
            <KeyFigure
                description={strings.covidAssistedRcLabel}
                value={value?.num_assisted}
            />
            <KeyFigure
                description={strings.covidAssistedGovernmentLabel}
                value={value?.gov_num_assisted}
            />
            <KeyFigure
                description={strings.covidAssistedOtherLabel}
                value={value?.other_num_assisted}
            />
            <TextOutput
                label={strings.covidSourceLabel}
                value={value?.other_sources}
                strongLabel
            />
            <KeyFigure
                description={strings.covidLocalStaff}
                value={value?.num_localstaff}
            />
            <KeyFigure
                description={strings.covidVolunteersLabel}
                value={value?.num_volunteers}
            />
            <TextOutput
                label={strings.covidFieldReportLabel}
                value={value?.is_covid_report}
                valueType="boolean"
                strongValue
            />
            <Container
                heading={strings.covidSummaryLabel}
                withHeaderBorder
            >
                <HtmlOutput
                    value={value?.actions_others}
                />
            </Container>
        </>
    );
}

export default CovidNumericDetails;
