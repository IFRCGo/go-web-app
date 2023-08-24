import { useMemo, useState, useContext } from 'react';
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
    DownloadFillIcon,
} from '@ifrc-go/icons';

import BlockLoading from '#components/BlockLoading';
import Button from '#components/Button';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import Link from '#components/Link';
import PieChart from '#components/PieChart';
import RouteContext from '#contexts/route';
import type { CountryOutletContext } from '#utils/outletContext';
import useTranslation from '#hooks/useTranslation';
import { PROJECT_STATUS_ONGOING } from '#utils/constants';
import { sumSafe } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import {
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
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const {
        countryAllThreeWNationalSocietyProjects: countryAllThreeWNationalSocietyProjectsRoute,
    } = useContext(RouteContext);

    const [filters, setFilters] = useState<FilterValue>({
        project_country: [],
        operation_type: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
    });

    const {
        pending: projectListPending,
        response: projectListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/project/',
        query: {
            limit: 500,
            reporting_ns: isDefined(countryResponse) ? [countryResponse.id] : undefined,
        },
    });

    const projectList = projectListResponse?.results ?? emptyProjectList;
    const filteredProjectList = filterProjects(projectList, filters);

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

        const ongoingBudget = sumSafe(projectsOngoing?.map((d) => d.budget_amount ?? 0));

        const peopleTargeted = sumSafe(filteredProjectList?.map((d) => d.target_total ?? 0));

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

    return (
        <div className={styles.countryThreeWNationalSocietyProjects}>
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
                                ? generatePath(countryAllThreeWNationalSocietyProjectsRoute.absolutePath, { // eslint-disable-line max-len
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
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
}

Component.displayName = 'CountryThreeWNationalSocietyProjects';
