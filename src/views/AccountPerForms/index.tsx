import { useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import { useRequest, ListResponse } from '#utils/restRequest';
import Table from '#components/Table';
import {
    createActionColumn,
    createNumberColumn,
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import Link from '#components/Link';
import Container from '#components/Container';
import RouteContext from '#contexts/route';

import styles from './styles.module.css';

interface PerProcessStatusItem {
    assessment_number: number;
    country: number;
    country_details: {
        iso3: string | null;
        name: string;
    };
    date_of_assessment: string;
    phase: number;
    phase_display: string;
    id: number;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest<ListResponse<PerProcessStatusItem>>({
        url: 'api/v2/per-process-status',
    });
    const {
        country: countryRoute,
        perOverviewForm: perOverviewFormRoute,
        newPerOverviewForm: newPerOverviewFormRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createLinkColumn<PerProcessStatusItem, string | number>(
                'country',
                'Country',
                (item) => item.country_details?.name,
                (item) => ({
                    to: generatePath(
                        countryRoute.absolutePath,
                        { countryId: String(item.country) },
                    ),
                }),
            ),
            createDateColumn<PerProcessStatusItem, string | number>(
                'date_of_assessment',
                'Start date',
                (item) => item.date_of_assessment,
            ),
            createNumberColumn<PerProcessStatusItem, string | number>(
                'assessment_number',
                'PER cycle',
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, string>(
                'phase',
                'Phase',
                (item) => item.phase_display,
            ),
            createActionColumn<PerProcessStatusItem, string | number>(
                'actions',
                (item) => ({
                    children: (
                        <Link
                            to={generatePath(
                                perOverviewFormRoute.absolutePath,
                                { perId: item.id },
                            )}
                        >
                            Edit
                        </Link>
                    ),
                }),
            ),
        ]),
        [countryRoute, perOverviewFormRoute],
    );

    return (
        <Container
            className={styles.accountPerForms}
            heading="PER Process Status"
            headingLevel={2}
            withHeaderBorder
            actions={(
                <Link to={newPerOverviewFormRoute.absolutePath}>
                    Start New PER Process
                </Link>
            )}
        >
            <Table
                pending={perProcessStatusPending}
                columns={columns}
                keySelector={(item) => item.id}
                data={perProcessStatusResponse?.results}
            />
        </Container>
    );
}

Component.displayName = 'AccountPerForms';
