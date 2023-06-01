import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import LanguageContext from '#root/languageContext';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/predefinedColumns';

import styles from './styles.module.scss';

export interface RapidResponseResult {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  postion: string | null;
  type: string;
  deploying_country_name: string;
  deploying_country_id: number;
  deployed_to_country_name: string;
  deployed_to_country_id: number;
  event_name: string;
  event_id: number;
  score: number;
}

function rapidResponseDeploymentKeySelector(rapidResponse: RapidResponseResult) {
    return rapidResponse.id;
}

interface Props {
  className?: string;
  data: RapidResponseResult[] | undefined;
  actions: React.ReactNode;
}

function RapidResponseDeploymentTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const { strings } = React.useContext(LanguageContext);

    const columns = [
        createDateColumn<RapidResponseResult, number>(
            'start_date',
            strings.searchRapidDeploymentTableStartDate,
            (rapidResponse) => rapidResponse.start_date,
        ),
        createDateColumn<RapidResponseResult, number>(
            'end_date',
            strings.searchRapidDeploymentTableEndDate,
            (rapidResponse) => rapidResponse.end_date,
        ),
        createStringColumn<RapidResponseResult, number>(
            'name',
            strings.searchRapidDeploymentTableName,
            (rapidResponse) => rapidResponse.name,
        ),
        createStringColumn<RapidResponseResult, number>(
            'position',
            strings.searchRapidDeploymentTablePosition,
            (rapidResponse) => rapidResponse.postion,
        ),
        createStringColumn<RapidResponseResult, number>(
            'keywords',
            strings.searchRapidDeploymentTableKeywords,
            (rapidResponse) => rapidResponse.type,
        ),
        createLinkColumn<RapidResponseResult, number>(
            'deploying_country_name',
            strings.searchRapidDeploymentTableDeployingParty,
            (rapidResponse) => rapidResponse.deploying_country_name,
            (rapidResponse) => ({
                href: `/countries/${rapidResponse.deploying_country_id}`,
                variant: 'table',
            }),
        ),
        createLinkColumn<RapidResponseResult, number>(
            'deploying_country_name',
            strings.searchRapidDeploymentTableDeployedTo,
            (rapidResponse) => rapidResponse.deployed_to_country_name,
            (rapidResponse) => ({
                href: `/countries/${rapidResponse.deployed_to_country_id}`,
                variant: 'table',
            }),
        ),
        createLinkColumn<RapidResponseResult, number>(
            'event_name',
            strings.searchRapidDeploymentTableEmergency,
            (rapidResponse) => rapidResponse.event_name,
            (rapidResponse) => ({
                href: `/emergencies/${rapidResponse.event_id}`,
                variant: 'table',
            }),
        ),
    ];

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.rapidResponseTable, className)}
            heading={strings.searchIFRCRapidResponseDeployment}
            contentClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.rapidResponse}
                data={data}
                columns={columns}
                keySelector={rapidResponseDeploymentKeySelector}
                variant="large"
            />
        </Container>
    );
}

export default RapidResponseDeploymentTable;
