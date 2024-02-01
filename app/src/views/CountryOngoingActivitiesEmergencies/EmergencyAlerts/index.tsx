import { useMemo } from 'react';
import {
    Container,
    Pager,
    Table,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    encodeDate,
    isNotDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useFilterState from '#hooks/useFilterState';
import { createCountryListColumn } from '#utils/domain/tableHelpers';
import type { GoApiResponse } from '#utils/restRequest';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EmergencyAlertResponse = GoApiResponse<'/api/v2/gdacs-event/'>;
type EmergencyAlertListItem = NonNullable<EmergencyAlertResponse['results']>[number];

const emergencyAlertKeySelector = (option: EmergencyAlertListItem) => option.id;

// FIXME: use a separate utility
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
thirtyDaysAgo.setHours(0, 0, 0, 0);

interface Props {
    countryId: number;
    className?: string;
}

function EmergencyAlertsTable(props: Props) {
    const {
        className,
        countryId,
    } = props;

    const {
        page,
        setPage,
        limit,
        offset,
    } = useFilterState<object>({
        filter: {},
        pageSize: 5,
    });

    const strings = useTranslation(i18n);

    const columns = useMemo(
        () => ([
            createDateColumn<EmergencyAlertListItem, number>(
                'start_date',
                strings.emergencyAlertsTablePublicationDate,
                (item) => item.publication_date,
                {
                    columnClassName: styles.pulicationDate,
                },
            ),
            createStringColumn<EmergencyAlertListItem, number>(
                'disaster_type',
                strings.emergencyAlertsDisasterType,
                (item) => item.disaster_type.name,
            ),
            createStringColumn<EmergencyAlertListItem, number>(
                'description',
                strings.emergencyAlertsTableDisasterDescription,
                (item) => item.title,
            ),
            createStringColumn<EmergencyAlertListItem, number>(
                'population',
                strings.emergencyAlertsTableExposedPopulation,
                (item) => `${item.population_value} ${item.population_unit}`,
            ),
            createCountryListColumn<EmergencyAlertListItem, number>(
                'countries',
                strings.emergencyAlertsTableExposedCountries,
                (item) => item.countries,
            ),
        ]),
        [
            strings.emergencyAlertsTablePublicationDate,
            strings.emergencyAlertsDisasterType,
            strings.emergencyAlertsTableDisasterDescription,
            strings.emergencyAlertsTableExposedPopulation,
            strings.emergencyAlertsTableExposedCountries,
        ],
    );

    const {
        pending: emergencyAlertsPending,
        response: emergencyAlertsResponse,
    } = useRequest({
        url: '/api/v2/gdacs-event/',
        skip: isNotDefined(countryId),
        preserveResponse: true,
        query: {
            limit,
            offset,
            publication_date__gte: encodeDate(thirtyDaysAgo),
            countries: countryId ? [countryId] : undefined,
        },
    });

    return (
        <Container
            className={_cs(styles.emergencyAlertsTable, className)}
            heading={strings.emergencyAlertsTableTitle}
            childrenContainerClassName={styles.content}
            withGridViewInFilter
            footerContentClassName={styles.footerContent}
            withHeaderBorder
            footerContent={(
                <TextOutput
                    label={strings.emergencyAlertsTableSource}
                    value={(
                        <Link
                            title={strings.emergencyAlertsTableGdacs}
                            href="https://www.gdacs.org/alerts/"
                            external
                            withUnderline
                            variant="tertiary"
                        >
                            {strings.emergencyAlertsTableGdacs}
                        </Link>
                    )}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={emergencyAlertsResponse?.count ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            contentViewType="vertical"
        >
            <Table
                pending={emergencyAlertsPending}
                className={styles.table}
                columns={columns}
                filtered={false}
                keySelector={emergencyAlertKeySelector}
                data={emergencyAlertsResponse?.results}
            />
        </Container>
    );
}

export default EmergencyAlertsTable;
