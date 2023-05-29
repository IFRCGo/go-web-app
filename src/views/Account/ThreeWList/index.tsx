import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
  MdSearch,
  MdEdit,
} from 'react-icons/md';

import useTranslation from '#hooks/useTranslation';
import { createActionColumn } from '#components/Table/ColumnShortcuts';
import Container from '#components/Container';
import Pager from '#components/Pager';
import BlockLoading from '#components/BlockLoading';
import Table from '#components/Table';
import DropdownMenuItem from '#components/DropdownMenuItem';
import {
  ListResponse,
  useRequest,
} from '#utils/restRequest';
import {
  EmergencyProjectResponse,
  Project,
} from '#types/project.ts';
import { projectKeySelector } from './projectTableColumns';
import { getAllProjectColumns } from './projectTableColumns';
import { getColumns as getActivityColumns } from './projectTableColumns';

import i18n from '../i18n.json';

import styles from './styles.module.scss';

const ITEM_PER_PAGE = 5;

interface Props {
  className?: string;
}

function ThreeWList(props: Props) {
  const {
    className,
  } = props;
  const strings = useTranslation(i18n);

  const [projectActivePage, setProjectActivePage] = React.useState(1);
  const [activityActivePage, setActivityActivePage] = React.useState(1);

  const {
    pending: projectPending,
    response: projectResponse,
  } = useRequest<ListResponse<Project>>({
    url: 'api/v2/project/',
    query: {
      limit: ITEM_PER_PAGE,
      offset: ITEM_PER_PAGE * (projectActivePage - 1),
    },
  });

  const {
    pending: activityPending,
    response: activityResponse,
  } = useRequest<ListResponse<EmergencyProjectResponse>>({
    url: 'api/v2/emergency-project/',
    query: {
      limit: ITEM_PER_PAGE,
      offset: ITEM_PER_PAGE * (activityActivePage - 1),
    },
  });

  const projectColumns = React.useMemo(() => {
    const actionsColumn = createActionColumn(
      'actions',
      (rowKey: number | string, prj: Project) => ({
        extraActions: (
          <>
            <DropdownMenuItem
              href={`/three-w/${prj.id}/`}
              label={strings.projectListTableViewDetails}
              icon={<MdSearch />}
            />
            <DropdownMenuItem
              href={`/three-w/${prj.id}/edit/`}
              icon={<MdEdit />}
              label={strings.projectListTableEdit}
            />
          </>
        ),
      }),
    );

    return [
      ...getAllProjectColumns(strings),
      actionsColumn,
    ];
  }, [strings]);

  const activityColumns = React.useMemo(
    () => getActivityColumns(styles.actionColumn),
    [],
  );

  const pending = projectPending || activityPending;

  return (
    <Container
      className={_cs(styles.threeWList, className)}
      childrenContainerClassName={styles.mainContent}
    >
      {pending && <BlockLoading />}
      {!pending && projectResponse && (
        <Container
          heading="3W Projects"
          footerActions={(
            <Pager
              activePage={projectActivePage}
              onActivePageChange={setProjectActivePage}
              itemsCount={projectResponse.count}
              maxItemsPerPage={ITEM_PER_PAGE}
            />
          )}
        >
          <Table
            className={styles.projectTable}
            data={projectResponse.results}
            columns={projectColumns}
            keySelector={projectKeySelector}
            variant="large"
          />
        </Container>
      )}
      {!pending && activityResponse && (
        <Container
          heading="Emergency Response 3W Activities"
          footerActions={(
            <Pager
              activePage={activityActivePage}
              onActivePageChange={setActivityActivePage}
              itemsCount={activityResponse.count}
              maxItemsPerPage={ITEM_PER_PAGE}
            />
          )}
        >
          <Table
            className={styles.activityTable}
            data={activityResponse.results}
            columns={activityColumns}
            keySelector={d => d.id}
          // variant="large"
          />
        </Container>
      )}
    </Container>
  );
}

export default ThreeWList;
