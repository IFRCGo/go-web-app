import {
    useContext,
    useMemo,
    useState,
} from 'react';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    generatePath,
    useOutletContext,
} from 'react-router-dom';
import {
    PencilFillIcon,
    DownloadFillIcon,
} from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Button from '#components/Button';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import PieChart from '#components/PieChart';
import RouteContext from '#contexts/route';
import Table from '#components/Table';
import type { CountryOutletContext } from '#utils/outletContext';
import type { GoApiResponse } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { sumSafe, denormalizeList } from '#utils/common';
import { type components } from '#generated/types';
import { useRequest } from '#utils/restRequest';
import {
    createActionColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import {
    numericIdSelector,
    numericValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

import ProjectActions from './ProjectActions';
import Map from './Map';
import Filter, { FilterValue } from './Filters';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LabelValue {
    label: string;
    value: number;
}

type District = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];
type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

type ProjectKey = 'reporting_ns' | 'project_districts' | 'programme_type' | 'operation_type' | 'programme_type' | 'primary_sector' | 'secondary_sectors';

// const PROJECT_STATUS_COMPLETED = 2;
const PROJECT_STATUS_ONGOING = 1 satisfies components['schemas']['Status1d2Enum'];
// const PROJECT_STATUS_PLANNED = 0;

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

            if (isNotDefined(projectValue)) {
                return true;
            }

            if (isNotDefined(filterValue) || filterValue.length === 0) {
                return true;
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
    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        countryAllThreeW: countryAllThreeWRoute,
        threeWProjectEdit: threeWProjectEditRoute,
    } = useContext(RouteContext);

    const [filters, setFilters] = useState<FilterValue>({
        reporting_ns: [],
        project_districts: [],
        operation_type: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
    });

    const {
        pending: projectListPending,
        response: projectListResponse,
        retrigger: reTriggerProjectListRequest,
    } = useRequest({
        skip: isNotDefined(countryResponse?.iso),
        url: '/api/v2/project/',
        query: {
            limit: 500,
            country: countryResponse?.iso ?? undefined,
        },
    });

    const {
        response: districtListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/district/',
        query: {
            country: countryResponse?.id,
            limit: 200,
        },
    });

    const districtList = districtListResponse?.results ?? emptyDistrictList;
    const projectList = projectListResponse?.results ?? emptyProjectList;
    const filteredProjectList = filterProjects(projectList, filters);

    const [
        ongoingProjects,
        targetedPopulation,
        ongoingProjectBudget,
        programmeTypeStats,
        projectStatusTypeStats,
        activeNSCount,
    ] = useMemo(() => {
        const projectsOngoing = filteredProjectList
            .filter((p) => p.status === PROJECT_STATUS_ONGOING);

        const ongoingBudget = sumSafe(projectsOngoing?.map((d) => d.budget_amount ?? 0));

        const target = sumSafe(filteredProjectList?.map((d) => d.target_total ?? 0));

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

        const activeNS = unique(projectsOngoing, (d) => d.reporting_ns)?.length ?? 0;

        return [
            projectsOngoing,
            target,
            ongoingBudget,
            programmeTypes,
            projectStatusTypes,
            activeNS,
        ];
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

    const [
        localNSProjects,
        otherNSProjects,
    ] = useMemo(() => ([
        ongoingProjects.filter((project) => project.reporting_ns === project.project_country),
        ongoingProjects.filter((project) => project.reporting_ns !== project.project_country),
    ]), [ongoingProjects]);

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
        createActionColumn(
            'actions',
            (project: Project) => ({
                children: (
                    <ProjectActions
                        onProjectDeletionSuccess={reTriggerProjectListRequest}
                        className={styles.actions}
                        project={project}
                    />
                ),
            }),
        ),
    ]), [reTriggerProjectListRequest, strings]);

    return (
        <div className={styles.countryThreeWProjects}>
            {projectListPending ? (
                <BlockLoading />
            ) : (
                <div className={styles.keyFigureList}>
                    <div className={styles.keyFigures}>
                        <KeyFigure
                            value={activeNSCount}
                            description={strings.activeDeploymentsTitle}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            value={targetedPopulation}
                            description={strings.targetedPopulationTitle}
                        />
                    </div>
                    <div className={styles.keyFigures}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={projectList.length}
                            description={strings.totalProjectsTitle}
                        />
                        <div className={styles.separator} />
                        <PieChart
                            data={programmeTypeStats}
                            valueSelector={numericValueSelector}
                            labelSelector={stringLabelSelector}
                            keySelector={stringLabelSelector}
                            colors={primaryRedColorShades}
                        />
                    </div>
                    <div className={styles.keyFigures}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={ongoingProjectBudget}
                            description={strings.ongoingProjectBudgetTitle}
                        />
                        <div className={styles.separator} />
                        <PieChart
                            data={projectStatusTypeStats}
                            valueSelector={numericValueSelector}
                            labelSelector={stringLabelSelector}
                            keySelector={stringLabelSelector}
                            colors={primaryRedColorShades}
                        />
                    </div>
                </div>
            )}
            <Container
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
                        <Button
                            variant="primary"
                            name={undefined}
                            icons={(<DownloadFillIcon />)}
                        >
                            {strings.exportProjects}
                        </Button>
                        <Link
                            to={isDefined(countryResponse)
                                ? generatePath(countryAllThreeWRoute.absolutePath, {
                                    countryId: countryResponse.id,
                                }) : undefined}
                            withForwardIcon
                        >
                            {strings.viewAllProjects}
                        </Link>
                    </>
                )}
            >
                <div className={styles.topSection}>
                    <div className={styles.mapContainer}>
                        <Map
                            className={styles.mapContainer}
                            projectList={ongoingProjects}
                            districtList={districtList}
                        />
                    </div>
                    <Container
                        className={styles.sidebar}
                        heading={strings.threeWInCountryMapSidebarTitle}
                    >
                        {Object.entries(districtGroupedProject).map(([districtId, projects]) => {
                            if (isNotDefined(projects) || projects.length === 0) {
                                return null;
                            }

                            const district = districtList.find((d) => d.id === Number(districtId));

                            if (isNotDefined(district)) {
                                return (
                                    <ExpandableContainer
                                        key="others"
                                        heading={resolveToString(
                                            strings.otherProjects,
                                            {
                                                numProjects: projects.length,
                                            },
                                        )}
                                        headingLevel={4}
                                        initiallyExpanded
                                    >
                                        {projects.map((project) => (
                                            <div
                                                key={project.id}
                                                className={styles.projectDetailItem}
                                            >
                                                <div className={styles.name}>
                                                    {project.name}
                                                </div>
                                                <Link
                                                    to={generatePath(
                                                        threeWProjectEditRoute.absolutePath,
                                                        { projectId: project.id },
                                                    )}
                                                    variant="tertiary"
                                                    icons={<PencilFillIcon />}
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
                                            numProjects: projects.length,
                                        },
                                    )}
                                    headingLevel={4}
                                >
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={styles.projectDetailItem}
                                        >
                                            <div className={styles.name}>
                                                {project.name}
                                            </div>
                                            <ProjectActions
                                                project={project}
                                                className={styles.actions}
                                                onProjectDeletionSuccess={
                                                    reTriggerProjectListRequest
                                                }
                                            />
                                        </div>
                                    ))}
                                </ExpandableContainer>
                            );
                        })}
                    </Container>
                </div>
                <ExpandableContainer
                    heading={resolveToString(
                        strings.localNSProjects,
                        {
                            count: localNSProjects.length,
                        },
                    )}
                    headingLevel={4}
                >
                    <Table
                        filtered={false}
                        pending={false}
                        data={localNSProjects}
                        columns={tableColumns}
                        keySelector={numericIdSelector}
                    />
                </ExpandableContainer>
                <ExpandableContainer
                    heading={resolveToString(
                        strings.otherNSProjects,
                        {
                            count: otherNSProjects.length,
                        },
                    )}
                    headingLevel={4}
                >
                    <Table
                        filtered={false}
                        pending={false}
                        data={otherNSProjects}
                        columns={tableColumns}
                        keySelector={numericIdSelector}
                    />
                </ExpandableContainer>
            </Container>
        </div>
    );
}

Component.displayName = 'CountryThreeWProjects';
