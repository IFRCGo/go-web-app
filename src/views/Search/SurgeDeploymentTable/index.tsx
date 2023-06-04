import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import useTranslation from '#hooks/useTranslation';
import {
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface SurgeDeploymentResult {
    id: number;
    event_name: string;
    deployed_country: string;
    type: string;
    owner: string;
    personnel_units: number;
    equipment_units: number;
    event_id: number;
    deployed_country_id: number;
    score: number;
}

function surgeDeploymentKeySelector(surgeDeployment: SurgeDeploymentResult) {
    return surgeDeployment.id;
}

interface Props {
    className?: string;
    data: SurgeDeploymentResult[] | undefined;
    actions: React.ReactNode;
}

function SurgeDeploymentTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = [
        createStringColumn<SurgeDeploymentResult, number>(
            'owner',
            strings.searchSurgeDeploymentTableOwner,
            (surgeDeployment) => surgeDeployment.owner,
        ),
        createStringColumn<SurgeDeploymentResult, number>(
            'type',
            strings.searchSurgeDeploymentTableType,
            (surgeDeployment) => surgeDeployment.type,
        ),
        createNumberColumn<SurgeDeploymentResult, number>(
            'personnel_units',
            strings.searchSurgeDeploymentTablePersonnelUnits,
            (surgeDeployment) => surgeDeployment.personnel_units,
        ),
        createNumberColumn<SurgeDeploymentResult, number>(
            'equipment_units',
            strings.searchSurgeDeploymentTableEquipmentUnits,
            (surgeDeployment) => surgeDeployment.equipment_units,
        ),
        createLinkColumn<SurgeDeploymentResult, number>(
            'deployed_country',
            strings.searchSurgeDeploymentsTableCountryDeployedTo,
            (surgeDeployment) => surgeDeployment.deployed_country,
            (surgeDeployment) => ({
                to: `/countries/${surgeDeployment.deployed_country_id}`,
            }),
        ),
        createLinkColumn<SurgeDeploymentResult, number>(
            'event_name',
            strings.searchSurgeDeploymentsTableEmergency,
            (surgeDeployment) => surgeDeployment.event_name,
            (surgeDeployment) => ({
                to: `/emergencies/${surgeDeployment.event_id}`,
            }),
        ),
    ];

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.surgeDeploymentTable, className)}
            heading={strings.searchIfrcSurgeDeployments}
            childrenContainerClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={data}
                columns={columns}
                keySelector={surgeDeploymentKeySelector}
            />
        </Container>
    );
}

export default SurgeDeploymentTable;
