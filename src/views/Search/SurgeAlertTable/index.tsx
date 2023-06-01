import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import useTranslation from '#hooks/useTranslation';
import { getDuration } from '#utils/common';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/columnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface SurgeAlertResult {
    id: number;
    name: string;
    keywords: string[] | null;
    event_name: string;
    country: string | null;
    country_id: string | null;
    start_date: string | null;
    alert_date: string | null;
    score: number;
    event_id: number;
    status: string;
    deadline: string;
}

function surgeAlertKeySelector(surgeAlert: SurgeAlertResult) {
    return surgeAlert.id;
}

interface Props {
    className?: string;
    data: SurgeAlertResult[] | undefined;
    actions: React.ReactNode;
}

function SurgeAlertTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = [
        createDateColumn<SurgeAlertResult, number>(
            'alert_date',
            strings.searchSurgeAlertTableAlertDate,
            (surgeAlert) => surgeAlert.alert_date,
        ),
        // TODO: createDurationColumn
        createStringColumn<SurgeAlertResult, number>(
            'duration',
            strings.searchSurgeAlertTableDuration,
            (surgeAlert) => {
                if (!surgeAlert.alert_date) {
                    return '-';
                }

                const alertDate = new Date(surgeAlert.alert_date);
                const deadline = new Date(surgeAlert.deadline);
                const duration = getDuration(alertDate, deadline);

                return duration;
            },
        ),
        createDateColumn<SurgeAlertResult, number>(
            'start_date',
            strings.searchSurgeAlertTableStartDate,
            (surgeAlert) => surgeAlert.start_date,
        ),
        createStringColumn<SurgeAlertResult, number>(
            'name',
            strings.searchSurgeAlertTablePosition,
            (surgeAlert) => surgeAlert.name,
        ),
        createStringColumn<SurgeAlertResult, number>(
            'keywords',
            strings.searchSurgeAlertTableKeywords,
            (surgeAlert) => surgeAlert.keywords?.join(', '),
        ),
        createLinkColumn<SurgeAlertResult, number>(
            'event_name',
            strings.searchSurgeAlertTableEmergency,
            (surgeAlert) => surgeAlert.event_name,
            (surgeAlert) => ({
                to: `/emergencies/${surgeAlert.event_id}`,
            }),
        ),
        createLinkColumn<SurgeAlertResult, number>(
            'country',
            strings.searchSurgeAlertTableCountry,
            (surgeAlert) => surgeAlert.country,
            (surgeAlert) => ({
                to: `/countries/${surgeAlert.country_id}`,
            }),
        ),
        createStringColumn<SurgeAlertResult, number>(
            'status',
            strings.searchSurgeAlertTableStatus,
            (surgeAlert) => surgeAlert.status,
        ),
    ];

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.surgeAlertsTable, className)}
            heading={strings.searchIfrcOpenSurgeAlerts}
            childrenContainerClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.appealsTable}
                data={data}
                columns={columns}
                keySelector={surgeAlertKeySelector}
            />
        </Container>
    );
}

export default SurgeAlertTable;
