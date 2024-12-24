import {
    useCallback,
    useMemo,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { InformationLineIcon } from '@ifrc-go/icons';
import {
    BlockLoading,
    Container,
    InfoPopup,
    KeyFigure,
    Message,
    Pager,
    PieChart,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createListDisplayColumn,
    createNumberColumn,
    createStringColumn,
    numericCountSelector,
    numericIdSelector,
    stringTitleSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import Link from '#components/Link';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { type CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';
import ActivityActions, { type Props as ActivityActionsProps } from '#views/EmergencyActivities/ActivityActions';
import ActivityDetail from '#views/EmergencyActivities/ActivityDetail';
import useEmergencyProjectStats, { getPeopleReached } from '#views/EmergencyActivities/useEmergencyProjectStats';

import Filters, { type FilterValue } from './Filters';
import ResponseActivitiesMap from './ResponseActivitiesMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EmergencyProjectResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type EmergencyProject = NonNullable<EmergencyProjectResponse['results']>[number];
type DistrictDetails = EmergencyProject['districts_details'][number];

type ProjectKey = 'reporting_ns' | 'deployed_eru' | 'status' | 'country' | 'districts';
type FilterKey = ProjectKey | 'sector';
const ITEM_PER_PAGE = 10;
const MAX_ITEMS = 4;

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function filterEmergencyProjects(
    emergencyProjectList: EmergencyProject[],
    filters: Partial<Record<FilterKey, (number | string)[]>>,
) {
    return emergencyProjectList.filter((emergencyProject) => (
        Object.entries(filters).every(([filterKey, filterValue]) => {
            if (isNotDefined(filterValue) || filterValue.length === 0) {
                return true;
            }
            if (filterKey === 'sector') {
                const projectValue = emergencyProject.activities
                    ?.map((activity) => activity.sector) ?? undefined;
                return projectValue?.some((v) => filterValue.includes(v));
            }
            const projectValue = emergencyProject[filterKey as ProjectKey];

            if (isNotDefined(projectValue)) {
                return false;
            }

            if (Array.isArray(projectValue)) {
                return projectValue.some((v) => filterValue.includes(v));
            }

            return filterValue.includes(projectValue);
        })
    ));
}

function DistrictNameOutput({ districtName }: { districtName: string }) {
    return districtName;
}

function getAggregatedValues(values: { title: string, count: number }[]) {
    const sortedValues = [...values].sort((a, b) => compareNumber(b.count, a.count));

    if (sortedValues.length <= MAX_ITEMS) {
        return sortedValues;
    }

    const remains = sortedValues.splice(
        MAX_ITEMS - 1,
        sortedValues.length - (MAX_ITEMS - 1),
    );
    const otherCount = sumSafe(remains.map((d) => d.count));
    if (isDefined(otherCount) && otherCount > 0) {
        sortedValues.push({
            title: 'Others',
            count: otherCount,
        });
    }

    return sortedValues;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();
    const strings = useTranslation(i18n);
    const alert = useAlert();

    const {
        rawFilter,
        filter: filters,
        setFilter: setFilters,
        page: activePage,
        setPage: setActivePage,
        filtered: isFiltered,
        limit,
        offset,
    } = useFilterState<FilterValue>({
        filter: {
            reporting_ns: [],
            deployed_eru: [],
            sector: [],
            status: [],
            districts: [],
        },
        pageSize: ITEM_PER_PAGE,
    });

    const {
        response: emergencyProjectListResponse,
        pending: emergencyProjectListResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        skip: isNotDefined(countryId),
        query: isDefined(countryId) ? {
            country: [Number(countryId)],
            limit: 9999,
        } : undefined,
    });

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.failedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, `${countryResponse?.name}-emergency-activities.csv`);
        },
    });

    const handleExportClick = useCallback(() => {
        if (!emergencyProjectListResponse?.count || !countryId) {
            return;
        }
        triggerExportStart(
            '/api/v2/emergency-project/',
            emergencyProjectListResponse.count,
            {
                country: [Number(countryId)],
            },
        );
    }, [
        triggerExportStart,
        countryId,
        emergencyProjectListResponse?.count,
    ]);

    const filteredProjectList = filterEmergencyProjects(
        emergencyProjectListResponse?.results ?? [],
        filters,
    );

    const {
        emergencyProjectCountByDistrict,
        emergencyProjectCountListBySector,
        emergencyProjectCountListByStatus,
        sectorGroupedEmergencyProjects,
        peopleReached,
        uniqueEruCount,
        uniqueNsCount,
        uniqueSectorCount,
    } = useEmergencyProjectStats(
        emergencyProjectListResponse?.results,
        filteredProjectList,
    );

    const aggregatedProjectCountListBySector = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListBySector)
    ), [emergencyProjectCountListBySector]);

    const aggregatedProjectCountListByStatus = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListByStatus)
    ), [emergencyProjectCountListByStatus]);

    const paginatedEmergencyProjectList = useMemo(() => (
        filteredProjectList.slice(offset, offset + limit)
    ), [filteredProjectList, offset, limit]);

    const sectorGroupedEmergencyProjectList = useMemo(() => (
        mapToList(
            sectorGroupedEmergencyProjects,
            (value, key) => ({
                sector: key,
                projects: value.projects,
                sectorDetails: value.sectorDetails,
            }),
        )
    ), [sectorGroupedEmergencyProjects]);

    const columns = useMemo(
        () => ([
            createStringColumn<EmergencyProject, number>(
                'national_society_eru',
                strings.emergencyProjectNationalSociety,
                (item) => (
                    item.activity_lead === 'deployed_eru'
                        ? item.deployed_eru_details
                            ?.eru_owner_details
                            ?.national_society_country_details
                            ?.society_name
                        : item.reporting_ns_details?.society_name
                ),
            ),
            createStringColumn<EmergencyProject, number>(
                'title',
                strings.emergencyProjectTitle,
                (item) => item.title,
            ),
            createDateColumn<EmergencyProject, number>(
                'start_date',
                strings.emergencyProjectStartDate,
                (item) => item.start_date,
            ),
            createStringColumn<EmergencyProject, number>(
                'country',
                strings.emergencyProjectCountry,
                (item) => item.country_details?.name,
            ),
            createListDisplayColumn<
                EmergencyProject,
                number,
                DistrictDetails,
                { districtName: string }
            >(
                'districts',
                strings.emergencyProjectDistrict,
                (activity) => ({
                    list: activity.districts_details,
                    renderer: DistrictNameOutput,
                    rendererParams: (districtDetail) => ({ districtName: districtDetail.name }),
                    keySelector: (districtDetail) => districtDetail.id,
                }),
            ),
            createStringColumn<EmergencyProject, number>(
                'status',
                strings.emergencyProjectStatus,
                (item) => item.status_display,
            ),
            createNumberColumn<EmergencyProject, number>(
                'people_reached',
                strings.emergencyProjectPeopleReached,
                (item) => getPeopleReached(item),
            ),
            createElementColumn<EmergencyProject, number, ActivityActionsProps>(
                'actions',
                '',
                ActivityActions,
                (_, item) => ({
                    activityId: item.id,
                    className: styles.activityActions,
                }),
            ),
        ]),
        [
            strings.emergencyProjectNationalSociety,
            strings.emergencyProjectTitle,
            strings.emergencyProjectStartDate,
            strings.emergencyProjectCountry,
            strings.emergencyProjectDistrict,
            strings.emergencyProjectStatus,
            strings.emergencyProjectPeopleReached,
        ],
    );

    const noActivitiesBySector = (isNotDefined(sectorGroupedEmergencyProjectList)
        || (isDefined(sectorGroupedEmergencyProjectList)
            && (sectorGroupedEmergencyProjectList.length < 1)));

    return (
        <div className={styles.threewActivities}>
            <Container
                headerDescription={strings.threeWActivityDescription}
                footerContent={(
                    <div className={styles.chartDescription}>
                        <InformationLineIcon className={styles.icon} />
                        {strings.chartDescription}
                    </div>
                )}
                actions={(
                    <Link
                        variant="secondary"
                        title={strings.addThreeWActivity}
                        to="newThreeWActivity"
                    >
                        {strings.addThreeWActivity}
                    </Link>
                )}
            >
                {emergencyProjectListResponsePending && <BlockLoading />}
                {!emergencyProjectListResponsePending && (
                    <div className={styles.keyFigureCardList}>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={(uniqueNsCount + uniqueEruCount)}
                                label={strings.uniqueEruAndNationalSocietyCount}
                            />
                            <KeyFigure
                                className={styles.keyFigure}
                                value={peopleReached}
                                label={strings.peopleInNeedReached}
                                info={(
                                    <InfoPopup
                                        description={strings.peopleReachedTooltip}
                                    />
                                )}
                                compactValue
                            />
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={uniqueSectorCount}
                                label={strings.uniqueSectorCount}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={aggregatedProjectCountListBySector}
                                valueSelector={numericCountSelector}
                                labelSelector={stringTitleSelector}
                                keySelector={stringTitleSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={emergencyProjectListResponse?.count}
                                label={strings.totalActivities}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={aggregatedProjectCountListByStatus}
                                valueSelector={numericCountSelector}
                                labelSelector={stringTitleSelector}
                                keySelector={stringTitleSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                    </div>
                )}
            </Container>
            <Container
                className={styles.responseActivities}
                childrenContainerClassName={styles.content}
                heading={strings.responseActivities}
                withHeaderBorder
                filters={(
                    <Filters
                        value={rawFilter}
                        onChange={setFilters}
                        countryId={countryId}
                    />
                )}
                actions={(
                    <Link
                        to="allThreeWActivity"
                        withLinkIcon
                        withUnderline
                        urlSearch={`country=${countryId}`}
                    >
                        {strings.threeWViewAllActivityLabel}
                    </Link>
                )}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        onActivePageChange={setActivePage}
                        itemsCount={filteredProjectList.length}
                        maxItemsPerPage={ITEM_PER_PAGE}
                    />
                )}
            >
                <ResponseActivitiesMap
                    emergencyProjectCountByDistrict={emergencyProjectCountByDistrict}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            heading={strings.activitiesBySector}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                        >
                            {noActivitiesBySector && (
                                <Message
                                    title={strings.dataNotAvailable}
                                    compact
                                />
                            )}
                            {sectorGroupedEmergencyProjectList.map((sectorGroupedProject) => (
                                <ActivityDetail
                                    key={sectorGroupedProject.sector}
                                    sectorDetails={sectorGroupedProject.sectorDetails}
                                    projects={sectorGroupedProject.projects}
                                />
                            ))}
                        </Container>
                    )}
                />
                <Container
                    actions={(
                        <ExportButton
                            onClick={handleExportClick}
                            progress={progress}
                            pendingExport={pendingExport}
                            totalCount={emergencyProjectListResponse?.count}
                        />
                    )}
                >
                    <Table
                        filtered={isFiltered}
                        pending={emergencyProjectListResponsePending}
                        data={paginatedEmergencyProjectList}
                        columns={columns}
                        keySelector={numericIdSelector}
                    />
                </Container>
            </Container>
        </div>
    );
}

Component.displayName = 'CountryOngoingActivitiesThreeWActivities';
