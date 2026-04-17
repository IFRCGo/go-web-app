import { useMemo } from 'react';
import {
    Container,
    Description,
    HtmlOutput,
    InfoPopup,
    KeyFigureView,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    compareDate,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToGroupList,
} from '@togglecorp/fujs';

import SeverityIndicator from '#components/domain/SeverityIndicator';
import Link from '#components/Link';
import { type DisasterType } from '#hooks/domain/useDisasterType';
import { type GoApiResponse } from '#utils/restRequest';
import EmergencyMap from '#views/EmergencyDetails/EmergencyMap';

import FieldReportStats from './FieldReportStats';

import i18n from './i18n.json';

type EmergencyResponse = GoApiResponse<'/api/v2/event/{id}/'>;
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

    // FIXME: use max function
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

interface Props {
    response: EmergencyResponse | undefined;
    disasterType?: DisasterType | undefined;
    visibilityMap?: Record<string, string>;
    mdrCode?: string | null;
    assistanceIsRequestedByNS?: boolean | null;
    assistanceIsRequestedByCountry?: boolean | null;
}

function EmergencyOverview(props: Props) {
    const {
        response,
        disasterType,
        visibilityMap,
        mdrCode,
        assistanceIsRequestedByNS,
        assistanceIsRequestedByCountry,
    } = props;
    const strings = useTranslation(i18n);

    const hasKeyFigures = isDefined(response)
        && response.key_figures.length !== 0;

    const hasFieldReports = isDefined(response)
        && isDefined(response?.field_reports)
        && response?.field_reports.length > 0;
    const emergencyContacts = response?.contacts;

    // In new API may be we need to fix this logic?
    const latestFieldReport = hasFieldReports
        ? getFieldReport(response.field_reports, compareDate) : undefined;

    const groupedContacts = useMemo(
        () => {
            type Contact = Omit<NonNullable<typeof emergencyContacts>[number], 'event'>;
            let contactsToProcess: Contact[] | undefined = emergencyContacts;
            if (!contactsToProcess || contactsToProcess.length <= 0) {
                contactsToProcess = latestFieldReport?.contacts;
            }
            const grouped = listToGroupList(
                contactsToProcess?.map(
                    (contact) => {
                        if (isNotDefined(contact)) {
                            return undefined;
                        }

                        const { ctype } = contact;
                        if (isNotDefined(ctype)) {
                            return undefined;
                        }

                        return {
                            ...contact,
                            ctype,
                        };
                    },
                ).filter(isDefined) ?? [],
                (contact) => (
                    contact.email.endsWith('ifrc.org')
                        ? 'IFRC'
                        : 'National Societies'
                ),
            );
            return grouped;
        },
        [emergencyContacts, latestFieldReport],
    );

    return (
        <>
            {hasKeyFigures && (
                <Container
                    heading={strings.emergencyKeyFiguresTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={4}
                    >
                        {response?.key_figures.map((keyFigure) => (
                            <KeyFigureView
                                key={keyFigure.id}
                                // FIXME: fix typing in server (medium priority)
                                // FIXME: Rounding this because it was previously rounded
                                value={Math.round(
                                    Number.parseInt(
                                        keyFigure.number.replace(/[^\d.-]/g, ''),
                                        10,
                                    ),
                                )}
                                valueType="number"
                                label={(
                                    <ListView layout="block" spacing="sm">
                                        <div>{keyFigure.deck}</div>
                                        <div>
                                            {resolveToString(
                                                strings.sourceLabel,
                                                { source: keyFigure.source },
                                            )}
                                        </div>
                                    </ListView>
                                )}
                                withShadow
                            />
                        ))}
                    </ListView>
                </Container>
            )}

            {isDefined(response) && (
                <Container
                    heading={strings.emergencyOverviewTitle}
                    withHeaderBorder
                >
                    <ListView
                        layout="grid"
                        withSpacingOpticalCorrection
                        numPreferredGridColumns={3}
                    >
                        <TextOutput
                            label={strings.disasterCategorization}
                            value={(
                                <ListView
                                    withWrap
                                    withSpacingOpticalCorrection
                                    spacing="sm"
                                >
                                    {response.ifrc_severity_level_display}
                                    <SeverityIndicator
                                        level={response.ifrc_severity_level}
                                    />
                                    {response.ifrc_severity_level_update_date && (
                                        <InfoPopup
                                            description={(
                                                <TextOutput
                                                    label={strings.severityLevelUpdateDateLabel}
                                                    value={
                                                        response.ifrc_severity_level_update_date
                                                    }
                                                    valueType="date"
                                                />
                                            )}
                                        />
                                    )}
                                </ListView>
                            )}
                            strongValue
                        />
                        <TextOutput
                            label={strings.disasterType}
                            value={disasterType?.name}
                            strongValue
                        />
                        <TextOutput
                            label={strings.startDate}
                            valueType="date"
                            value={response?.disaster_start_date}
                            strongValue
                        />
                        <TextOutput
                            label={strings.visibility}
                            value={isDefined(response.visibility) ? visibilityMap?.[response.visibility] : '--'}
                            strongValue
                        />
                        <TextOutput
                            label={strings.MDRCode}
                            value={mdrCode}
                            strongValue
                        />
                        <TextOutput
                            label={strings.GLIDENumber}
                            value={response?.glide}
                            strongValue
                        />
                        <TextOutput
                            label={strings.assistanceRequestedByNS}
                            valueType="boolean"
                            value={assistanceIsRequestedByNS}
                            strongValue
                        />
                        <TextOutput
                            label={strings.assistanceRequestedByGovernment}
                            valueType="boolean"
                            value={assistanceIsRequestedByCountry}
                            strongValue
                        />
                    </ListView>
                </Container>
            )}

            {isDefined(response?.summary) && isTruthyString(response.summary) && (
                <Container
                    heading={strings.situationalOverviewTitle}
                    withHeaderBorder
                >
                    <HtmlOutput value={response.summary} />
                </Container>
            )}

            <ListView
                layout="grid"
                withSidebar
            >
                {response && !response.hide_field_report_map && (
                    <Container
                        heading={strings.emergencyMapTitle}
                        withHeaderBorder
                    >
                        <EmergencyMap event={response} />
                    </Container>
                )}
                {hasFieldReports
                    && isDefined(latestFieldReport)
                    && !response.hide_attached_field_reports && (
                    <Container
                        heading={strings.emergencyKeyFiguresTitle}
                        withHeaderBorder
                    >
                        <FieldReportStats
                            report={latestFieldReport}
                            disasterType={response.dtype}
                        />
                    </Container>
                )}
            </ListView>

            {isDefined(groupedContacts) && Object.keys(groupedContacts).length > 0 && (
                <Container
                    heading={strings.contactsTitle}
                    withHeaderBorder
                >
                    <ListView layout="block">
                        {/* FIXME: lets not use Object.entries here */}
                        {Object.entries(groupedContacts).map(([contactGroup, contacts]) => (
                            <Container
                                key={contactGroup}
                                heading={contactGroup}
                                headingLevel={5}
                            >
                                <ListView
                                    layout="grid"
                                    numPreferredGridColumns={4}
                                    spacing="sm"
                                >
                                    {contacts.map((contact) => (
                                        <Container
                                            key={contact.id}
                                            headingLevel={6}
                                            heading={contact.name}
                                            withPadding
                                            withShadow
                                            withBackground
                                        >
                                            <ListView
                                                layout="block"
                                                withSpacingOpticalCorrection
                                            >
                                                <Description
                                                    textSize="sm"
                                                    withLightText
                                                >
                                                    {contact.title}
                                                </Description>
                                                <Description
                                                    textSize="sm"
                                                    withLightText
                                                >
                                                    {contact.ctype}
                                                </Description>
                                                {isTruthyString(contact.email) && (
                                                    <Link
                                                        href={`mailto:${contact.email}`}
                                                        external
                                                        withLinkIcon
                                                        textSize="sm"
                                                    >
                                                        {contact.email}
                                                    </Link>
                                                )}
                                            </ListView>
                                        </Container>
                                    ))}
                                </ListView>
                            </Container>
                        ))}
                    </ListView>
                </Container>
            )}
        </>
    );
}

export default EmergencyOverview;
