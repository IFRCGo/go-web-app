import { useOutletContext } from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';
import {
    compareDate, isDefined, isNotDefined, isTruthyString,
} from '@togglecorp/fujs';
import { DownloadFillIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import HtmlOutput from '#components/HtmlOutput';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import SeverityIndicator from '#components/domain/SeverityIndicator';
import TextOutput from '#components/TextOutput';
import Tooltip from '#components/Tooltip';
import type { EmergencyOutletContext } from '#utils/outletContext';
import useDisasterType from '#hooks/domain/useDisasterType';
import type { GoApiResponse } from '#utils/restRequest';

import EmergencyMap from './EmergencyMap';
import FieldReportStats from './FieldReportStats';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;
type FieldReport = EventItem['field_reports'][number];

function getFieldReport(
    reports: FieldReport[],
    compareFunction: (
        a?: string,
        b?: string,
        direction?: number
    ) => number,
    direction?: number,
): FieldReport | undefined {
    if (reports.length === 0) {
        return undefined;
    }

    return reports.reduce((
        selectedReport: FieldReport | undefined,
        currentReport: FieldReport | undefined,
    ) => {
        if (isNotDefined(selectedReport)
            || compareFunction(
                currentReport?.updated_at,
                selectedReport.updated_at,
                direction,
            ) > 0) {
            return currentReport;
        }
        return selectedReport;
    }, undefined);
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const disasterTypes = useDisasterType();
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();

    const hasKeyFigures = isDefined(emergencyResponse)
                       && emergencyResponse.key_figures.length !== 0;

    const disasterType = disasterTypes?.find(
        (typeOfDisaster) => typeOfDisaster.id === emergencyResponse?.dtype,
    );

    const mdrCode = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.appeals)
        && emergencyResponse.appeals.length > 0
        ? emergencyResponse?.appeals[0].code : undefined;

    const hasFieldReports = isDefined(emergencyResponse)
        && isDefined(emergencyResponse?.field_reports)
        && emergencyResponse?.field_reports.length > 0;

    const firstFieldReport = hasFieldReports
        ? getFieldReport(emergencyResponse.field_reports, compareDate, -1) : undefined;
    const assistanceIsRequestedByNS = firstFieldReport?.ns_request_assistance;
    const assistanceIsRequestedByCountry = firstFieldReport?.request_assistance;
    const latestFieldReport = hasFieldReports
        ? getFieldReport(emergencyResponse.field_reports, compareDate) : undefined;

    return (
        <div className={styles.emergencyDetails}>
            {hasKeyFigures && (
                <Container
                    className={styles.keyFiguresContainer}
                    heading={strings.emergencyKeyFiguresTitle}
                    childrenContainerClassName={styles.keyFigureList}
                    withHeaderBorder
                >
                    {emergencyResponse?.key_figures.map(
                        (keyFigure) => (
                            <KeyFigure
                                key={keyFigure.id}
                                className={styles.keyFigure}
                                // FIXME: get numeric value from server
                                value={Number.parseFloat(keyFigure.number)}
                                description={keyFigure.deck}
                            >
                                <TextOutput
                                    label={strings.emergencyKeyFigureSource}
                                    value={keyFigure.source}
                                />
                            </KeyFigure>
                        ),
                    )}
                </Container>
            )}
            <Container
                heading={strings.emergencyOverviewTitle}
                withHeaderBorder
                childrenContainerClassName={styles.overviewContainer}
            >
                <div className={styles.overview}>
                    <TextOutput
                        label={strings.disasterCategorization}
                        value={emergencyResponse?.ifrc_severity_level_display}
                        description={(
                            <SeverityIndicator
                                level={isDefined(emergencyResponse?.ifrc_severity_level)
                                    ? Number(emergencyResponse?.ifrc_severity_level) : null}
                            />
                        )}
                        strongValue
                    />
                    <TextOutput
                        label={strings.disasterType}
                        value={disasterType?.name}
                        strongValue
                    />
                    <TextOutput
                        label={strings.GLIDENumber}
                        value={emergencyResponse?.glide}
                        strongValue
                    />
                    <TextOutput
                        label={strings.startDate}
                        valueType="date"
                        value={emergencyResponse?.disaster_start_date}
                        strongValue
                    />
                </div>
                <div className={styles.overview}>
                    <TextOutput
                        label={strings.visibility}
                        value={emergencyResponse?.visibility}
                        strongValue
                    />
                    <TextOutput
                        label={strings.MDRCode}
                        value={mdrCode}
                        strongValue
                    />
                    <TextOutput
                        label={strings.assisanceRequestedByNS}
                        valueType="boolean"
                        value={assistanceIsRequestedByNS}
                        strongValue
                    />
                    <TextOutput
                        label={strings.assisanceRequestedByGovernment}
                        valueType="boolean"
                        value={assistanceIsRequestedByCountry}
                        strongValue
                    />
                </div>
            </Container>
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse?.summary)
                && isTruthyString(emergencyResponse.summary)
                && (
                    <ExpandableContainer
                        heading={strings.situationalOverviewTitle}
                        withHeaderBorder
                        childrenContainerClassName={styles.overviewContainer}
                        initiallyExpanded
                    >
                        <HtmlOutput
                            value={emergencyResponse.summary}
                        />
                    </ExpandableContainer>
                )}
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse?.links)
                && emergencyResponse.links.length > 0 && (
                <ExpandableContainer
                    heading={strings.linksTitle}
                    withHeaderBorder
                    childrenContainerClassName={styles.overviewContainer}
                    initiallyExpanded
                >
                    {emergencyResponse.links.map((link) => (
                        <Link
                            id={link.id.toString()}
                            to={link.url}
                            withExternalLinkIcon
                        >
                            <Tooltip className={styles.tooltip}>
                                {link.description}
                            </Tooltip>
                            {link.title}
                        </Link>
                    ))}
                </ExpandableContainer>
            )}
            <div className={styles.mapKeyFigureContainer}>
                {emergencyResponse && !emergencyResponse.hide_field_report_map && (
                    <Container
                        className={styles.mapContainer}
                        heading={strings.emergencyMapTitle}
                        actions={(
                            <Button
                                variant="secondary"
                                name={undefined}
                                title={strings.exportMap}
                                icons={(<DownloadFillIcon />)}
                            >
                                {strings.exportMap}
                            </Button>
                        )}
                    >
                        {emergencyResponse && (
                            <EmergencyMap
                                event={emergencyResponse}
                            />
                        )}
                    </Container>
                )}
                {hasFieldReports
                    && isDefined(latestFieldReport)
                    && !emergencyResponse.hide_attached_field_reports && (
                    <Container
                        className={styles.fieldReportStatsContainer}
                        heading={strings.emergencyKeyFiguresTitle}
                        childrenContainerClassName={styles.fieldReportStats}
                        withHeaderBorder
                    >
                        <FieldReportStats
                            report={latestFieldReport}
                            disasterType={emergencyResponse.dtype}
                        />
                    </Container>
                )}
            </div>
        </div>
    );
}

Component.displayName = 'EmergencyDetails';
