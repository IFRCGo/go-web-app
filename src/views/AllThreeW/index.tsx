import { useMemo, useState } from 'react';

import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import Container from '#components/Container';
import Pager from '#components/Pager';
import Table from '#components/Table';
import {
    createStringColumn,
    createNumberColumn,
} from '#components/Table/ColumnShortcuts';
import { useRequest } from '#utils/restRequest';
import type { paths } from '#generated/types';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetProjects = paths['/api/v2/project/']['get'];
type ProjectsResponse = GetProjects['responses']['200']['content']['application/json'];
type ProjectListItem = NonNullable<ProjectsResponse['results']>[number];

const ITEM_PER_PAGE = 15;
function projectKeySelector(project: ProjectListItem) {
    return project.id;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [projectActivePage, setProjectActivePage] = useState(1);
    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest<ProjectsResponse>({
        url: '/api/v2/project/',
        preserveResponse: true,
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const projectColumns = useMemo(
        () => ([
            createStringColumn<ProjectListItem, string | number>(
                'country',
                strings.allThreeWCountry,
                (item) => item.project_country_detail?.name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'ns',
                strings.allThreeWNS,
                (item) => item.reporting_ns_detail?.society_name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'name',
                strings.allThreeWProjectName,
                (item) => item.name,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'sector',
                strings.allThreeWSector,
                (item) => item.primary_sector_display,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'budget',
                strings.allThreeWTotalBudget,
                (item) => item.budget_amount,
                undefined,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'programmeType',
                strings.allThreeWProgrammeType,
                (item) => item.programme_type_display,
            ),
            createStringColumn<ProjectListItem, string | number>(
                'disasterType',
                strings.allThreeWDisasterType,
                (item) => item.dtype_detail?.name,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'peopleTargeted',
                strings.allThreeWPeopleTargeted,
                (item) => item.target_total,
                undefined,
            ),
            createNumberColumn<ProjectListItem, string | number>(
                'peopleReached',
                strings.allThreeWPeopleReached,
                (item) => item.reached_total,
                undefined,
            ),
        ]),
        [strings],
    );

    const heading = resolveToComponent(
        strings.allThreeWHeading,
        { numThreeWs: projectResponse?.count ?? '--' },
    );

    return (
        <Page
            className={styles.allThreeW}
            title={strings.allThreeWTitle}
            heading={heading}
        >
            <Container
                footerActions={(
                    <Pager
                        activePage={projectActivePage}
                        onActivePageChange={setProjectActivePage}
                        itemsCount={projectResponse?.count ?? 0}
                        maxItemsPerPage={ITEM_PER_PAGE}
                    />
                )}
            >
                <Table
                    pending={projectResponsePending}
                    filtered={false}
                    className={styles.projectTable}
                    data={projectResponse?.results}
                    columns={projectColumns}
                    keySelector={projectKeySelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllThreeW';
