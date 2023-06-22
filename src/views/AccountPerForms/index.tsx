import { useMemo, useContext } from 'react';
import { generatePath } from 'react-router-dom';

import { useRequest } from '#utils/restRequest';
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
import type { GET } from '#types/serverResponse';

import styles from './styles.module.css';

type PerProcessStatusResponse = GET['api/v2/per-process-status'];
type PerProcessStatusItem = PerProcessStatusResponse['results'][number];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        pending: perProcessStatusPending,
        response: perProcessStatusResponse,
    } = useRequest<PerProcessStatusResponse>({
        url: 'api/v2/per-process-status',
    });
    const {
        country: countryRoute,
        perOverviewForm: perOverviewFormRoute,
        newPerOverviewForm: newPerOverviewFormRoute,
    } = useContext(RouteContext);

    const columns = useMemo(
        () => ([
            createLinkColumn<PerProcessStatusItem, number | string>(
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
            createDateColumn<PerProcessStatusItem, number | string>(
                'date_of_assessment',
                'Start date',
                (item) => item.date_of_assessment,
            ),
            createNumberColumn<PerProcessStatusItem, number | string>(
                'assessment_number',
                'PER cycle',
                (item) => item.assessment_number,
            ),
            createStringColumn<PerProcessStatusItem, number | string>(
                'phase',
                'Phase',
                (item) => item.phase_display,
            ),
            createActionColumn<PerProcessStatusItem, number | string>(
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
