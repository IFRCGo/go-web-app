import {
    useMemo,
    useState,
    useCallback,
    useContext,
} from 'react';
import {
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

import Container from '#components/Container';
import Link from '#components/Link';
import Button from '#components/Button';
import PieChart from '#components/PieChart';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import { useRequest } from '#utils/restRequest';
import { sumSafe, denormalizeList } from '#utils/common';
import type { CountryOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';
import ExpandableContainer from '#components/ExpandableContainer';
import { resolveToString } from '#utils/translation';
import {
    numericValueSelector,
    stringLabelSelector,
} from '#utils/selectors';
import type { GoApiResponse } from '#utils/restRequest';
import { type components } from '#generated/types';
import RouteContext from '#contexts/route';

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

type ProjectKey = keyof Project;

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

function filterProjects(
    projectList: Project[],
    filters: Partial<Record<ProjectKey, number[]>>,
) {
    const filterKeys = Object.keys(filters) as ProjectKey[];

    return filterKeys.reduce((filteredProjectList, filterKey) => {
        const filterValue = filters[filterKey];

        if (filterValue?.length === 0) {
            return filteredProjectList;
        }

        return filteredProjectList.filter((project) => {
            const value = project[filterKey];

            if (isNotDefined(value)) {
                return true;
            }

            if (isNotDefined(filterValue)) {
                return true;
            }

            if (Array.isArray(value)) {
                return value.some(
                    (v) => (
                        filterValue?.findIndex(
                            (fv) => String(fv) === String(v),
                        ) !== -1
                    ),
                );
            }

            return filterValue?.findIndex(
                (fv) => String(fv) === String(value),
            ) !== -1;
        });
    }, projectList);
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
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

    const handleExportClick = useCallback(() => {
        console.warn('handleExportClick called');
    }, []);

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

    return (
        <div className={styles.projectsInCountry}>
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
                            onClick={handleExportClick}
                            icons={(<DownloadFillIcon />)}
                        >
                            {strings.exportProjects}
                        </Button>
                        <Link
                            to={`/three-w/all/?country=${countryResponse?.iso}`}
                            withForwardIcon
                        >
                            {strings.viewAllProjects}
                        </Link>
                    </>
                )}
            >
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

                        if (isNotDefined(district?.id)) {
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
                                key={district?.id}
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
                                            onProjectDeletionSuccess={reTriggerProjectListRequest}
                                        />
                                    </div>
                                ))}
                            </ExpandableContainer>
                        );
                    })}
                </Container>
            </Container>
        </div>
    );
}

Component.displayName = 'ProjectsInCountry';
