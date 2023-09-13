import { useCallback, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createLinkColumn,
    createDateColumn,
    createListDisplayColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import useUrlSearchState from '#hooks/useUrlSearchState';
import useFilterState from '#hooks/useFilterState';
import useTranslation from '#hooks/useTranslation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import { numericIdSelector } from '#utils/selectors';
import { formatNumber, sumSafe } from '#utils/common';

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

    const {
        page: projectActivePage,
        setPage: setProjectActivePage,
        limit,
        offset,
    } = useFilterState<object>(
        {},
        undefined,
        1,
        15,
    );
    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest({
        url: '/api/v2/emergency-project/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            country: isDefined(filterCountry) ? [filterCountry] : undefined,
        },
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
                // FIXME: use translations
                'Country',
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
        ]),
        [strings, districtRendererParams],
    );

    const heading = resolveToComponent(
        strings.allThreeWActivityHeading,
        { numThreeWs: formatNumber(projectResponse?.count) ?? '--' },
    );

    return (
        <Page
            className={styles.allThreeW}
            title={strings.allThreeWTitle}
            heading={heading}
        >
            <Container
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
