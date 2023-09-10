import {
    useMemo,
    useCallback,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { DownloadLineIcon } from '@ifrc-go/icons';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import Container from '#components/Container';
import Image from '#components/Image';
import Link, { Props as LinkProps } from '#components/Link';
import Pager from '#components/Pager';
import Table from '#components/Table';
import RawList from '#components/RawList';
import useFilterState from '#hooks/useFilterState';
import useRegion, { type Region } from '#hooks/domain/useRegion';
import useTranslation from '#hooks/useTranslation';
import { adminUrl } from '#config';
import { numericIdSelector } from '#utils/selectors';
import { resolveToString } from '#utils/translation';
import { resolveUrl } from '#utils/resolveUrl';
import { useRequest } from '#utils/restRequest';
import { type EmergencyOutletContext } from '#utils/outletContext';
import { type GoApiResponse } from '#utils/restRequest';
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
type FieldReportListItem = NonNullable<NonNullable<NonNullable<EmergencyOutletContext['emergencyResponse']>>['field_reports']>[number] & { regions: Region[] };
type AppealDocumentType = NonNullable<NonNullable<GoApiResponse<'/api/v2/appeal_document/'>>['results']>[number];

const PAGE_SIZE = 10;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const {
        page: appealDocumentsPage,
        setPage: setAppealDocumentsPage,
    } = useFilterState({}, undefined);
    const {
        page: fieldReportsPage,
        setPage: setFieldReportsPage,
    } = useFilterState({}, undefined);

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
           || ((isDefined(emergencyResponse)
            && isDefined(emergencyResponse.appeals)
            && emergencyResponse.appeals.length < 1)),
        url: '/api/v2/appeal_document/',
        query: isDefined(emergencyResponse) ? {
            /* FIXME: instead of sending list of appeals the API should be able to filter
             *  appeals document by emergency id
             */
            appeal: emergencyResponse.appeals.map((appeal) => appeal.id).filter(isDefined),
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (appealDocumentsPage - 1),
        } : undefined, // TODO: fix typing issue in server
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
        [strings],
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
                    withExternalLinkIcon: true,
                    to: item.document ?? item.document_url ?? undefined,
                }),
            ),
        ]),
        [strings],
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
                    {/* FIXME: use Grid */}
                    {emergencyResponse.featured_documents.map(
                        (featuredDocument) => (
                            <div
                                className={styles.featuredDocument}
                                key={featuredDocument.id}
                            >
                                <Image
                                    className={styles.imageContainer}
                                    imageClassName={styles.img}
                                    src={featuredDocument.thumbnail}
                                    alt=""
                                />
                                <div className={styles.details}>
                                    <Link
                                        to={featuredDocument.file}
                                        external
                                        withExternalLinkIcon
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
                            to={resolveUrl(adminUrl, `api/event/${emergencyResponse?.id}/change`)}
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
                        { count: emergencyResponse.field_reports.length },
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
                        { count: appealDocumentsResponse?.count },
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
