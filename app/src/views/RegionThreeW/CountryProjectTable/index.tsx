import { useMemo } from 'react';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
    hasSomeDefinedValue,
    numericIdSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import { type FilterValue } from '../Filters';

import i18n from './i18n.json';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];

interface Props {
    country: number;
    filters: FilterValue;
    page: number;
    setPage: (value: number) => void;
    limit: number;
    offset: number;
}

function CountryProjectTable(props: Props) {
    const {
        country,
        filters,
        page,
        setPage,
        limit,
        offset,
    } = props;

    const strings = useTranslation(i18n);
    const {
        response: projectsResponse,
        pending: projectsResponsePending,
    } = useRequest({
        url: '/api/v2/project/',
        skip: isNotDefined(country),
        query: {
            ...filters,
            limit,
            offset,
            country: isDefined(country)
                ? [country]
                : undefined,
        },
    });

    const tableColumns = useMemo(() => ([
        createStringColumn<Project, number>(
            'reporting_ns',
            strings.reportingNationalSociety,
            (item) => item.reporting_ns_detail.society_name,
        ),
        createStringColumn<Project, number>(
            'name',
            strings.activitySector,
            (item) => item.primary_sector_display,
        ),
        createStringColumn<Project, number>(
            'status',
            strings.status,
            (item) => item.status_display,
        ),
        createStringColumn<Project, number>(
            'programme_type',
            strings.programmeType,
            (item) => item.programme_type_display,
        ),
        createNumberColumn<Project, number>(
            'target_total',
            strings.peopleTargeted,
            (item) => item.target_total,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'reached_total',
            strings.peopleReached,
            (item) => item.reached_total,
            undefined,
        ),
        createNumberColumn<Project, number>(
            'budget_amount',
            strings.budget,
            (item) => item.budget_amount,
            undefined,
        ),
    ]), [
        strings.reportingNationalSociety,
        strings.activitySector,
        strings.status,
        strings.programmeType,
        strings.peopleTargeted,
        strings.peopleReached,
        strings.budget,
    ]);

    return (
        <Container
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={projectsResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                filtered={hasSomeDefinedValue(filters)}
                pending={projectsResponsePending}
                data={projectsResponse?.results}
                columns={tableColumns}
                keySelector={numericIdSelector}
            />
        </Container>
    );
}

export default CountryProjectTable;
