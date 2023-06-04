import { generatePath } from 'react-router-dom';
import { useMemo, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import Table from '#components/Table';
import {
    createNumberColumn,
    createDateRangeColumn,
    createStringColumn,
    createLinkColumn,
} from '#components/Table/ColumnShortcuts';
import RouteContext from '#contexts/route';

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
    const { emergency: emergencyRoute } = useContext(RouteContext);

    const columns = useMemo(() => ([
        createLinkColumn<ProjectResult, number>(
            'emergency_name',
            strings.searchProjectTableEmergency,
            (project) => project.event_name,
            (project) => ({
                to: generatePath(
                    emergencyRoute.absolutePath,
                    { emergencyId: String(project.event_id) },
                ),
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
            (project) => ({
                startDate: project.start_date,
                endDate: project.end_date,
            }),
        ),
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
    ]), [strings, emergencyRoute]);

    if (!data) {
        return null;
    }

    return (
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
    );
}

export default ProjectTable;
