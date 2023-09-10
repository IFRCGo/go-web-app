import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    DownloadFillIcon,
} from '@ifrc-go/icons';

import Link from '#components/Link';
import List from '#components/List';
import Button from '#components/Button';
import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import KeyFigure from '#components/KeyFigure';
import PieChart from '#components/PieChart';
import ProgressBar from '#components/ProgressBar';
import TextOutput from '#components/TextOutput';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useTranslation from '#hooks/useTranslation';
import { type GoApiResponse, useRequest } from '#utils/restRequest';
import { resolveToString } from '#utils/translation';
import {
    numericCountSelector,
    stringNameSelector,
    numericIdSelector,
} from '#utils/selectors';

import MovementActivitiesMap from './MovementActivitiesMap';
import Filters, { type FilterValue } from './Filters';
import i18n from './i18n.json';
import styles from './styles.module.css';

type MovementActivityResponse = GoApiResponse<'/api/v2/region-project/{id}/movement-activities/'>;
type CountryActivity = NonNullable<MovementActivityResponse>['countries_count'][number];

const primaryRedColorShades = [
    'var(--go-ui-color-red-90)',
    'var(--go-ui-color-red-60)',
    'var(--go-ui-color-red-40)',
    'var(--go-ui-color-red-20)',
    'var(--go-ui-color-red-10)',
];

const MAX_SCALE_STOPS = 6;
interface ScaleProps {
    max: number;
}

function Scale(props: ScaleProps) {
    const { max } = props;
    const numbers = [];

    const diff = max / MAX_SCALE_STOPS;

    for (let i = 0; i <= max; i += diff) {
        numbers.push(i);
    }

    return (
        <div className={styles.scale}>
            {numbers.map((number) => <div key={number}>{number}</div>)}
        </div>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();

    const { deployments_project_status: projectStatus } = useGlobalEnums();

    const strings = useTranslation(i18n);

    const [filters, setFilters] = useState<FilterValue>({
        operation_type: [],
        programme_type: [],
        primary_sector: [],
        secondary_sectors: [],
        status: [],
    });

    const {
        response: regionProjectOverviewResponse,
        pending: regionProjectOverviewResponsePending,
    } = useRequest({
        url: '/api/v2/region-project/{id}/overview/',
        skip: isNotDefined(regionId),
        pathVariables: isDefined(regionId) ? {
            id: regionId,
        } : undefined,
    });

    const {
        response: regionalMovementActivitiesResponse,
        pending: regionalMovementActivitiesResponsePending,
    } = useRequest({
        url: '/api/v2/region-project/{id}/movement-activities/',
        skip: isNotDefined(regionId),
        pathVariables: isDefined(regionId) ? {
            id: regionId,
        } : undefined,
        query: filters, // TODO: fix typings
    });

    const projectByStatus = regionProjectOverviewResponse?.projects_by_status?.map((project) => {
        const name = projectStatus?.find((status) => (status.key === project.status))?.value;
        if (isDefined(name)) {
            return {
                count: project.count,
                name,
            };
        }
        return undefined;
    }).filter(isDefined);

    const maxScaleValue = useMemo(() => (
        Math.max(
            ...(regionalMovementActivitiesResponse?.countries_count
                .map((activity) => activity.projects_count)
                .filter(isDefined) ?? []),
        )), [regionalMovementActivitiesResponse?.countries_count]);

    const countrySectorRendererParams = useCallback((_: number, country: CountryActivity) => ({
        title: (
            <div className={styles.countrySectorTitle}>
                <Link
                    to="countryThreeWIndex"
                    urlParams={{ countryId: country.id }}
                >
                    {country.name}
                </Link>
                {resolveToString(
                    strings.projectsCount,
                    { count: country.projects_count },
                )}
            </div>
        ),
        className: styles.countrySector,
        value: country.projects_count,
        totalValue: maxScaleValue,
    }), [maxScaleValue, strings.projectsCount]);

    return (
        <div
            className={styles.regionThreeW}
        >
            {regionProjectOverviewResponsePending ? (
                <BlockLoading />
            ) : (
                <div className={styles.keyFigureCardList}>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.ns_with_ongoing_activities}
                            description={strings.nationalSocietyWithOngoingActivities}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_budget}
                            description={strings.totalBuget}
                        />
                    </div>
                    <div className={styles.peopleReachedCard}>
                        <TextOutput
                            value={strings.totalPeopleReached}
                        />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.reached_total}
                        />
                        {isDefined(regionProjectOverviewResponse?.reached_total)
                            && isDefined(regionProjectOverviewResponse?.target_total)
                            && (regionProjectOverviewResponse?.target_total ?? 0) > 0 && (
                            <ProgressBar
                                value={regionProjectOverviewResponse?.reached_total ?? 0}
                                totalValue={regionProjectOverviewResponse?.target_total}
                            />
                        )}
                        <TextOutput
                            valueType="number"
                            label={strings.targetedPopulation}
                            value={regionProjectOverviewResponse?.target_total}
                        />
                    </div>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_projects}
                            description={strings.totalProjects}
                        />
                        <div className={styles.separator} />
                        <div>
                            <TextOutput
                                value={strings.totalProjectsByStatus}
                            />
                            <PieChart
                                className={styles.pieChart}
                                data={projectByStatus}
                                valueSelector={numericCountSelector}
                                labelSelector={stringNameSelector}
                                keySelector={stringNameSelector}
                                colors={primaryRedColorShades}
                                pieRadius={40}
                                chartPadding={10}
                            />
                        </div>
                    </div>
                </div>
            )}
            <Container
                className={styles.movementActivities}
                childrenContainerClassName={styles.content}
                heading={strings.movementActivities}
                withHeaderBorder
                filters={(
                    <Filters
                        value={filters}
                        onChange={setFilters}
                    />
                )}
                actions={(
                    <>
                        <Button
                            variant="primary"
                            name={undefined}
                            icons={<DownloadFillIcon />}
                        >
                            {strings.export}
                        </Button>
                        <Link
                            to="newThreeWActivity"
                        >
                            {strings.addThreeW}
                        </Link>
                    </>
                )}
            >
                <MovementActivitiesMap
                    regionId={regionId}
                    movementActivitiesResponse={regionalMovementActivitiesResponse}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            headingClassName={styles.heading}
                            heading={(
                                <Scale max={maxScaleValue} />
                            )}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                        >
                            <List
                                className={styles.countryList}
                                data={regionalMovementActivitiesResponse
                                    ?.countries_count}
                                renderer={ProgressBar}
                                rendererParams={countrySectorRendererParams}
                                keySelector={numericIdSelector}
                                withoutMessage
                                compact
                                pending={regionalMovementActivitiesResponsePending}
                                errored={false}
                                filtered={false}
                            />
                        </Container>
                    )}
                />
            </Container>
        </div>
    );
}

Component.displayName = 'RegionThreeW';
