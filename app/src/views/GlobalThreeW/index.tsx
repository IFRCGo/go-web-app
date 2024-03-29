import {
    useCallback,
    useState,
} from 'react';
import {
    AddFillIcon,
    EducationIcon,
    RedCrossNationalSocietyIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    BarChart,
    BlockLoading,
    Container,
    KeyFigure,
    PieChart,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import Link from '#components/Link';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import { useRequest } from '#utils/restRequest';

import {
    countSelector,
    type GlobalProjectsOverview,
    projectPerSectorKeySelector,
    projectPerSectorLabelSelector,
} from './common';
import Filter, { type FilterValue } from './Filters';
import Map from './Map';
import RegionDropdown from './RegionDropdown';

import i18n from './i18n.json';
import styles from './styles.module.css';

// FIXME: use predefined colors
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

    const alert = useAlert();
    const {
        pending: nsProjectsPending,
        response: nsProjectsResponse,
    } = useRequest({
        url: '/api/v2/global-project/ns-ongoing-projects-stats/',
        // FIXME: fix typing in server (medium priority)
        query: {
            ...filters,
        } as never,
    });

    const {
        pending: projectsOverviewPending,
        response: projectsOverviewResponse,
    } = useRequest({
        url: '/api/v2/global-project/overview/',
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
                    href="mailto:im@ifrc.org"
                    external
                >
                    IM@ifrc.org
                </Link>
            ),
        },
    );

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
            const unparseData = Papa.unparse(data);
            const blob = new Blob(
                [unparseData],
                { type: 'text/csv' },
            );
            saveAs(blob, 'all-projects.csv');
        },
    });

    // NOTE: This request is made only to fetch the count
    const {
        response: projectsListResponse,
    } = useRequest({
        url: '/api/v2/project/',
        query: {
            limit: 0,
        },
    });

    const handleExportClick = useCallback(() => {
        if (!projectsListResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/project/',
            projectsListResponse?.count,
            {},
        );
    }, [
        triggerExportStart,
        projectsListResponse?.count,
    ]);

    return (
        <Page
            className={styles.globalThreeW}
            title={strings.globalThreeWPageTitle}
            heading={strings.globalThreeWPageHeading}
            actions={(
                <>
                    <Link
                        to="newThreeWProject"
                        variant="secondary"
                        icons={<AddFillIcon />}
                    >
                        {strings.globalThreeWAddProjectButtonLabel}
                    </Link>
                    {/* {strings.wikiJsLink?.length > 0 && (
                        <WikiLink
                            href=''
                        />
                    )}
                    */}
                </>
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
                        icon={<EducationIcon />}
                        value={numOngoingProjects}
                        label={strings.globalThreeWKeyFigureOngoingProjectsTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<RedCrossNationalSocietyIcon />}
                        value={numActiveSocieties}
                        label={strings.globalThreeWKeyFigureActiveNSTitle}
                    />
                    <KeyFigure
                        className={styles.keyFigure}
                        icon={<TargetedPopulationIcon />}
                        value={numTargetedPopulation}
                        label={strings.globalThreeWKeyTargetedPopulationTitle}
                        compactValue
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
                            withHeaderBorder
                            withInternalPadding
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
                            withHeaderBorder
                            withInternalPadding
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
                            withHeaderBorder
                            withInternalPadding
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
                        heading={strings.globalThreeWNSOngoingProjectsTitle}
                        withHeaderBorder
                        filters={(
                            <Filter
                                value={filters}
                                onChange={setFilters}
                            />
                        )}
                        actions={(
                            <>
                                <ExportButton
                                    onClick={handleExportClick}
                                    progress={progress}
                                    pendingExport={pendingExport}
                                    totalCount={projectsListResponse?.count}
                                />
                                <RegionDropdown />
                            </>
                        )}
                    >
                        <Map projectList={nsProjectsResponse} />
                    </Container>
                    <Container
                        heading={strings.PPPMapTitle}
                        headerDescription={strings.PPPMapDescription}
                        childrenContainerClassName={styles.iframeContent}
                        withHeaderBorder
                    >
                        <iframe
                            title={strings.PPPMapTitle}
                            className={styles.pppIframe}
                            src="https://public.tableau.com/views/PPPdashboard_16805965348010/1_Overview?:showVizHome=no&:embed=true&:language=en-US&:origin=viz_share_link&:display_count=no&:toolbar=yes"
                        />
                    </Container>
                </>
            )}
        </Page>
    );
}

Component.displayName = 'GlobalThreeW';
