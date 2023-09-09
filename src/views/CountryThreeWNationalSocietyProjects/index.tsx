import { useMemo } from 'react';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    mapToList,
    unique,
} from '@togglecorp/fujs';
import {
    useOutletContext,
} from 'react-router-dom';
import {
    DownloadFillIcon,
} from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Button from '#components/Button';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import PieChart from '#components/PieChart';
import Table from '#components/Table';
import Message from '#components/Message';
import type { CountryOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { PROJECT_STATUS_ONGOING } from '#utils/constants';
import { resolveToString } from '#utils/translation';
import { sumSafe } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import {
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import {
    numericIdSelector,
    numericValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

// FIXME: One view should not import from another view
import ProjectActions, { Props as ProjectActionsProps } from '#views/CountryThreeW/ProjectActions';

import Filter, { FilterValue } from './Filters';
import Map from './Map';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface LabelValue {
    label: string;
    value: number;
}

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];
type ProjectKey = 'project_country' | 'operation_type' | 'programme_type' | 'primary_sector' | 'secondary_sectors';
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
    const strings = useTranslation(i18n);
    const {
        filter,
        filtered,
        setFilterField,
    } = useFilterState<FilterValue>(
        {},
        undefined,
    );
    const {
        countryResponse,
        countryResponsePending,
    } = useOutletContext<CountryOutletContext>();

    const {
        pending: projectListPending,
        response: projectListResponse,
        retrigger: reTriggerProjectListRequest,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/project/',
        query: {
            limit: 500,
            reporting_ns: isDefined(countryResponse) ? [countryResponse.id] : undefined,
        },
    });

    const projectList = projectListResponse?.results ?? emptyProjectList;
    const filteredProjectList = filterProjects(projectList, filter);

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

        const numberOfActiveNS = unique(projectsOngoing, (d) => d.reporting_ns).length;

        return {
            ongoingProjects: projectsOngoing,
            targetedPopulation: peopleTargeted,
            ongoingProjectBudget: ongoingBudget,
            programmeTypeStats: programmeTypes,
            projectStatusTypeStats: projectStatusTypes,
            activeNSCount: numberOfActiveNS,
        };
    }, [filteredProjectList]);

    const countryGroupedProjects = useMemo(() => (
        listToGroupList(ongoingProjects, (project) => project.project_country)
    ), [ongoingProjects]);

    const tableColumns = useMemo(() => ([
        createStringColumn<Project, number>(
            'ns',
            strings.threeWTableReceivingCountry,
            (item) => item.project_country_detail.name,
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
                className: styles.actions,
                project,
            }),
        ),
    ]), [reTriggerProjectListRequest, strings]);

    const countryIdList = Object.keys(countryGroupedProjects);

    return (
        <div className={styles.countryThreeWNationalSocietyProjects}>
            {projectListPending ? (
                <BlockLoading />
            ) : (
                <div className={styles.keyFigureCardList}>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={activeNSCount}
                            description={strings.activeDeploymentsTitle}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={targetedPopulation}
                            description={strings.targetedPopulationTitle}
                        />
                    </div>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={projectList.length}
                            description={strings.totalProjectsTitle}
                        />
                        <div className={styles.separator} />
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
                    </div>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={ongoingProjectBudget}
                            description={strings.ongoingProjectBudgetTitle}
                        />
                        <div className={styles.separator} />
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
                    </div>
                </div>
            )}
            <Container
                className={styles.ongoingProjects}
                childrenContainerClassName={styles.content}
                heading={strings.threeWOngoingProjectsTitle}
                withHeaderBorder
                filters={(
                    <Filter
                        value={filter}
                        onChange={setFilterField}
                    />
                )}
                actions={(
                    <>
                        <Button
                            variant="primary"
                            name={undefined}
                            icons={<DownloadFillIcon />}
                        >
                            {strings.exportProjects}
                        </Button>
                        <Link
                            to="countryAllThreeWNationalSocietyProjects"
                            urlParams={{ countryId: countryResponse?.id }}
                            withForwardIcon
                        >
                            {strings.viewAllProjects}
                        </Link>
                    </>
                )}
            >
                <Map
                    projectList={ongoingProjects}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            heading={strings.threeWNSCountryMapSidebarTitle}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                        >
                            {countryIdList.map((countryId) => {
                                const projectsInCountry = countryGroupedProjects[countryId];

                                if (
                                    isNotDefined(projectsInCountry)
                                    || projectsInCountry.length === 0
                                ) {
                                    return null;
                                }

                                // NOTE: we will always have at least one project as it is
                                // project list is aggregated using listToGroupList
                                const countryName = projectsInCountry[0]
                                    .project_country_detail.name;

                                return (
                                    <ExpandableContainer
                                        key={countryId}
                                        heading={resolveToString(
                                            strings.countryProjects,
                                            {
                                                countryName,
                                                numProjects: projectsInCountry.length,
                                            },
                                        )}
                                        headingLevel={4}
                                        childrenContainerClassName={styles.projectsInCountry}
                                    >
                                        {/* NOTE: projects array will always have an element
                                          * as we are using listToGroupList to get it.
                                          */}
                                        {projectsInCountry.map((project) => (
                                            <div
                                                key={project.id}
                                                className={styles.projectInCountryItem}
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
                            {/* FIXME: Show empty message for when filter is applied */}
                            {/* FIXME: Show empty message for when filter is applied */}
                            {countryIdList.length === 0 && (
                                <Message
                                    // FIXME: use translations
                                    description="Data not available!"
                                />
                            )}
                        </Container>
                    )}
                />
                <ExpandableContainer
                    initiallyExpanded
                    heading={resolveToString(
                        strings.projects,
                        { count: ongoingProjects.length },
                    )}
                >
                    <Table
                        filtered={filtered}
                        pending={projectListPending || countryResponsePending}
                        data={ongoingProjects}
                        columns={tableColumns}
                        keySelector={numericIdSelector}
                    />
                </ExpandableContainer>
            </Container>
        </div>
    );
}

Component.displayName = 'CountryThreeWNationalSocietyProjects';
