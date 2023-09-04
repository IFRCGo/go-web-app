import { useMemo, useCallback, useContext } from 'react';
import { useOutletContext, generatePath } from 'react-router-dom';
import { isDefined, isNotDefined, listToGroupList } from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Link from '#components/Link';
import List from '#components/List';
import Table from '#components/Table';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import type { EmergencyOutletContext } from '#utils/outletContext';
import type { GoApiResponse } from '#utils/restRequest';
import { numericIdSelector } from '#utils/selectors';
import { useRequest } from '#utils/restRequest';
import {
    createStringColumn,
    createDateColumn,
    createLinkColumn,
    createCountryListColumn,
} from '#components/Table/ColumnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SituationReportType = NonNullable<NonNullable<GoApiResponse<'/api/v2/situation_report/'>>['results']>[number];
type FieldReportListItem = NonNullable<NonNullable<NonNullable<EmergencyOutletContext['emergencyResponse']>>['field_reports']>[number];
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const {
        fieldReportDetails: fieldReportDetailsRoute,
    } = useContext(RouteContext);

    const {
        response: situationReportsResponse,
    } = useRequest({
        skip: isNotDefined(emergencyResponse),
        url: '/api/v2/situation_report/',
        query: isDefined(emergencyResponse) ? {
            event: emergencyResponse.id,
            limit: 1000, // FIXME: we should not use this unbounded request
        } : undefined, // TODO: we need to add search filter in server
    });

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReportListItem, number>(
                'created_at',
                strings.fieldReportsTableCreatedAt,
                (item) => item.created_at,
                {
                    columnClassName: styles.createdAt,
                },
            ),
            createLinkColumn<FieldReportListItem, number>(
                'summary',
                strings.fieldReportsTableName,
                (item) => item.summary,
                (item) => ({
                    to: generatePath(
                        fieldReportDetailsRoute.absolutePath,
                        { fieldReportId: item.id },
                    ),
                }),
                {
                    columnClassName: styles.summary,
                },
            ),
            createCountryListColumn<FieldReportListItem, number>(
                'countries',
                strings.fieldReportsTableCountry,
                (item) => item.countries,
            ),
        ]),
        [strings, fieldReportDetailsRoute],
    );

    const groupedSituationReports = useMemo(() => (
        listToGroupList(
            situationReportsResponse?.results?.filter(
                (situationReport) => (
                    isDefined(situationReport.type.type) // FIXME: fix typings in server side
                ),
            ),
            (situationReport) => situationReport.type.type,
        )), [situationReportsResponse?.results]);

    const situationReportsRendererParams = useCallback(
        (_: number, value: SituationReportType) => ({
            to: value.document ?? undefined,
            children: value.name,
            withExternalLinkIcon: true,
        }),
        [],
    );

    return (
        <div className={styles.emergencyReportAndDocument}>
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse.featured_documents)
                && emergencyResponse.featured_documents.length > 0 && (
                <Container
                    heading={strings.featuredDocuments}
                    childrenContainerClassName={styles.featuredDocumentList}
                    withHeaderBorder
                >
                    {emergencyResponse.featured_documents.map(
                        (featuredDocument) => (
                            <Container
                                className={styles.featuredDocument}
                                key={featuredDocument.id}
                                childrenContainerClassName={styles.documentDetails}
                            >
                                <Image
                                    className={styles.image}
                                    src={featuredDocument.thumbnail}
                                    alt={featuredDocument.title ?? undefined}
                                />
                                <TextOutput
                                    className={styles.documentTitle}
                                    value={(
                                        <Link
                                            to={featuredDocument.file}
                                        >
                                            {featuredDocument.title}
                                        </Link>
                                    )}
                                    descriptionClassName={styles.description}
                                    description={featuredDocument.description}
                                />
                            </Container>
                        ),
                    )}
                </Container>
            )}
            {isDefined(situationReportsResponse)
                && isDefined(situationReportsResponse.results)
                && situationReportsResponse.results?.length > 0 && (
                <Container
                    heading={strings.situationReports}
                    childrenContainerClassName={styles.situationReportList}
                    withHeaderBorder
                >
                    {Object.entries(groupedSituationReports).map(([reportType, reports]) => (
                        <Container
                            className={styles.situationReport}
                            key={reportType}
                            heading={reportType}
                            withHeaderBorder
                            childrenContainerClassName={styles.reports}
                        >

                            <List
                                className={styles.reports}
                                data={reports}
                                keySelector={numericIdSelector}
                                renderer={Link}
                                errored={false}
                                pending={false}
                                filtered={false}
                                rendererParams={situationReportsRendererParams}
                                compact
                            />
                        </Container>
                    ))}
                </Container>
            )}
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse.field_reports)
                && emergencyResponse.field_reports.length > 0 && (
                <Container
                    heading={strings.fieldReports}
                    withHeaderBorder
                >
                    <Table
                        pending={false}
                        filtered={false}
                        className={styles.table}
                        columns={columns}
                        keySelector={numericIdSelector}
                        data={emergencyResponse.field_reports}
                    />
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'EmergencyReportAndDocument';
