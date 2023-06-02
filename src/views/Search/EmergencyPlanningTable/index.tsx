import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import useTranslation from '#hooks/useTranslation';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/ColumnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface EmergencyPlanningResult {
    id: number;
    name: string;
    code: string;
    country: string;
    country_id: number;
    start_date: string;
    score: number;
    type: string;
}

function emergencyPlanningKeySelector(emergencyPlanning: EmergencyPlanningResult) {
    return emergencyPlanning.id;
}

interface Props {
    className?: string;
    data: EmergencyPlanningResult[] | undefined;
    actions: React.ReactNode;
}

function EmergencyPlanningTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = [
        createDateColumn<EmergencyPlanningResult, number>(
            'start_date',
            strings.searchEmergencyPlanningTableDate,
            (emergencyPlanning) => emergencyPlanning.start_date,
        ),
        createStringColumn<EmergencyPlanningResult, number>(
            'type',
            strings.searchEmergencyPlanningTableType,
            (emergencyPlanning) => emergencyPlanning.type,
        ),
        createStringColumn<EmergencyPlanningResult, number>(
            'code',
            strings.searchEmergencyPlanningTableCode,
            (emergencyPlanning) => emergencyPlanning.code,
        ),
        createLinkColumn<EmergencyPlanningResult, number>(
            'name',
            strings.searchEmergencyPlanningTableTitle,
            (emergencyPlanning) => emergencyPlanning.name,
            (emergencyPlanning) => ({
                to: `/emergencies/${emergencyPlanning.id}`,
            }),
        ),
        createLinkColumn<EmergencyPlanningResult, number>(
            'country',
            strings.searchEmergencyPlanningTableCountry,
            (emergencyPlanning) => emergencyPlanning.country,
            (emergencyPlanning) => ({
                to: `/countries/${emergencyPlanning.country_id}`,
            }),
        ),
    ];

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.emergencyPlanningTable, className)}
            heading={strings.searchIfrcEmergencyPlanningAndReporting}
            childrenContainerClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={data}
                columns={columns}
                keySelector={emergencyPlanningKeySelector}
            />
        </Container>
    );
}

export default EmergencyPlanningTable;
