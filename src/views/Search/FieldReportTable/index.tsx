import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import Table from '#components/Table';
import useTranslation from '#hooks/useTranslation';
import {
    createDateColumn,
    createLinkColumn,
    createStringColumn,
} from '#components/Table/columnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface FieldReportResponse {
    id: number;
    name: string;
    created_at: string;
    type: string;
    score: number;
}

function fieldReportKeySelector(fieldReport: FieldReportResponse) {
    return fieldReport.id;
}

interface Props {
    className?: string;
    data: FieldReportResponse[] | undefined;
    actions: React.ReactNode;
}

function FieldReportTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = [
        createDateColumn<FieldReportResponse, number>(
            'created_at',
            strings.searchFieldReportTableDate,
            (fieldReport) => fieldReport.created_at,
        ),
        createStringColumn<FieldReportResponse, number>(
            'type',
            strings.searchFieldReportTableType,
            (fieldReport) => fieldReport.type,
        ),
        createLinkColumn<FieldReportResponse, number>(
            'name',
            strings.searchFieldReportTableTitle,
            (fieldReport) => fieldReport.name,
            (fieldReport) => ({
                to: `/reports/${fieldReport.id}`,
            }),
        ),
    ];

    if (!data) {
        return null;
    }

    return (
        <Container
            className={_cs(styles.fieldReportTable, className)}
            heading={strings.searchIfrcReport}
            childrenContainerClassName={styles.content}
            actions={actions}
        >
            <Table
                className={styles.fieldReport}
                data={data}
                columns={columns}
                keySelector={fieldReportKeySelector}
            />
        </Container>
    );
}

export default FieldReportTable;
