import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import NumberOutput from '#components/NumberOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from '../i18n.json';
import styles from './styles.module.css';
import { StrategicPriority } from '#types/serverResponse';
import { useMemo } from 'react';
import { createNumberColumn, createStringColumn } from '#components/Table/ColumnShortcuts';
import Table from '#components/Table';

interface Props {
    className?: string;
    data?: StrategicPriority[];
}

function strategicPrioritiesKeySelector(strategic: StrategicPriority) {
    return strategic.id;
}

// eslint-disable-next-line import/prefer-default-export
function StrategicPrioritiesTable(props: Props) {
    const {
        className,
        data,
    } = props;

    const strings = useTranslation(i18n);

    const columns = useMemo(() => ([
        createStringColumn<StrategicPriority, number>(
            'title',
            strings.countryPlanStrategicPriority,
            (strategic) => strategic?.type_display,
        ),
        createNumberColumn<StrategicPriority, number>(
            'title',
            strings.countryPlanStrategicPriority,
            (strategic) => strategic?.people_targeted,
        ),
    ]), []);

    return (
        <Container
            className={_cs(styles.strategicPrioritiesTable, className)}
            heading={strings.countryPlanStrategicPrioritiesTableHeading}
        >
            <Table
                className={styles.inProgressDrefTable}
                data={data}
                columns={columns}
                keySelector={strategicPrioritiesKeySelector}
            />
        </Container>
    );
}

export default StrategicPrioritiesTable;
