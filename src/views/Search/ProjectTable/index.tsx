import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import ReducedListDisplay, {
    Props as ReducedListDisplayProps,
} from '#components/ReducedListDisplay';
import useTranslation from '#hooks/useTranslation';
import Table, { Column as TableColumn } from '#components/Table';
import TableHeaderCell, {
    HeaderCellProps as TableHeaderCellProps,
} from '#components/Table/HeaderCell';
import {
    createNumberColumn,
    createDateRangeColumn,
    createStringColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface ProjectResult {
    id: number;
    name: string;
    event_id: number;
    event_name: string;
    national_society: string;
    national_society_id: number;
    tags: string[];
    sector: string;
    start_date: string;
    end_date: string;
    regions: string[];
    people_targeted: number;
    score: number;
}

const projectKeySelector = (project: ProjectResult) => project.id;

interface Props {
    className?: string;
    data: ProjectResult[] | undefined;
    actions: React.ReactNode;
}

function ProjectTable(props: Props) {
    const {
        className,
        data,
        actions,
    } = props;

    const strings = useTranslation(i18n);

    const columns = useMemo(() => {
        const regionsColumn: TableColumn<
        ProjectResult, number, ReducedListDisplayProps, TableHeaderCellProps
        > = {
            id: 'regions',
            title: strings.searchProjectTableProvince,
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {},
            cellRenderer: ReducedListDisplay,
            cellRendererParams: (_, data) => ({
                title: 'Provinces / Region',
                value: data.regions,
            }),
        };
        return ([
            createLinkColumn<ProjectResult, number>(
                'emergency_name',
                strings.searchProjectTableEmergency,
                (project) => project.event_name,
                (project) => ({
                    to: `/emergency/${project.event_id}`,
                }),
            ),
            createStringColumn<ProjectResult, number>(
                'national_society',
                strings.searchProjectTableNationalSociety,
                (project) => project.national_society,
            ),
            createLinkColumn<ProjectResult, number>(
                'name',
                strings.searchProjectTableProjectName,
                (project) => project.name,
                (project) => ({
                    to: `/three-w/${project.id}`,
                }),
            ),
            createDateRangeColumn<ProjectResult, number>(
                'start_date',
                strings.searchProjectTableStartEndDate,
                (project) => (project.start_date, project.end_date),
            ),
            regionsColumn,
            createStringColumn<ProjectResult, number>(
                'sector',
                strings.searchProjectTableSector,
                (project) => project.sector,
            ),
            createNumberColumn<ProjectResult, number>(
                'people_targeted',
                strings.searchProjectTablePeopleTargeted,
                (project) => project.people_targeted,
            ),
        ]);
    }, []);

    if (!data) {
        return null;
    }

    return (
        <>
            {data && (
                <Container
                    className={_cs(styles.projectTable, className)}
                    heading={strings.searchIfrcProjects}
                    childrenContainerClassName={styles.content}
                    actions={actions}
                >
                    <Table
                        className={styles.inProgressDrefTable}
                        data={data}
                        columns={columns}
                        keySelector={projectKeySelector}
                    />
                </Container>
            )}
        </>
    );
}

export default ProjectTable;
