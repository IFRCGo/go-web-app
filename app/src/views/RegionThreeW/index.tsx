import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    BlockLoading,
    Container,
    ExpandableContainer,
    ExpandableContainerProps,
    KeyFigure,
    List,
    PieChart,
    ProgressBar,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericCountSelector,
    numericIdSelector,
    resolveToString,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import CountryProjectTable from './CountryProjectTable';
import Filters, { type FilterValue } from './Filters';
import MovementActivitiesMap from './MovementActivitiesMap';

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
    className?: string;
    max: number;
}

function Scale(props: ScaleProps) {
    const { max, className } = props;
    const numbers = [];

    const diff = Math.ceil(max / (MAX_SCALE_STOPS));

    if (diff === 0) {
        return null;
    }
    for (let i = 0; i <= MAX_SCALE_STOPS; i += 1) {
        numbers.push(i * diff);
    }
    return (
        <div className={_cs(styles.scale, className)}>
            {numbers.map((number) => <div key={number}>{number}</div>)}
        </div>
    );
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { regionId } = useParams<{ regionId: string }>();

    const { deployments_project_status: projectStatus } = useGlobalEnums();

    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        rawFilter,
        filter,
        filtered,
        setFilterField,
        limit,
        offset,
    } = useFilterState<FilterValue>({
        filter: {
            operation_type: [],
            programme_type: [],
            primary_sector: [],
            secondary_sectors: [],
            status: [],
        },
        pageSize: 20,
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
        preserveResponse: true,
        pathVariables: isDefined(regionId) ? {
            id: regionId,
        } : undefined,
        query: {
            ...filter,
            limit: 9999,
        } as never, // TODO: fix typings in the server
    });

    const projectByStatus = useMemo(() => (
        regionProjectOverviewResponse?.projects_by_status?.map((project) => {
            const name = projectStatus?.find((status) => (status.key === project.status))?.value;
            if (isDefined(name)) {
                return {
                    count: project.count,
                    name,
                };
            }
            return undefined;
        }).filter(isDefined)
    ), [projectStatus, regionProjectOverviewResponse?.projects_by_status]);

    const countriesCount = useMemo(() => (
        regionalMovementActivitiesResponse?.countries_count
            .filter((country) => country.projects_count > 0)
    ), [regionalMovementActivitiesResponse?.countries_count]);

    const maxScaleValue = useMemo(
        () => (
            Math.max(
                ...(countriesCount
                    ?.map((activity) => activity.projects_count)
                    .filter(isDefined) ?? []),
                0,
            )
        ),
        [countriesCount],
    );

    const countryRendererParams = useCallback(
        (_: number, country: CountryActivity): ExpandableContainerProps => ({
            heading: country.name,
            headingLevel: 4,
            spacing: 'cozy',
            withHeaderBorder: true,
            // FIXME: passing components in renderer params will render the
            // child components every time
            headingDescription: resolveToString(
                strings.projectsCount,
                { count: country.projects_count },
            ),
            children: (
                <CountryProjectTable
                    country={country.id}
                    filters={rawFilter}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    offset={offset}
                />
            ),
        }),
        [strings.projectsCount, rawFilter, page, setPage, limit, offset],
    );

    const countrySectorRendererParams = useCallback((_: number, country: CountryActivity) => ({
        title: (
            <div className={styles.countrySectorTitle}>
                <Link
                    to="countryOngoingActivitiesThreeWProjects"
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
        totalValue: Math.ceil(maxScaleValue / MAX_SCALE_STOPS) * MAX_SCALE_STOPS,
    }), [maxScaleValue, strings.projectsCount]);

    // FIXME: we need to show pending appropriately
    return (
        <div
            className={styles.regionThreeW}
        >
            {/* {strings.wikiJsLink?.length > 0 && (
                    <WikiLink
                    href=''
                />
            )} */}
            {regionProjectOverviewResponsePending ? (
                <BlockLoading />
            ) : (
                <div className={styles.keyFigureCardList}>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.ns_with_ongoing_activities}
                            label={strings.nationalSocietyWithOngoingActivities}
                        />
                        <div className={styles.separator} />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_budget}
                            label={strings.totalBuget}
                            compactValue
                        />
                    </div>
                    <div className={styles.peopleReachedCard}>
                        <TextOutput
                            value={strings.totalPeopleReached}
                        />
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.reached_total}
                            compactValue
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
                            compact
                        />
                    </div>
                    <div className={styles.keyFigureCard}>
                        <KeyFigure
                            className={styles.keyFigure}
                            value={regionProjectOverviewResponse?.total_projects}
                            label={strings.totalProjects}
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
                        value={rawFilter}
                        onChange={setFilterField}
                    />
                )}
                actions={(
                    <Link
                        variant="secondary"
                        to="newThreeWProject"
                    >
                        {strings.addThreeW}
                    </Link>
                )}
            >
                <MovementActivitiesMap
                    regionId={regionId}
                    movementActivitiesResponse={regionalMovementActivitiesResponse}
                    sidebarContent={(
                        <Container
                            className={styles.sidebar}
                            withInternalPadding
                            childrenContainerClassName={styles.sidebarContent}
                            contentViewType="vertical"
                        >
                            <Scale max={maxScaleValue} className={styles.scale} />
                            <List
                                className={styles.countryList}
                                data={countriesCount}
                                renderer={ProgressBar}
                                rendererParams={countrySectorRendererParams}
                                keySelector={numericIdSelector}
                                withoutMessage
                                compact
                                pending={regionalMovementActivitiesResponsePending}
                                errored={false}
                                filtered={filtered}
                            />
                        </Container>
                    )}
                />
            </Container>
            <List
                className={styles.countryTableList}
                data={countriesCount}
                renderer={ExpandableContainer}
                rendererParams={countryRendererParams}
                keySelector={numericIdSelector}
                withoutMessage
                compact
                pending={regionalMovementActivitiesResponsePending}
                errored={false}
                filtered={filtered}
            />
        </div>
    );
}

Component.displayName = 'RegionThreeW';
