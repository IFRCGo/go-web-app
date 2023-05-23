import { useState, useMemo } from 'react';
import { ShieldCrossFillIcon } from '@ifrc-go/icons';

import Page from '#components/Page';
import Link from '#components/Link';
import ButtonLikeLink from '#components/ButtonLikeLink';
import BlockLoading from '#components/BlockLoading';
import KeyFigure from '#components/KeyFigure';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import threeWStrings from '#strings/threeW';
import { resolveToComponent } from '#utils/translation';
import {
    useRequest,
    ListResponse,
} from '#utils/restRequest';

import { FilterValue } from './Filters';
import styles from './styles.module.css';

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

// const emptyNsOngoingProjectStats: NSOngoingProjectStat[] = [];

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
    const strings = useTranslation('threeW', threeWStrings);

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

    const [
        projectPerSectorChartData,
        // projectPerSecondarySectorChartData,
        // projectPerProgrammeTypeChartData,
    ] = useMemo(() => {
        if (!projectsOverviewResponse) {
            return [[], [], []];
        }

        const {
            projects_per_sector,
            projects_per_secondary_sectors,
            projects_per_programme_type,
        } = projectsOverviewResponse;

        return [
            projects_per_sector.map((p) => ({
                key: p.primary_sector,
                value: p.count,
                name: p.primary_sector_display,
            })),
            projects_per_secondary_sectors.map((p) => ({
                key: p.secondary_sector,
                value: p.count,
                name: p.secondary_sectors_display,
            })),
            projects_per_programme_type.map((p) => ({
                key: p.programme_type,
                value: p.count,
                name: p.programme_type_display,
            })),
        ];
    }, [projectsOverviewResponse]);

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
                <div className={styles.keyFigures}>
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<ShieldCrossFillIcon />}
                        value={numOngoingProjects}
                        description={strings.globalThreeWKeyFigureOngoingProjectsTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<ShieldCrossFillIcon />}
                        value={numActiveSocieties}
                        description={strings.globalThreeWKeyFigureActiveNSTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<ShieldCrossFillIcon />}
                        value={numTargetedPopulation}
                        description={strings.globalThreeWKeyTargetedPopulationTitle}
                    />
                </div>
            )}
            infoContainerClassName={styles.keyFiguresContainer}
        >
            {pending && <BlockLoading />}
            {projectsOverviewResponse && (
                <Container heading={strings.globalThreeWChartProjectPerSectorTitle}>
                    {projectPerSectorChartData.map((chartData) => (
                        <div
                            key={chartData.key}
                            className={styles.row}
                        >
                            <div className={styles.label}>
                                {chartData.name}
                            </div>
                        </div>
                    ))}
                </Container>
            )}
        </Page>
    );
}

Component.displayName = 'GlobalThreeW';
