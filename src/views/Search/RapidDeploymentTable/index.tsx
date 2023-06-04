import { generatePath } from 'react-router-dom';
import { useContext } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const strings = useTranslation(i18n);
    const {
        country: countryRoute,
        emergency: emergencyRoute,
    } = useContext(RouteContext);

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
                to: isDefined(rapidResponse.deploying_country_id) ? generatePath(
                    countryRoute.absolutePath,
                    { countryId: String(rapidResponse.deploying_country_id) },
                ) : undefined,
            }),
        ),
        createLinkColumn<RapidResponseResult, number>(
            'deployed_to_country_name',
            strings.searchRapidDeploymentTableDeployedTo,
            (rapidResponse) => rapidResponse.deployed_to_country_name,
            (rapidResponse) => ({
                to: isDefined(rapidResponse.deployed_to_country_id) ? generatePath(
                    countryRoute.absolutePath,
                    { countryId: String(rapidResponse.deployed_to_country_id) },
                ) : undefined,
            }),
        ),
        createLinkColumn<RapidResponseResult, number>(
            'event_name',
            strings.searchRapidDeploymentTableEmergency,
            (rapidResponse) => rapidResponse.event_name,
            (rapidResponse) => ({
                to: generatePath(
                    emergencyRoute.absolutePath,
                    { emergencyId: rapidResponse.event_id },
                ),
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
            actions={actions}
        >
            <Table
                className={styles.rapidResponse}
                data={data}
                columns={columns}
                keySelector={rapidResponseDeploymentKeySelector}
            />
        </Container>
    );
}

export default RapidResponseDeploymentTable;
