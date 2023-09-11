import { useMemo } from 'react';
import { isNotDefined, isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import Pager from '#components/Pager';
import useTranslation from '#hooks/useTranslation';
import { hasSomeDefinedValue } from '#utils/common';
import { type GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';
import {
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';

import { numericIdSelector } from '#utils/selectors';

import i18n from './i18n.json';
import { type FilterValue } from '../Filters';

type Project = NonNullable<GoApiResponse<'/api/v2/project/'>['results']>[number];
const PAGE_SIZE = 20;

interface Props {
    country: string;
    filters: FilterValue;
    page: number;
    setPage: (value: number) => void;
}

function CountryProjectTable(props: Props) {
    const {
        country,
        filters,
        page,
        setPage,
    } = props;

    const strings = useTranslation(i18n);
    const {
        response: projectsResponse,
        pending: projectsResponsePending,
    } = useRequest({
        url: '/api/v2/project/',
        skip: isNotDefined(country),
        pathVariables: isDefined(country) ? {
            id: country,
        } : undefined,
        query: {
            ...filters,
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            country,
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
    ]), [strings]);

    return (
        <Container
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={projectsResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
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
