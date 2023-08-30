import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import Container from '#components/Container';
import DateOutput from '#components/DateOutput';
import Link from '#components/Link';
import RouteContext from '#contexts/route';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import type { GoApiResponse } from '#utils/restRequest';
import {
    FIELD_REPORT_STATUS_EARLY_WARNING,
    DISASTER_TYPE_EPIDEMIC,
} from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;
type FieldReport = EventItem['field_reports'][number];

interface Props {
    disasterType: EventItem['dtype'];
    report: FieldReport;
}

function FieldReportStats(props: Props) {
    const {
        disasterType,
        report,
    } = props;

    const {
        fieldReportDetails: fieldReportDetailsRoute,
    } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    const reportLink = resolveToComponent(
        strings.source,
        {
            link: (
                <Link
                    to={generatePath(
                        fieldReportDetailsRoute.absolutePath,
                        { fieldReportId: report.id },
                    )}
                >
                    {report.summary}
                </Link>
            ),
            date: (
                <DateOutput value={report.updated_at ?? report.created_at} />
            ),
        },
    );

    const numAffected = report.num_affected
        ?? report.gov_num_affected ?? report.other_num_affected;
    const numInjured = report.num_injured
        ?? report.gov_num_injured ?? report.other_num_injured;
    const numDead = report.num_dead
        ?? report.gov_num_dead ?? report.other_num_dead;
    const numMissing = report.num_missing
        ?? report.gov_num_missing ?? report.other_num_missing;
    const numDisplaced = report.num_displaced
        ?? report.gov_num_displaced ?? report.other_num_displaced;
    const numAssisted = report.num_assisted
        ?? report.gov_num_assisted ?? report.other_num_assisted;

    if (report.status === FIELD_REPORT_STATUS_EARLY_WARNING) {
        const numPotentiallyAffected = report.num_potentially_affected
            ?? report.gov_num_potentially_affected ?? report.other_num_potentially_affected;
        const numHighestRisk = report.num_highest_risk
            ?? report.gov_num_highest_risk ?? report.other_num_highest_risk;
        const affectedPopulationCenters = report.affected_pop_centres
            ?? report.gov_affected_pop_centres ?? report.other_affected_pop_centres;

        return (
            <Container
                childrenContainerClassName={styles.keyFigureList}
            >
                <TextOutput
                    label={strings.potentiallyAffected}
                    valueType="number"
                    strongValue
                    value={numPotentiallyAffected}
                />
                <TextOutput
                    label={strings.highestRisk}
                    valueType="number"
                    strongValue
                    value={numHighestRisk}
                />
                <TextOutput
                    label={strings.affectedPopCenters}
                    valueType="number"
                    strongValue
                    value={affectedPopulationCenters}
                />
                <TextOutput
                    label={strings.assistedByGovernment}
                    valueType="number"
                    strongValue
                    value={report.gov_num_assisted}
                />
                <TextOutput
                    label={strings.assistedByRCRC}
                    valueType="number"
                    strongValue
                    value={report.num_assisted}
                />
                {reportLink}
            </Container>
        );
    }
    if (report.is_covid_report) {
        return (
            <Container
                childrenContainerClassName={styles.keyFigureList}
            >
                <TextOutput
                    label={strings.cases}
                    valueType="number"
                    strongValue
                    value={report.epi_cases}
                />
                <TextOutput
                    label={strings.numberOfDead}
                    valueType="number"
                    strongValue
                    value={report.epi_num_dead}
                />
                <TextOutput
                    label={strings.epiSource}
                    valueType="number"
                    strongValue
                    value={report.epi_figures_source_display}
                />
                <TextOutput
                    label={strings.assisted}
                    valueType="number"
                    strongValue
                    value={numAssisted}
                />
                <TextOutput
                    label={strings.localStaff}
                    valueType="number"
                    strongValue
                    value={report.num_localstaff}
                />
                <TextOutput
                    label={strings.volunteers}
                    valueType="number"
                    strongValue
                    value={report.num_volunteers}
                />
            </Container>
        );
    }
    if (disasterType === DISASTER_TYPE_EPIDEMIC) {
        return (
            <Container
                childrenContainerClassName={styles.keyFigureList}
            >
                <TextOutput
                    label={strings.cases}
                    valueType="number"
                    strongValue
                    value={report.epi_cases}
                />
                <TextOutput
                    label={strings.suspectedCases}
                    valueType="number"
                    strongValue
                    value={report.epi_suspected_cases}
                />
                <TextOutput
                    label={strings.probableCases}
                    valueType="number"
                    strongValue
                    value={report.epi_probable_cases}
                />
                <TextOutput
                    label={strings.confirmedCases}
                    valueType="number"
                    strongValue
                    value={report.epi_confirmed_cases}
                />
                <TextOutput
                    label={strings.numberOfDead}
                    valueType="number"
                    strongValue
                    value={report.epi_num_dead}
                />
                <TextOutput
                    label={strings.epiSource}
                    valueType="number"
                    strongValue
                    value={report.epi_figures_source_display}
                />
                <TextOutput
                    label={strings.assisted}
                    valueType="number"
                    strongValue
                    value={numAssisted}
                />
                <TextOutput
                    label={strings.localStaff}
                    valueType="number"
                    strongValue
                    value={report.num_localstaff}
                />
                <TextOutput
                    label={strings.volunteers}
                    valueType="number"
                    strongValue
                    value={report.num_volunteers}
                />
                <TextOutput
                    label={strings.delegates}
                    valueType="number"
                    strongValue
                    value={report.num_expats_delegates}
                />
            </Container>
        );
    }

    return (
        <Container
            childrenContainerClassName={styles.keyFigureList}
        >
            <TextOutput
                label={strings.affected}
                valueType="number"
                strongValue
                value={numAffected}
            />
            <TextOutput
                label={strings.injured}
                valueType="number"
                strongValue
                value={numInjured}
            />
            <TextOutput
                label={strings.dead}
                valueType="number"
                strongValue
                value={numDead}
            />
            <TextOutput
                label={strings.missing}
                valueType="number"
                strongValue
                value={numMissing}
            />
            <TextOutput
                label={strings.displaced}
                valueType="number"
                strongValue
                value={numDisplaced}
            />
            <TextOutput
                label={strings.assisted}
                valueType="number"
                strongValue
                value={numAssisted}
            />
            <TextOutput
                label={strings.localStaff}
                valueType="number"
                strongValue
                value={report.num_localstaff}
            />
            <TextOutput
                label={strings.volunteers}
                valueType="number"
                strongValue
                value={report.num_volunteers}
            />
            <TextOutput
                label={strings.delegates}
                valueType="number"
                strongValue
                value={report.num_expats_delegates}
            />
        </Container>
    );
}

export default FieldReportStats;
