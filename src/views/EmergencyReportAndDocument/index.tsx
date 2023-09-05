import {
    useMemo, useCallback, useContext, useState,
} from 'react';
import { useOutletContext, generatePath } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    unique,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Link from '#components/Link';
import List from '#components/List';
import Pager from '#components/Pager';
import RouteContext from '#contexts/route';
import Table from '#components/Table';
import TextOutput from '#components/TextOutput';
import useRegion from '#hooks/domain/useRegion';
import useTranslation from '#hooks/useTranslation';
import { adminUrl } from '#config';
import { numericIdSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import { resolveUrl } from '#utils/resolveUrl';
import { useRequest } from '#utils/restRequest';
import type { EmergencyOutletContext } from '#utils/outletContext';
import type { GoApiResponse } from '#utils/restRequest';
import {
    createDateColumn,
    createLinkColumn,
    createCountryListColumn,
    createRegionListColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SituationReportType = NonNullable<NonNullable<GoApiResponse<'/api/v2/situation_report/'>>['results']>[number];
type FieldReportListItem = NonNullable<NonNullable<NonNullable<EmergencyOutletContext['emergencyResponse']>>['field_reports']>[number];
type AppealDocumentType = NonNullable<NonNullable<GoApiResponse<'/api/v2/appeal_document/'>>['results']>[number];

const PAGE_SIZE = 25;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const [page, setPage] = useState(1);
    const {
        fieldReportDetails: fieldReportDetailsRoute,
    } = useContext(RouteContext);

    const regions = useRegion();

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

    const {
        pending: appealDocumentsPending,
        response: appealDocumentsResponse,
    } = useRequest({
        skip: isNotDefined(emergencyResponse?.appeals)
           || (isDefined(emergencyResponse)
            && isDefined(emergencyResponse.appeals)
            && emergencyResponse.appeals.length < 1),
        url: '/api/v2/appeal_document/',
        query: isDefined(emergencyResponse) ? {
            appeal__in: emergencyResponse.appeals.map((appeal) => appeal.id).filter(isDefined),
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
        } : undefined, // TODO: fix typing issue in server
    });

    const getRegionList = useCallback((regionList: number[]) => (
        regionList.map((region) => regions?.find((r) => r.id === region))
            .filter(isDefined)
    ), [regions]);

    const columns = useMemo(
        () => ([
            createDateColumn<FieldReportListItem, number>(
                'created_at',
                strings.fieldReportsTableCreatedAt,
                (item) => item.created_at,
                {
                    columnClassName: styles.date,
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
            createRegionListColumn<FieldReportListItem, number>(
                'regions',
                strings.fieldReportsTableRegion,
                (item) => {
                    const ids = unique(item.countries.map((country) => country.region))
                        .filter(isDefined);
                    return getRegionList(ids);
                },
            ),
        ]),
        [strings, fieldReportDetailsRoute, getRegionList],
    );

    const appealColumns = useMemo(
        () => ([
            createDateColumn<AppealDocumentType, number>(
                'created_at',
                strings.appealDocumentDate,
                (item) => item.created_at,
                {
                    columnClassName: styles.date,
                },
            ),
            createStringColumn<AppealDocumentType, number>(
                'iso',
                strings.appealDocumentLocation,
                (item) => item.iso,
            ),
            createStringColumn<AppealDocumentType, number>(
                'code',
                strings.appealDocumentCode,
                (item) => item.appeal,
            ),
            createStringColumn<AppealDocumentType, number>(
                'description',
                strings.appealDocumentDescription,
                (item) => item.description,
            ),
            createLinkColumn<AppealDocumentType, number>(
                'name',
                strings.appealDocumentLink,
                (item) => item.name,
                (item) => ({
                    to: item.document ?? item.document_url,
                }),
            ),
        ]),
        [strings],
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
            to: value.document ?? value.document_url,
            children: value.name,
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
                    heading={strings.responseDocuments}
                    childrenContainerClassName={styles.situationReportList}
                    withHeaderBorder
                    actions={(
                        <Link
                            variant="secondary"
                            to={resolveUrl(adminUrl, `api/event/${emergencyResponse?.id}/change`)}
                            title={strings.addAReportLink}
                        >
                            {strings.addAReportLink}
                        </Link>
                    )}
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
                    heading={resolveToString(
                        strings.fieldReports,
                        { count: emergencyResponse.field_reports.length },
                    )}
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
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse.appeals)
                && emergencyResponse.appeals.length > 0 && (
                <Container
                    heading={resolveToString(
                        strings.appealDocuments,
                        { count: appealDocumentsResponse?.count },
                    )}
                    withHeaderBorder
                    footerActions={(
                        <Pager
                            activePage={page}
                            itemsCount={appealDocumentsResponse?.count ?? 0}
                            maxItemsPerPage={PAGE_SIZE}
                            onActivePageChange={setPage}
                        />
                    )}
                >
                    <Table
                        pending={appealDocumentsPending}
                        filtered={false}
                        className={styles.table}
                        columns={appealColumns}
                        keySelector={numericIdSelector}
                        data={appealDocumentsResponse?.results}
                    />
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'EmergencyReportAndDocument';
