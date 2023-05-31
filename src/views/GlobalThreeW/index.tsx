import { useState } from 'react';
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

import Filter, { FilterValue } from './Filters';
import BarChart from './BarChart';
import PieChart from './PieChart';
import {
    NSOngoingProjectStat,
    GlobalProjectsOverview,
    countSelector,
    projectPerSectorLabelSelector,
    projectPerSectorKeySelector,
} from './common';
import Map from './Map';
import i18n from './i18n.json';
import styles from './styles.module.css';

const PIE_COLORS = ['#f64752', '#fa999f', '#fdd6d9'];

function projectPerSecondarySectorsLabelSelector(
    projectPerSecondarySector: GlobalProjectsOverview['projects_per_secondary_sectors'][number],
) {
    return projectPerSecondarySector.secondary_sectors_display;
}

function projectPerSecondarySectorsKeySelector(
    projectPerSecondarySector: GlobalProjectsOverview['projects_per_secondary_sectors'][number],
) {
    return projectPerSecondarySector.secondary_sectors;
}

function projectPerProgrammeTypeLabelSelector(
    projectPerProgrammeType: GlobalProjectsOverview['projects_per_programme_type'][number],
) {
    return projectPerProgrammeType.programme_type_display;
}

function projectPerProgrammeTypeKeySelector(
    projectPerProgrammeType: GlobalProjectsOverview['projects_per_programme_type'][number],
) {
    return projectPerProgrammeType.programme_type;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [
        filters,
        setFilters,
    ] = useState<FilterValue>({
        reporting_ns: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
    });

    const {
        pending: nsProjectsPending,
        response: nsProjectsResponse,
    } = useRequest<ListResponse<NSOngoingProjectStat>>({
        url: 'api/v2/global-project/ns-ongoing-projects-stats/',
        query: {
            ...filters,
        },
    });

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
            mainSectionClassName={styles.mainContent}
        >
            {pending && <BlockLoading />}
            {projectsOverviewResponse && (
                <>
                    <div className={styles.charts}>
                        <Container
                            heading={strings.globalThreeWChartProjectPerSectorTitle}
                            className={styles.chartContainer}
                        >
                            <BarChart
                                data={projectsOverviewResponse.projects_per_sector}
                                valueSelector={countSelector}
                                labelSelector={projectPerSectorLabelSelector}
                                keySelector={projectPerSectorKeySelector}
                            />
                        </Container>
                        <Container
                            heading={strings.globalThreeWChartProgrammeTypeTitle}
                            className={styles.chartContainer}
                        >
                            <PieChart
                                data={projectsOverviewResponse.projects_per_programme_type}
                                valueSelector={countSelector}
                                labelSelector={projectPerProgrammeTypeLabelSelector}
                                keySelector={projectPerProgrammeTypeKeySelector}
                                colors={PIE_COLORS}
                            />
                        </Container>
                        <Container
                            heading={strings.globalThreeWChartTopTagsTitle}
                            className={styles.chartContainer}
                        >
                            <BarChart
                                data={projectsOverviewResponse.projects_per_secondary_sectors}
                                valueSelector={countSelector}
                                labelSelector={projectPerSecondarySectorsLabelSelector}
                                keySelector={projectPerSecondarySectorsKeySelector}
                            />
                        </Container>
                    </div>
                    <Container
                        heading={strings.globalThreeWKeyFigureOngoingProjectsTitle}
                        headerDescription={(
                            <Filter
                                value={filters}
                                onChange={setFilters}
                            />
                        )}
                    >
                        <Map projectList={nsProjectsResponse?.results} />
                    </Container>
                    <Container
                        heading={strings.PPPMapTitle}
                        headerDescription={strings.PPPMapDescription}
                    >
                        <iframe
                            title={strings.PPPMapTitle}
                            className={styles.pppIframe}
                            src="https://public.tableau.com/views/PPPdashboard_16805965348010/1_OVERVIEW?:language=en-US&:display_count=n&:origin=viz_share_link?:embed=yes&:display_count=yes&:showVizHome=no&:toolbar=yes"
                        />
                    </Container>
                </>
            )}
        </Page>
    );
}

Component.displayName = 'GlobalThreeW';
