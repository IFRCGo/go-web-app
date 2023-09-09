import { useState, useMemo, useCallback } from 'react';
import { sumSafe, hasSomeDefinedValue } from '#utils/common';
import { useOutletContext } from 'react-router-dom';
import {
    compareNumber,
    isDefined,
    isNotDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    InformationLineIcon,
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Button from '#components/Button';
import Container from '#components/Container';
import DropdownMenuItem from '#components/DropdownMenuItem';
import KeyFigure from '#components/KeyFigure';
import Message from '#components/Message';
import Pager from '#components/Pager';
import PieChart from '#components/PieChart';
import Table from '#components/Table';
import TextOutput from '#components/TextOutput';
import Tooltip from '#components/Tooltip';
import type { EmergencyOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import {
    createActionColumn,
    createDateColumn,
    createListDisplayColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import {
    numericIdSelector,
    numericCountSelector,
    stringTitleSelector,
} from '#utils/selectors';

import ActivityDetail from './ActivityDetail';
import ActivitiesMap from './ActivitesMap';
import Filters, { type FilterValue } from './Filters';
import useEmergencyProjectStats, { getPeopleReached } from './useEmergencyProjectStats';
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
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [activePage, setActivePage] = useState(1);
    const { emergencyResponse } = useOutletContext<EmergencyOutletContext>();
    const [filters, setFilters] = useState<FilterValue>({
        reporting_ns: [],
        deployed_eru: [],
        sector: [],
        status: [],
        country: [],
        districts: [],
    });

    const isFiltered = hasSomeDefinedValue(filters);

    const {
        response: emergencyProjectListResponse,
        pending: emergencyProjectListResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        skip: (isNotDefined(emergencyResponse?.id)),
        query: isDefined(emergencyResponse) ? {
            event: [emergencyResponse.id],
            limit: 100,
        } : undefined,
    });

    const handleFilterValuesChange = useCallback((...args: Parameters<typeof setFilters>) => {
        setActivePage(1);
        setFilters(...args);
    }, []);

    const filteredProjectList = filterEmergencyProjects(
        emergencyProjectListResponse?.results ?? [],
        filters,
    );

    const {
        emergencyProjectCountByDistrict,
        emergencyProjectCountListBySector,
        emergencyProjectCountListByStatus,
        peopleReached,
        sectorGroupedEmergencyProjects,
        uniqueEruCount,
        uniqueNsCount,
        uniqueSectorCount,
    } = useEmergencyProjectStats(
        emergencyProjectListResponse?.results,
        filteredProjectList,
    );

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
            createActionColumn<EmergencyProject, number>(
                'actions',
                (item) => ({
                    extraActions: (
                        <>
                            <DropdownMenuItem
                                type="link"
                                to="threeWActivityDetail"
                                urlParams={{ activityId: item.id }}
                                icons={<ShareBoxLineIcon />}
                            >
                                {strings.threeWViewDetails}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                type="link"
                                to="threeWActivityEdit"
                                urlParams={{ activityId: item.id }}
                                icons={<PencilFillIcon />}
                            >
                                {strings.threeWEdit}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                type="link"
                                to="newThreeWActivity"
                                state={{ activityId: item.id }}
                                icons={<CopyLineIcon />}
                            >
                                {strings.threeWDuplicate}
                            </DropdownMenuItem>
                        </>
                    ),
                }),
            ),
        ]),
        [strings],
    );

    const aggreatedProjectCountListBySector = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListBySector)
    ), [emergencyProjectCountListBySector]);

    const aggreatedProjectCountListByStatus = useMemo(() => (
        getAggregatedValues(emergencyProjectCountListByStatus)
    ), [emergencyProjectCountListByStatus]);

    const paginatedEmergencyProjectList = useMemo(() => {
        const offset = ITEM_PER_PAGE * (activePage - 1);
        return filteredProjectList.slice(offset, offset + ITEM_PER_PAGE);
    }, [filteredProjectList, activePage]);

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

    const noActivitiesBySector = (isNotDefined(sectorGroupedEmergencyProjectList)
        || (isDefined(sectorGroupedEmergencyProjectList)
            && (sectorGroupedEmergencyProjectList.length < 1)));

    return (
        <div className={styles.emergencyActivities}>
            <Container
                withHeaderBorder
                footerContent={(
                    <div className={styles.chartDescription}>
                        <InformationLineIcon />
                        {strings.chartDescription}
                    </div>
                )}
                actions={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        title={strings.addThreeWActivity}
                    >
                        {strings.addThreeWActivity}
                    </Button>
                )}
            >
                {emergencyProjectListResponsePending && <BlockLoading />}
                {!emergencyProjectListResponsePending && (
                    <div className={styles.keyFigureCardList}>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={(uniqueNsCount + uniqueEruCount)}
                                description={strings.uniqueEruAndNationalSocietyCount}
                            />
                            <div className={styles.separator} />
                            <div className={styles.keyFigure}>
                                <KeyFigure
                                    className={styles.keyFigure}
                                    value={peopleReached}
                                    description={strings.peopleReached}
                                />
                                <Tooltip className={styles.tooltip}>
                                    {strings.peopleReachedTooltip}
                                </Tooltip>
                            </div>
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={uniqueSectorCount}
                                description={strings.uniqueSectorCount}
                            />
                            <div className={styles.separator} />
                            <div>
                                <TextOutput
                                    value={strings.activitySectors}
                                />
                                <PieChart
                                    className={styles.pieChart}
                                    data={aggreatedProjectCountListBySector}
                                    valueSelector={numericCountSelector}
                                    labelSelector={stringTitleSelector}
                                    keySelector={stringTitleSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </div>
                        </div>
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={emergencyProjectListResponse?.count}
                                description={strings.totalActivities}
                            />
                            <div className={styles.separator} />
                            <div>
                                <TextOutput
                                    value={strings.activityStatus}
                                />
                                <PieChart
                                    className={styles.pieChart}
                                    data={aggreatedProjectCountListByStatus}
                                    valueSelector={numericCountSelector}
                                    labelSelector={stringTitleSelector}
                                    keySelector={stringTitleSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Container>
            <Container
                className={styles.responseActivities}
                childrenContainerClassName={styles.content}
                heading={strings.responseActivities}
                withHeaderBorder
                actions={(
                    <Button
                        variant="secondary"
                        name={undefined}
                        title={strings.addThreeWActivity}
                    >
                        {strings.addThreeWActivity}
                    </Button>
                )}
                filters={(
                    <Filters
                        value={filters}
                        onChange={handleFilterValuesChange}
                    />
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
                <ActivitiesMap
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
                <Table
                    filtered={isFiltered}
                    pending={emergencyProjectListResponsePending}
                    data={paginatedEmergencyProjectList}
                    columns={columns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'EmergencyActivities';
