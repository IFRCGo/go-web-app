import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import { PencilFillIcon } from '@ifrc-go/icons';
import {
    Container,
    ExpandableContainer,
    KeyFigure,
    Message,
    PieChart,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createElementColumn,
    createNumberColumn,
    createStringColumn,
    denormalizeList,
    hasSomeDefinedValue,
    numericIdSelector,
    numericValueSelector,
    resolveToString,
    stringLabelSelector,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import ProjectActions, { Props as ProjectActionsProps } from '#components/domain/ProjectActions';
import Link from '#components/Link';
import WikiLink from '#components/WikiLink';
import useUserMe from '#hooks/domain/useUserMe';
import useAlert from '#hooks/useAlert';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { PROJECT_STATUS_ONGOING } from '#utils/constants';
import type { CountryOutletContext } from '#utils/outletContext';
import {
    GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import Filter, { FilterValue } from './Filters';
import Map from './Map';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LabelValue {
    label: string;
    value: number;
}

type District = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];
type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

type ProjectKey = 'reporting_ns' | 'project_districts' | 'programme_type' | 'operation_type' | 'programme_type' | 'primary_sector' | 'secondary_sectors';

const emptyDistrictList: District[] = [];
const emptyProjectList: Project[] = [];

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

function filterProjects(projectList: Project[], filters: Partial<Record<ProjectKey, number[]>>) {
    return projectList.filter((project) => (
        Object.entries(filters).every(([filterKey, filterValue]) => {
            const projectValue = project[filterKey as ProjectKey];

            if (isNotDefined(filterValue) || filterValue.length === 0) {
                return true;
            }

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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const alert = useAlert();
    const userMe = useUserMe();
    const strings = useTranslation(i18n);
    const { countryId, countryResponse } = useOutletContext<CountryOutletContext>();

    const [filters, setFilters] = useState<FilterValue>({
        reporting_ns: [],
        project_districts: [],
        operation_type: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
    });

    const isFiltered = hasSomeDefinedValue(filters);

    const {
        pending: projectListPending,
        response: projectListResponse,
        retrigger: reTriggerProjectListRequest,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso),
        url: '/api/v2/project/',
        query: {
            limit: 9999,
            country: isDefined(countryId)
                ? [Number(countryId)]
                : undefined,
        },
    });

    const {
        response: districtListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/district/',
        query: {
            country: countryResponse?.id,
            limit: 9999,
        },
    });

    const districtList = districtListResponse?.results ?? emptyDistrictList;
    const projectList = projectListResponse?.results ?? emptyProjectList;
    const filteredProjectList = filterProjects(projectList, filters);

    const districtIdToDetailMap = useMemo(
        () => listToMap(
            districtList,
            (district) => district.id,
        ),
        [districtList],
    );
    const {
        ongoingProjects,
        targetedPopulation,
        ongoingProjectBudget,
        programmeTypeStats,
        projectStatusTypeStats,
        activeNSCount,
    } = useMemo(() => {
        const projectsOngoing = filteredProjectList
            .filter((p) => p.status === PROJECT_STATUS_ONGOING);

        const ongoingBudget = sumSafe(projectsOngoing?.map((d) => d.budget_amount)) ?? 0;

        const peopleTargeted = sumSafe(filteredProjectList?.map((d) => d.target_total)) ?? 0;

        const programmeTypeGrouped = (
            listToGroupList(
                filteredProjectList,
                (d) => d.programme_type_display,
                (d) => d,
            ) ?? {}
        );

        const programmeTypes: LabelValue[] = mapToList(
            programmeTypeGrouped,
            (d, k) => ({ label: String(k), value: d.length }),
        );

        const statusGrouped = (
            listToGroupList(
                filteredProjectList,
                (d) => d.status_display,
                (d) => d,
            ) ?? {}
        );

        const projectStatusTypes: LabelValue[] = mapToList(
            statusGrouped,
            (d, k) => ({ label: String(k), value: d.length }),
        );

        const numberOfActiveNS = unique(projectsOngoing, (d) => d.reporting_ns)?.length ?? 0;

        return {
            ongoingProjects: projectsOngoing,
            targetedPopulation: peopleTargeted,
            ongoingProjectBudget: ongoingBudget,
            programmeTypeStats: programmeTypes,
            projectStatusTypeStats: projectStatusTypes,
            activeNSCount: numberOfActiveNS,
        };
    }, [filteredProjectList]);

    const districtGroupedProject = useMemo(() => {
        const districtDenormalizedProjectList = denormalizeList(
            ongoingProjects ?? [],
            (project) => project.project_districts_detail,
            (project, district) => ({
                ...project,
                project_district: district,
            }),
        );

        return listToGroupList(
            districtDenormalizedProjectList,
            (d) => d.project_district.id,
        );
    }, [ongoingProjects]);

    const {
        localNSProjects,
        otherNSProjects,
    } = useMemo(() => ({
        localNSProjects: ongoingProjects.filter(
            (project) => project.reporting_ns === project.project_country,
        ),
        otherNSProjects: ongoingProjects.filter(
            (project) => project.reporting_ns !== project.project_country,
        ),
    }), [ongoingProjects]);

    const tableColumns = useMemo(() => ([
        createStringColumn<Project, number>(
            'ns',
            strings.threeWTableNS,
            (item) => item.reporting_ns_detail?.society_name,
        ),
        createStringColumn<Project, number>(
            'name',
            strings.threeWTableProjectName,
            (item) => item.name,
        ),
        createStringColumn<Project, number>(
            'sector',
            strings.threeWTableSector,
            (item) => item.primary_sector_display,
        ),
        createNumberColumn<Project, number>(
            'budget',
            strings.threeWTableTotalBudget,
            (item) => item.budget_amount,
            undefined,
        ),
        createStringColumn<Project, number>(
            'programmeType',
            strings.threeWTableProgrammeType,
            (item) => item.programme_type_display,
        ),
        createStringColumn<Project, number>(
            'disasterType',
            strings.threeWTableDisasterType,
            (item) => item.dtype_detail?.name,
        ),
        createNumberColumn<Project, number>(
            'peopleTargeted',
            strings.threeWTablePeopleTargeted,
            (item) => item.target_total,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'peopleReached',
            strings.threeWTablePeopleReached,
            (item) => item.reached_total,
            undefined,
        ),
        createElementColumn<Project, number, ProjectActionsProps>(
            'actions',
            '',
            ProjectActions,
            (_, project) => ({
                onProjectDeletionSuccess: reTriggerProjectListRequest,
                project,
                className: styles.projectActions,
            }),
        ),
    ]), [
        strings.threeWTableNS,
        strings.threeWTableProjectName,
        strings.threeWTableSector,
        strings.threeWTableTotalBudget,
        strings.threeWTableProgrammeType,
        strings.threeWTableDisasterType,
        strings.threeWTablePeopleTargeted,
        strings.threeWTablePeopleReached,
        reTriggerProjectListRequest,
    ]);

    const districtIdList = Object.keys(districtGroupedProject);

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
            const unparseData = unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, `${countryResponse?.name}-data-export.csv`);
        },
    });

    const handleExportClick = useCallback(() => {
        if (!projectListResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/project/',
            projectListResponse?.count,
            {
                country: isDefined(countryId)
                    ? [countryId]
                    : undefined,
            },
        );
    }, [
        countryId,
        triggerExportStart,
        projectListResponse?.count,
    ]);

    const showActivitiesAndTargetedPopulationCard = activeNSCount > 0 || targetedPopulation > 0;
    const showTotalProjectsAndProgrammeTypeCard = filteredProjectList.length > 0
        || programmeTypeStats.length > 0;
    const showOngoingProjectBudgetAndProjectStatusCard = ongoingProjectBudget > 0
        || projectStatusTypeStats.length > 0;

    const showCardsSection = showActivitiesAndTargetedPopulationCard
        || showTotalProjectsAndProgrammeTypeCard
        || showOngoingProjectBudgetAndProjectStatusCard;

    return (
        <Container
            className={styles.threeWProjects}
            actions={(
                <>
                    {isDefined(userMe?.id) && (
                        <div className={styles.countryThreeWActions}>
                            <Link
                                variant="secondary"
                                to="newThreeWProject"
                                state={{ reportingNsId: countryId }}
                            >
                                {strings.addThreeWProject}
                            </Link>
                        </div>
                    )}
                    <WikiLink
                        href="user_guide/Country_Pages#h-3w-projects"
                    />
                </>

            )}
            headerDescription={strings.threeWProjectDescription}
            withCenteredHeaderDescription
            contentViewType="vertical"
            spacing="loose"
            pending={projectListPending}
        >
            {showCardsSection && (
                <div className={styles.keyFigureCardList}>
                    {showActivitiesAndTargetedPopulationCard && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={activeNSCount}
                                label={strings.activeDeploymentsTitle}
                                labelClassName={styles.keyFigureDescription}
                            />
                            <div className={styles.separator} />
                            <KeyFigure
                                className={styles.keyFigure}
                                value={targetedPopulation}
                                label={strings.targetedPopulationTitle}
                                labelClassName={styles.keyFigureDescription}
                                compactValue
                            />
                        </div>
                    )}
                    {showTotalProjectsAndProgrammeTypeCard && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={filteredProjectList.length}
                                label={strings.totalProjectsTitle}
                                labelClassName={styles.keyFigureDescription}
                            />
                            <div className={styles.separator} />
                            <Container
                                heading={strings.programmeType}
                                headingLevel={5}
                                className={styles.pieChartContainer}
                            >
                                <PieChart
                                    className={styles.pieChart}
                                    data={programmeTypeStats}
                                    valueSelector={numericValueSelector}
                                    labelSelector={stringLabelSelector}
                                    keySelector={stringLabelSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </Container>
                        </div>
                    )}
                    {showOngoingProjectBudgetAndProjectStatusCard && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={ongoingProjectBudget}
                                label={strings.ongoingProjectBudgetTitle}
                                labelClassName={styles.keyFigureDescription}
                                compactValue
                            />
                            <div className={styles.separator} />
                            <Container
                                heading={strings.projectStatus}
                                headingLevel={5}
                                className={styles.pieChartContainer}
                            >
                                <PieChart
                                    className={styles.pieChart}
                                    data={projectStatusTypeStats}
                                    valueSelector={numericValueSelector}
                                    labelSelector={stringLabelSelector}
                                    keySelector={stringLabelSelector}
                                    colors={primaryRedColorShades}
                                    pieRadius={40}
                                    chartPadding={10}
                                />
                            </Container>
                        </div>
                    )}
                </div>
            )}
            <Container
                className={styles.ongoingProjects}
                heading={strings.threeWOngoingProjectsTitle}
                withHeaderBorder
                childrenContainerClassName={styles.content}
                filters={(
                    <Filter
                        value={filters}
                        onChange={setFilters}
                        districtList={districtList}
                    />
                )}
                actions={(
                    <>
                        <ExportButton
                            onClick={handleExportClick}
                            progress={progress}
                            pendingExport={pendingExport}
                            totalCount={projectListResponse?.count}
                        />
                        <Link
                            to="allThreeWProject"
                            urlSearch={`country=${countryResponse?.id}`}
                            withLinkIcon
                        >
                            {strings.viewAllProjects}
                        </Link>
                    </>
                )}
            >
                <Map
                    projectList={ongoingProjects}
                    districtList={districtList}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            heading={strings.threeWInCountryMapSidebarTitle}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                        >
                            {districtIdList.map((districtId) => {
                                const projectsInDistrict = districtGroupedProject[districtId];

                                if (isNotDefined(projectsInDistrict)
                                    || projectsInDistrict.length === 0
                                ) {
                                    return null;
                                }

                                const district = districtIdToDetailMap[+districtId];

                                if (isNotDefined(district)) {
                                    return (
                                        <ExpandableContainer
                                            key="others"
                                            heading={resolveToString(
                                                strings.otherProjects,
                                                { numProjects: projectsInDistrict.length },
                                            )}
                                            headingLevel={5}
                                            initiallyExpanded
                                            childrenContainerClassName={styles.projectsInDistrict}
                                        >
                                            {/* NOTE: projects array will always have an element
                                              * as we are using listToGroupList to get it.
                                              */}
                                            {projectsInDistrict.map((project) => (
                                                <div
                                                    key={project.id}
                                                    className={styles.projectInDistrictItem}
                                                >
                                                    <div className={styles.name}>
                                                        {project.name}
                                                    </div>
                                                    <Link
                                                        to="threeWProjectEdit"
                                                        urlParams={{ projectId: project.id }}
                                                        variant="tertiary"
                                                        icons={<PencilFillIcon />}
                                                        className={styles.action}
                                                    >
                                                        {strings.projectEdit}
                                                    </Link>
                                                </div>
                                            ))}
                                        </ExpandableContainer>
                                    );
                                }

                                return (
                                    <ExpandableContainer
                                        key={district.id}
                                        heading={resolveToString(
                                            strings.provinceProjects,
                                            {
                                                provinceName: district?.name,
                                                numProjects: projectsInDistrict.length,
                                            },
                                        )}
                                        headingLevel={5}
                                        childrenContainerClassName={styles.projectsInDistrict}
                                    >
                                        {/* NOTE: projects array will always have an element
                                          * as we are using listToGroupList to get it.
                                          */}
                                        {projectsInDistrict.map((project) => (
                                            <div
                                                key={project.id}
                                                className={styles.projectInDistrictItem}
                                            >
                                                <div className={styles.name}>
                                                    {project.name}
                                                </div>
                                                <ProjectActions
                                                    project={project}
                                                    className={styles.action}
                                                    onProjectDeletionSuccess={
                                                        reTriggerProjectListRequest
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </ExpandableContainer>
                                );
                            })}
                            {districtIdList.length === 0 && (
                                <Message
                                    description={strings.countryThreeWDataNotAvailable}
                                />
                            )}
                        </Container>
                    )}
                />
            </Container>
            <div className={styles.tables}>
                <Container
                    heading={resolveToString(
                        strings.localNSProjects,
                        { count: localNSProjects.length },
                    )}
                    withHeaderBorder
                    spacing="compact"
                >
                    <Table
                        filtered={isFiltered}
                        pending={projectListPending}
                        data={localNSProjects}
                        columns={tableColumns}
                        keySelector={numericIdSelector}
                    />
                </Container>
                <Container
                    heading={resolveToString(
                        strings.otherNSProjects,
                        { count: otherNSProjects.length },
                    )}
                    withHeaderBorder
                    spacing="compact"
                >
                    <Table
                        filtered={isFiltered}
                        pending={projectListPending}
                        data={otherNSProjects}
                        columns={tableColumns}
                        keySelector={numericIdSelector}
                    />
                </Container>
            </div>
        </Container>
    );
}

Component.displayName = 'CountryOngoingActivitiesThreeWProjects';
