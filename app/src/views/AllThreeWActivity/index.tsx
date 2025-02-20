import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createElementColumn,
    createListDisplayColumn,
    createNumberColumn,
    createStringColumn,
    formatNumber,
    numericIdSelector,
    resolveToComponent,
    sumSafe,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import ExportButton from '#components/domain/ExportButton';
import Page from '#components/Page';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRecursiveCsvExport from '#hooks/useRecursiveCsvRequest';
import useUrlSearchState from '#hooks/useUrlSearchState';
import { createLinkColumn } from '#utils/domain/tableHelpers';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import ThreeWActivityTableActions, { type Props as ThreeWActivityTableActionsProps } from './AllThreeWProjectTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectsResponse = GoApiResponse<'/api/v2/emergency-project/'>;
type ProjectListItem = NonNullable<ProjectsResponse['results']>[number];
type ActivityListItem = NonNullable<ProjectListItem['activities']>[number];
type DistrictListItem = NonNullable<ProjectListItem['districts_details']>[number];

type TableKey = number;

interface DistrictNameOutputProps {
    name: string;
}
function DistrictNameOutput({ name }: DistrictNameOutputProps) {
    return name;
}

function districtKeySelector(item: DistrictListItem) {
    return item.id;
}

function getPeopleReachedInActivity(activity: ActivityListItem) {
    const {
        is_simplified_report,
        people_count,
        male_0_1_count,
        male_2_5_count,
        male_6_12_count,
        male_13_17_count,
        male_18_59_count,
        male_60_plus_count,
        male_unknown_age_count,
        female_0_1_count,
        female_2_5_count,
        female_6_12_count,
        female_13_17_count,
        female_18_59_count,
        female_60_plus_count,
        female_unknown_age_count,
        other_0_1_count,
        other_2_5_count,
        other_6_12_count,
        other_13_17_count,
        other_18_59_count,
        other_60_plus_count,
        other_unknown_age_count,
    } = activity;

    if (is_simplified_report) {
        return people_count ?? 0;
    }

    return sumSafe([
        male_0_1_count,
        male_2_5_count,
        male_6_12_count,
        male_13_17_count,
        male_18_59_count,
        male_60_plus_count,
        male_unknown_age_count,

        female_0_1_count,
        female_2_5_count,
        female_6_12_count,
        female_13_17_count,
        female_18_59_count,
        female_60_plus_count,
        female_unknown_age_count,

        other_0_1_count,
        other_2_5_count,
        other_6_12_count,
        other_13_17_count,
        other_18_59_count,
        other_60_plus_count,
        other_unknown_age_count,
    ]);
}

function getPeopleReached(project: ProjectListItem) {
    return sumSafe(project.activities?.map(getPeopleReachedInActivity));
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const [filterCountry] = useUrlSearchState<number | undefined>(
        'country',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (country) => country,
    );

    const alert = useAlert();
    const {
        page: projectActivePage,
        setPage: setProjectActivePage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 15,
    });

    const query = useMemo(() => ({
        limit,
        offset,
        country: isDefined(filterCountry) ? [filterCountry] : undefined,
    }), [
        limit,
        offset,
        filterCountry,
    ]);

    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        query,
    });

    const districtRendererParams = useCallback(
        (value: DistrictListItem) => ({
            name: value.name,
        }),
        [],
    );

    const columns = useMemo(
        () => ([
            createStringColumn<ProjectListItem, TableKey>(
                'ns',
                strings.allThreeWActivityNS,
                (item) => item.reporting_ns_details?.society_name,
            ),
            createLinkColumn<ProjectListItem, TableKey>(
                'title',
                strings.allThreeWActivityTitle,
                (item) => item.title,
                (item) => ({
                    to: 'threeWActivityDetail',
                    urlParams: { activityId: item.id },
                }),
            ),
            createDateColumn<ProjectListItem, TableKey>(
                'start_date',
                strings.allThreeWActivityStartDate,
                (item) => item.start_date,
            ),
            createLinkColumn<ProjectListItem, number>(
                'country',
                strings.allThreeWCountry,
                (activity) => activity.country_details.name,
                (activity) => ({
                    to: 'countriesLayout',
                    urlParams: {
                        countryId: activity.country,
                    },
                }),
            ),
            createListDisplayColumn<
                ProjectListItem,
                number,
                DistrictListItem,
                DistrictNameOutputProps
            >(
                'districts',
                strings.allThreeWActivityRegion,
                (activity) => ({
                    list: activity.districts_details,
                    renderer: DistrictNameOutput,
                    rendererParams: districtRendererParams,
                    keySelector: districtKeySelector,
                }),
            ),
            createStringColumn<ProjectListItem, TableKey>(
                'disasterType',
                strings.allThreeWActivityStatus,
                (item) => item.status_display,
            ),
            createNumberColumn<ProjectListItem, TableKey>(
                'people_count',
                strings.allThreeWActivityPeopleReached,
                (item) => getPeopleReached(item),
            ),
            createElementColumn<
            ProjectListItem,
                number,
                ThreeWActivityTableActionsProps
            >(
                'actions',
                '',
                ThreeWActivityTableActions,
                (activityId) => ({
                    activityId,
                }),
            ),
        ]),
        [
            strings.allThreeWActivityNS,
            strings.allThreeWActivityTitle,
            strings.allThreeWActivityStartDate,
            strings.allThreeWCountry,
            strings.allThreeWActivityRegion,
            strings.allThreeWActivityStatus,
            strings.allThreeWActivityPeopleReached,
            districtRendererParams,
        ],
    );

    const heading = resolveToComponent(
        strings.allThreeWActivityHeading,
        { numThreeWs: formatNumber(projectResponse?.count) ?? '--' },
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
            saveAs(blob, 'all-3w-emergency-projects.csv');
        },
    });

    const handleExportClick = useCallback(() => {
        if (!projectResponse?.count) {
            return;
        }
        triggerExportStart(
            '/api/v2/emergency-project/',
            projectResponse?.count,
            query,
        );
    }, [
        query,
        triggerExportStart,
        projectResponse?.count,
    ]);
    return (
        <Page
            className={styles.allThreeW}
            title={strings.allThreeWTitle}
            heading={heading}
        >
            <Container
                actions={(
                    <ExportButton
                        onClick={handleExportClick}
                        progress={progress}
                        pendingExport={pendingExport}
                        totalCount={projectResponse?.count}
                    />
                )}
                footerActions={(
                    <Pager
                        activePage={projectActivePage}
                        onActivePageChange={setProjectActivePage}
                        itemsCount={projectResponse?.count ?? 0}
                        maxItemsPerPage={limit}
                    />
                )}
            >
                <Table
                    pending={projectResponsePending}
                    filtered={false}
                    className={styles.projectTable}
                    data={projectResponse?.results}
                    columns={columns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllThreeWActivity';
