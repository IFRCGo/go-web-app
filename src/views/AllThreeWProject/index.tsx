import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createNumberColumn,
    createElementColumn,
} from '#components/Table/ColumnShortcuts';
import useUrlSearchState from '#hooks/useUrlSearchState';
import useTranslation from '#hooks/useTranslation';
import useFilterState from '#hooks/useFilterState';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';
import { resolveToComponent } from '#utils/translation';
import { numericIdSelector } from '#utils/selectors';
import { formatNumber } from '#utils/common';

import ThreeWProjectTableActions, {
    type Props as ThreeWProjectTableActionsProps,
} from './AllThreeWProjectTableActions';

import i18n from './i18n.json';
import styles from './styles.module.css';

type ProjectsResponse = GoApiResponse<'/api/v2/project/'>;
type ProjectListItem = NonNullable<ProjectsResponse['results']>[number];

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

    const [filterReportingNS] = useUrlSearchState<number | undefined>(
        'reporting_ns',
        (searchValue) => {
            const potentialValue = isDefined(searchValue) ? Number(searchValue) : undefined;
            return potentialValue;
        },
        (reportingNs) => reportingNs,
    );

    const {
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 15,
    });

    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest({
        url: '/api/v2/project/',
        preserveResponse: true,
        query: {
            limit,
            offset,
            country: isDefined(filterCountry) ? [filterCountry] : undefined,
            reporting_ns: isDefined(filterReportingNS) ? [filterReportingNS] : undefined,
        },
    });

    const projectColumns = useMemo(
        () => ([
            createStringColumn<ProjectListItem, string | number>(
                'country',
                strings.allThreeWCountry,
                (item) => item.project_country_detail?.name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'ns',
                strings.allThreeWNS,
                (item) => item.reporting_ns_detail?.society_name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'name',
                strings.allThreeWProjectName,
                (item) => item.name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'sector',
                strings.allThreeWSector,
                (item) => item.primary_sector_display,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'budget',
                strings.allThreeWTotalBudget,
                (item) => item.budget_amount,
                undefined,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'programmeType',
                strings.allThreeWProgrammeType,
                (item) => item.programme_type_display,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'disasterType',
                strings.allThreeWDisasterType,
                (item) => item.dtype_detail?.name,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'peopleTargeted',
                strings.allThreeWPeopleTargeted,
                (item) => item.target_total,
                undefined,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'peopleReached',
                strings.allThreeWPeopleReached,
                (item) => item.reached_total,
                undefined,
            ),
            createElementColumn<
            ProjectListItem,
                number,
                ThreeWProjectTableActionsProps
            >(
                'actions',
                '',
                ThreeWProjectTableActions,
                (projectId) => ({
                    projectId,
                }),
            ),
        ]),
        [strings],
    );

    const heading = resolveToComponent(
        strings.allThreeWHeading,
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
                        activePage={page}
                        onActivePageChange={setPage}
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
                    columns={projectColumns}
                    keySelector={numericIdSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllThreeWProject';
