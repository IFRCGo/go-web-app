import { useMemo, useCallback } from 'react';
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
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { AddFillIcon } from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import ExpandableContainer from '#components/ExpandableContainer';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import ExportButton from '#components/domain/ExportButton';
import Message from '#components/Message';
import PieChart from '#components/PieChart';
import Table from '#components/Table';
import {
    createDateRangeColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import ProjectActions, { Props as ProjectActionsProps } from '#components/domain/ProjectActions';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import useAlert from '#hooks/useAlert';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { PROJECT_STATUS_ONGOING } from '#utils/constants';
import {
    resolveToString,
} from '#utils/translation';
import { sumSafe } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import type { CountryOutletContext } from '#utils/outletContext';
import {
    numericIdSelector,
    numericValueSelector,
    stringLabelSelector,
} from '#utils/selectors';

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
    const alert = useAlert();

    const {
        countryResponse,
        countryResponsePending,
    } = useOutletContext<CountryOutletContext>();

    const {
        rawFilter,
        filter,
        filtered,
        setFilterField,
    } = useFilterState<FilterValue>({
        filter: {},
    });

    const {
        pending: projectListPending,
        response: projectListResponse,
        retrigger: reTriggerProjectListRequest,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/project/',
        query: {
            limit: 9999,
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
        countryCountWithNSProjects,
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

        const numCountriesWithNSProjects = unique(projectsOngoing, (d) => d.project_country).length;

        return {
            ongoingProjects: projectsOngoing,
            targetedPopulation: peopleTargeted,
            ongoingProjectBudget: ongoingBudget,
            programmeTypeStats: programmeTypes,
            projectStatusTypeStats: projectStatusTypes,
            countryCountWithNSProjects: numCountriesWithNSProjects,
        };
    }, [filteredProjectList]);

    const countryGroupedProjects = useMemo(() => (
        listToGroupList(ongoingProjects, (project) => project.project_country)
    ), [ongoingProjects]);

    const tableColumns = useMemo(() => ([
        createStringColumn<Project, number>(
            'ns',
            strings.nSTableCountries,
            (item) => item.project_country_detail.name,
        ),
        createDateRangeColumn<Project, number>(
            'startDate',
            strings.nSStartDate,
            (item) => ({
                startDate: item.start_date,
                endDate: item.end_date,
            }),
        ),
        createStringColumn<Project, number>(
            'disasterType',
            strings.nSTableDisasterType,
            (item) => item.dtype_detail?.name,
        ),
        createStringColumn<Project, number>(
            'sector',
            strings.nSTableSector,
            (item) => item.primary_sector_display,
        ),
        createStringColumn<Project, number>(
            'name',
            strings.nSTableProjectName,
            (item) => item.name,
        ),

        createNumberColumn<Project, number>(
            'budget',
            strings.nSTableTotalBudget,
            (item) => item.budget_amount,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'peopleTargeted',
            strings.nSTablePeopleTargeted,
            (item) => item.target_total,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'peopleReached',
            strings.nSTablePeopleReached,
            (item) => item.reached_total,
            undefined,
        ),
        createStringColumn<Project, number>(
            'contact',
            strings.nSContactPerson,
            (item) => (
                `${item.reporting_ns_contact_name}
                ,
                ${item.reporting_ns_contact_email}`
            ),
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
    ]), [
        reTriggerProjectListRequest,
        strings.nSTableCountries,
        strings.nSTableProjectName,
        strings.nSTableSector,
        strings.nSTableTotalBudget,
        strings.nSTableDisasterType,
        strings.nSTablePeopleTargeted,
        strings.nSTablePeopleReached,
        strings.nSContactPerson,
        strings.nSStartDate,
    ]);

    const countryIdList = Object.keys(countryGroupedProjects);

    const [
        pendingExport,
        progress,
        triggerExportStart,
    ] = useRecursiveCsvExport({
        onFailure: () => {
            alert.show(
                strings.nSFailedToCreateExport,
                { variant: 'danger' },
            );
        },
        onSuccess: (data) => {
            const unparseData = Papa.unparse(data);
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
                reporting_ns: isDefined(countryResponse) ? [countryResponse.id] : undefined,
            },
        );
    }, [
        countryResponse,
        triggerExportStart,
        projectListResponse?.count,
    ]);

    const showCard1 = countryCountWithNSProjects > 0 || targetedPopulation > 0;
    const showCard2 = filteredProjectList.length > 0 || programmeTypeStats.length > 0;
    const showCard3 = ongoingProjectBudget > 0 || projectStatusTypeStats.length > 0;

    const showCardsSection = showCard1 || showCard2 || showCard3;

    return (
        <div className={styles.countryThreeWNationalSocietyProjects}>
            {projectListPending && <BlockLoading />}
            <div className={styles.nsActivityDescription}>
                <div className={styles.startDummyContent} />
                <div className={styles.description}>
                    {strings.nSActivityDescription}
                </div>
                <div className={styles.endDummyContent} />
                <div className={styles.addNsActivity}>
                    <Link
                        to="newThreeWActivity"
                        variant="secondary"
                        icons={<AddFillIcon />}
                    >
                        {strings.addNSActivity}
                    </Link>
                </div>
            </div>
            {!projectListPending && showCardsSection && (
                <div className={styles.keyFigureCardList}>
                    {showCard1 && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={countryCountWithNSProjects}
                                label={strings.countriesNSWork}
                                labelClassName={styles.keyFigureDescription}
                            />
                            <div className={styles.separator} />
                            <KeyFigure
                                className={styles.keyFigure}
                                value={targetedPopulation}
                                label={strings.nSTargetedPopulationTitle}
                                labelClassName={styles.keyFigureDescription}
                                compactValue
                            />
                        </div>
                    )}
                    {showCard2 && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={filteredProjectList.length}
                                label={strings.nSTotalProjectsTitle}
                                labelClassName={styles.keyFigureDescription}
                            />
                            <div className={styles.separator} />
                            <Container
                                heading={strings.nSProgrammeType}
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
                    {showCard3 && (
                        <div className={styles.keyFigureCard}>
                            <KeyFigure
                                className={styles.keyFigure}
                                value={ongoingProjectBudget}
                                label={strings.nSFundingRequirementsTitle}
                                labelClassName={styles.keyFigureDescription}
                                compactValue
                            />
                            <div className={styles.separator} />
                            <Container
                                heading={strings.nSProjectStatus}
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
                childrenContainerClassName={styles.content}
                heading={strings.nsInternationalWorkTitle}
                withHeaderBorder
                filters={(
                    <Filter
                        value={rawFilter}
                        onChange={setFilterField}
                    />
                )}
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={projectListResponse?.count}
                    />
                )}
            >
                <Map
                    projectList={ongoingProjects}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            heading={strings.nSProjectByCountryTitle}
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
                                            strings.nSCountryProjects,
                                            {
                                                countryName,
                                                numProjects: projectsInCountry.length,
                                            },
                                        )}
                                        headingLevel={5}
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
                            {/* FIXME: Show empty message for when filter is not applied */}
                            {/* FIXME: Use List component instead? */}
                            {countryIdList.length === 0 && (
                                <Message
                                    description={strings.nSProjectDataNotAvailable}
                                />
                            )}
                        </Container>
                    )}
                />
            </Container>
            <Container
                withHeaderBorder
                heading={resolveToString(
                    strings.nsInternationalWorkHeading,
                    { count: ongoingProjects.length },
                )}
                actions={(
                    <Link
                        to="allThreeWProject"
                        urlSearch={`reporting_ns=${countryResponse?.id}`}
                        withLinkIcon
                    >
                        {strings.nSAllProjects}
                    </Link>
                )}
            >
                <Table
                    filtered={filtered}
                    pending={projectListPending || countryResponsePending}
                    data={ongoingProjects}
                    columns={tableColumns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'CountryNsOverviewActivities';
