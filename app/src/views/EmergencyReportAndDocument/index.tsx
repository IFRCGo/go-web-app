import {
    useCallback,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import {
    Container,
    Image,
    Pager,
    RawList,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
    numericIdSelector,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import Link, { type Props as LinkProps } from '#components/Link';
import { adminUrl } from '#config';
import useRegion, { type Region } from '#hooks/domain/useRegion';
import useFilterState from '#hooks/useFilterState';
import {
    createCountryListColumn,
    createLinkColumn,
    createRegionListColumn,
} from '#utils/domain/tableHelpers';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { resolveUrl } from '#utils/resolveUrl';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type SituationReportType = NonNullable<NonNullable<GoApiResponse<'/api/v2/situation_report/'>>['results']>[number];
type FieldReportListItem = NonNullable<NonNullable<NonNullable<EmergencyOutletContext['emergencyResponse']>>['field_reports']>[number] & { regions: Region[] };
type AppealDocumentType = NonNullable<NonNullable<GoApiResponse<'/api/v2/appeal_document/'>>['results']>[number];

const PAGE_SIZE = 10;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const {
        page: appealDocumentsPage,
        offset: appealDocumentsOffset,
        setPage: setAppealDocumentsPage,
        limit: appealDocumentsLimit,
        ordering: orderingAppealDocuments,
        sortState: sortStateAppealDocuments,
    } = useFilterState<object>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const {
        page: fieldReportsPage,
        setPage: setFieldReportsPage,
    } = useFilterState<object>({
        filter: {},
    });

    const regions = useRegion();

    const {
        response: situationReportsResponse,
    } = useRequest({
        skip: isNotDefined(emergencyResponse),
        url: '/api/v2/situation_report/',
        query: isDefined(emergencyResponse) ? {
            event: emergencyResponse.id,
            limit: 9999,
            ordering: '-is_pinned,-created_at',
        } : undefined, // TODO: we need to add search filter in server
    });

    const defaultOrdering = '-created_at';
    const orderingWithFallback = useMemo(() => {
        if (isNotDefined(orderingAppealDocuments)) {
            return defaultOrdering;
        }

        if (orderingAppealDocuments === '-id') {
            return '-created_at';
        }

        if (orderingAppealDocuments === 'created_at' || orderingAppealDocuments === '-created_at') {
            return orderingAppealDocuments;
        }

        // Add default ordering as second ordering
        return [orderingAppealDocuments, defaultOrdering].join(',');
    }, [orderingAppealDocuments]);

    const {
        pending: appealDocumentsPending,
        response: appealDocumentsResponse,
    } = useRequest({
        skip: isNotDefined(emergencyResponse?.appeals)
           || ((isDefined(emergencyResponse)
            && isDefined(emergencyResponse.appeals)
            && emergencyResponse.appeals.length < 1)),
        url: '/api/v2/appeal_document/',
        query: isDefined(emergencyResponse) ? {
            /* FIXME: instead of sending list of appeals the API should be able to filter
             *  appeals document by emergency id
             */
            appeal: emergencyResponse.appeals.map((appeal) => appeal.id).filter(isDefined),
            limit: appealDocumentsLimit,
            offset: appealDocumentsOffset,
            ordering: orderingWithFallback,
        } : undefined,
    });

    const regionsMap = useMemo(() => (
        listToMap(regions ?? [], (region) => region.id)
    ), [regions]);

    const getRegionList = useCallback((regionList: number[]) => (
        regionList.map((region) => regionsMap[region])
            .filter(isDefined)
    ), [regionsMap]);

    const fieldReports = useMemo(() => {
        const sliceStart = PAGE_SIZE * (fieldReportsPage - 1);
        const sliceEnd = sliceStart + PAGE_SIZE;

        const transformedFieldReports = emergencyResponse?.field_reports.map((fieldReport) => {
            const regionsIds = unique(fieldReport.countries.map((country) => country.region))
                .filter(isDefined);

            return {
                ...fieldReport,
                regions: getRegionList(regionsIds),
            };
        }).slice(
            sliceStart,
            sliceEnd,
        );

        return transformedFieldReports;
    }, [emergencyResponse?.field_reports, getRegionList, fieldReportsPage]);

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
                    to: 'fieldReportDetails',
                    urlParams: { fieldReportId: item.id },
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
                (item) => item.regions,
            ),
        ]),
        [
            strings.fieldReportsTableCreatedAt,
            strings.fieldReportsTableName,
            strings.fieldReportsTableCountry,
            strings.fieldReportsTableRegion,
        ],
    );

    const appealColumns = useMemo(
        () => ([
            createDateColumn<AppealDocumentType, number>(
                'created_at',
                strings.appealDocumentDate,
                (item) => item.created_at,
                {
                    columnClassName: styles.date,
                    sortable: true,
                },
            ),
            createStringColumn<AppealDocumentType, number>(
                'type',
                strings.appealDocumentType,
                (item) => item.type,
                { sortable: true },
            ),
            createStringColumn<AppealDocumentType, number>(
                'code',
                strings.appealDocumentCode,
                (item) => item.appeal.code,
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
                    external: true,
                    withLinkIcon: true,
                    href: item.document ?? item.document_url ?? undefined,
                }),
                {
                    sortable: true,
                },
            ),
        ]),
        [
            strings.appealDocumentDate,
            strings.appealDocumentType,
            strings.appealDocumentCode,
            strings.appealDocumentDescription,
            strings.appealDocumentLink,
        ],
    );

    const groupedSituationReports = useMemo(() => (
        listToGroupList(
            situationReportsResponse?.results?.filter(
                (situationReport) => (
                    isDefined(situationReport.type.type)
                ),
            ) ?? [],
            (situationReport) => situationReport.type.type,
        )), [situationReportsResponse?.results]);

    const situationReportsRendererParams = useCallback(
        (_: number, value: SituationReportType): LinkProps => ({
            icons: <DownloadLineIcon className={styles.icon} />,
            external: true,
            href: value.document ?? value.document_url,
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
                    {/* FIXME: use Grid */}
                    {emergencyResponse.featured_documents.map(
                        (featuredDocument) => (
                            <div
                                className={styles.featuredDocument}
                                key={featuredDocument.id}
                            >
                                <Image
                                    className={styles.imageContainer}
                                    imgElementClassName={styles.img}
                                    src={featuredDocument.thumbnail}
                                    alt={strings.emergencyReportAndDocumentImageAlt}
                                />
                                <div className={styles.details}>
                                    <Link
                                        href={featuredDocument.file}
                                        external
                                        withLinkIcon
                                    >
                                        {featuredDocument.title}
                                    </Link>
                                    <div>
                                        {featuredDocument.description}
                                    </div>
                                </div>
                            </div>
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
                            external
                            href={resolveUrl(adminUrl, `api/event/${emergencyResponse?.id}/change`)}
                            title={strings.addAReportLink}
                        >
                            {strings.addAReportLink}
                        </Link>
                    )}
                >
                    {/* FIXME: lets no use object.entries here, also Grid can be used */}
                    {Object.entries(groupedSituationReports).map(([reportType, reports]) => (
                        <Container
                            className={styles.situationReport}
                            key={reportType}
                            heading={reportType}
                            withHeaderBorder
                            withInternalPadding
                            childrenContainerClassName={styles.reports}
                            headingLevel={4}
                        >
                            <RawList
                                data={reports}
                                keySelector={numericIdSelector}
                                renderer={Link}
                                rendererParams={situationReportsRendererParams}
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
                        { count: emergencyResponse.field_reports.length ?? '--' },
                    )}
                    withHeaderBorder
                    footerActions={(
                        <Pager
                            activePage={fieldReportsPage}
                            itemsCount={emergencyResponse?.field_reports.length ?? 0}
                            maxItemsPerPage={PAGE_SIZE}
                            onActivePageChange={setFieldReportsPage}
                        />
                    )}
                >
                    <Table
                        pending={false}
                        filtered={false}
                        className={styles.table}
                        columns={columns}
                        keySelector={numericIdSelector}
                        data={fieldReports}
                    />
                </Container>
            )}
            {isDefined(emergencyResponse)
                && isDefined(emergencyResponse.appeals)
                && emergencyResponse.appeals.length > 0 && (
                <Container
                    heading={resolveToString(
                        strings.appealDocuments,
                        { count: appealDocumentsResponse?.count ?? '--' },
                    )}
                    withHeaderBorder
                    footerActions={(
                        <Pager
                            activePage={appealDocumentsPage}
                            itemsCount={appealDocumentsResponse?.count ?? 0}
                            maxItemsPerPage={PAGE_SIZE}
                            onActivePageChange={setAppealDocumentsPage}
                        />
                    )}
                >
                    <SortContext.Provider value={sortStateAppealDocuments}>
                        <Table
                            pending={appealDocumentsPending}
                            filtered={false}
                            className={styles.table}
                            columns={appealColumns}
                            keySelector={numericIdSelector}
                            data={appealDocumentsResponse?.results}
                        />
                    </SortContext.Provider>
                </Container>
            )}
        </div>
    );
}

Component.displayName = 'EmergencyReportAndDocument';
