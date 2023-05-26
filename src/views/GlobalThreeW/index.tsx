import { useState, useMemo } from 'react';
import {
    ShieldCrossLineIcon,
    RedCrossNationalSocietyIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';

import Page from '#components/Page';
import Link from '#components/Link';
import ButtonLikeLink from '#components/ButtonLikeLink';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

import { FilterValue } from './Filters';
import BarChart from './BarChart';
import PieChart from './PieChart';
import i18n from './i18n.json';
import styles from './styles.module.css';

const PIE_COLORS = ['#f64752', '#fa999f', '#fdd6d9'];

export interface NSOngoingProjectStat {
    id: number;
    iso3: string;
    ongoing_projects: number;
    target_total: number;
    society_name: string;
    name: string;
    operation_types: number[];
    operation_types_display: string[];
    budget_amount_total: number;
    projects_per_sector: {
        primary_sector: number;
        primary_sector_display: string;
        count: number;
    }[];
}

interface ProjectPerProgrammeType {
    programme_type: number;
    programme_type_display: string;
    count: number;
}

interface ProjectPerSector {
    count: number;
    primary_sector: number;
    primary_sector_display: string;
}

interface ProjectPerSecondarySector {
    count: number;
    secondary_sector: number;
    secondary_sectors_display: string;
}

interface GlobalProjectsOverview {
    total_ongoing_projects: number;
    ns_with_ongoing_activities: number;
    target_total: number;
    projects_per_sector: ProjectPerSector[];
    projects_per_programme_type: ProjectPerProgrammeType[];
    projects_per_secondary_sectors: ProjectPerSecondarySector[];
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [
        filters,
        // setFilters,
    ] = useState<FilterValue>({
        reporting_ns: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
    });

    const {
        pending: nsProjectsPending,
        // response: nsProjectsResponse,
    } = useRequest<ListResponse<NSOngoingProjectStat>>({
        url: 'api/v2/global-project/ns-ongoing-projects-stats/',
        query: {
            ...filters,
        },
    });

    // const ongoingProjectStats = nsProjectsResponse?.results ?? emptyNsOngoingProjectStats;

    const {
        pending: projectsOverviewPending,
        response: projectsOverviewResponse,
    } = useRequest<GlobalProjectsOverview>({
        url: 'api/v2/global-project/overview/',
    });

    const numActiveSocieties = projectsOverviewResponse?.ns_with_ongoing_activities;
    const numOngoingProjects = projectsOverviewResponse?.total_ongoing_projects;
    const numTargetedPopulation = projectsOverviewResponse?.target_total;

    const pending = nsProjectsPending || projectsOverviewPending;

    const headerDescriptionP2 = resolveToComponent(
        strings.globalThreeWPageDescriptionP2,
        {
            contactLink: (
                <Link
                    to="mailto:im@ifrc.org"
                    className={styles.imLink}
                >
                    IM@ifrc.org
                </Link>
            ),
        },
    );

    return (
        <Page
            className={styles.globalThreeW}
            title={strings.globalThreeWPageTitle}
            heading={strings.globalThreeWPageHeading}
            actions={(
                <ButtonLikeLink to="/three-w/new">
                    {strings.globalThreeWAddProjectButtonLabel}
                </ButtonLikeLink>
            )}
            descriptionContainerClassName={styles.description}
            description={(
                <>
                    <div>
                        {strings.globalThreeWPageDescriptionP1}
                    </div>
                    <div>
                        {headerDescriptionP2}
                    </div>
                </>
            )}
            info={(
                <>
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<ShieldCrossLineIcon />}
                        value={numOngoingProjects}
                        description={strings.globalThreeWKeyFigureOngoingProjectsTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<RedCrossNationalSocietyIcon />}
                        value={numActiveSocieties}
                        description={strings.globalThreeWKeyFigureActiveNSTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<TargetedPopulationIcon />}
                        value={numTargetedPopulation}
                        description={strings.globalThreeWKeyTargetedPopulationTitle}
                        normalize
                    />
                </>
            )}
            infoContainerClassName={styles.keyFiguresList}
        >
            {pending && <BlockLoading />}
            {projectsOverviewResponse && (
                <div className={styles.charts}>
                    <Container
                        heading={strings.globalThreeWChartProjectPerSectorTitle}
                        className={styles.chartContainer}
                    >
                        <BarChart
                            data={projectsOverviewResponse.projects_per_sector}
                            valueSelector={(projectPerSector) => projectPerSector.count}
                            labelSelector={
                                (projectPerSector) => projectPerSector.primary_sector_display
                            }
                            keySelector={(projectPerSector) => projectPerSector.primary_sector}
                        />
                    </Container>
                    <Container
                        heading={strings.globalThreeWChartProgrammeTypeTitle}
                        className={styles.chartContainer}
                    >
                        <PieChart
                            data={projectsOverviewResponse.projects_per_programme_type}
                            valueSelector={
                                (projectPerProgrammeType) => projectPerProgrammeType.count
                            }
                            labelSelector={
                                (projectPerProgrammeType) => projectPerProgrammeType
                                    .programme_type_display
                            }
                            keySelector={
                                (projectPerProgrammeType) => projectPerProgrammeType
                                    .programme_type
                            }
                            colors={PIE_COLORS}
                        />
                    </Container>
                    <Container
                        heading={strings.globalThreeWChartTopTagsTitle}
                        className={styles.chartContainer}
                    >
                        <BarChart
                            data={projectsOverviewResponse.projects_per_secondary_sectors}
                            valueSelector={
                                (projectPerSecondarySector) => projectPerSecondarySector.count
                            }
                            labelSelector={
                                (projectPerSecondarySector) => projectPerSecondarySector
                                    .secondary_sectors_display
                            }
                            keySelector={
                                (projectPerSecondarySector) => projectPerSecondarySector
                                    .secondary_sector
                            }
                        />
                    </Container>
                </div>
            )}
        </Page>
    );
}

Component.displayName = 'GlobalThreeW';
