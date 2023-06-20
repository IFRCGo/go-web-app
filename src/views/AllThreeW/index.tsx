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
import {
    ListResponse,
    useRequest,
} from '#utils/restRequest';
import type { Project } from '#types/project';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

const ITEM_PER_PAGE = 15;
const idSelector = <T extends { id: number }>(p: T) => p.id;

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const [projectActivePage, setProjectActivePage] = useState(1);
    const {
        response: projectResponse,
        pending: projectResponsePending,
    } = useRequest<ListResponse<Project>>({
        url: 'api/v2/project/',
        preserveResponse: true,
        query: {
            limit: ITEM_PER_PAGE,
            offset: ITEM_PER_PAGE * (projectActivePage - 1),
        },
    });

    const projectColumns = useMemo(
        () => ([
            createStringColumn<Project, string | number>(
                'country',
                strings.allThreeWCountry,
                (item) => item.project_country_detail?.name,
            ),
            createStringColumn<Project, string | number>(
                'ns',
                strings.allThreeWNS,
                (item) => item.reporting_ns_detail?.society_name,
            ),
            createStringColumn<Project, string | number>(
                'name',
                strings.allThreeWProjectName,
                (item) => item.name,
            ),
            createStringColumn<Project, string | number>(
                'sector',
                strings.allThreeWSector,
                (item) => item.primary_sector_display,
            ),
            createNumberColumn<Project, string | number>(
                'budget',
                strings.allThreeWTotalBudget,
                (item) => item.budget_amount,
                undefined,
            ),
            createStringColumn<Project, string | number>(
                'programmeType',
                strings.allThreeWProgrammeType,
                (item) => item.programme_type_display,
            ),
            createStringColumn<Project, string | number>(
                'disasterType',
                strings.allThreeWDisasterType,
                (item) => item.dtype_detail?.name,
            ),
            createNumberColumn<Project, string | number>(
                'peopleTargeted',
                strings.allThreeWPeopleTargeted,
                (item) => item.target_total,
                undefined,
            ),
            createNumberColumn<Project, string | number>(
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
                    className={styles.projectTable}
                    data={projectResponse?.results}
                    columns={projectColumns}
                    keySelector={idSelector}
                />
            </Container>
        </Page>
    );
}

Component.displayName = 'AllThreeW';
