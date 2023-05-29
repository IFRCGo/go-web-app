import {
  createStringColumn,
  createNumberColumn,
} from '#components/Table/predefinedColumns';

import {
  Project,
  Strings,
} from '#types';

const getBaseColumns = (strings: Strings) => ([
  createStringColumn<Project, string | number>(
    'name',
    strings.threeWTableProjectName,
    (item) => item.name,
  ),
  createStringColumn<Project, string | number>(
    'sector',
    strings.threeWTableSector,
    (item) => item.primary_sector_display,
  ),
  createNumberColumn<Project, string | number>(
    'budget',
    strings.threeWTableTotalBudget,
    (item) => item.budget_amount,
    undefined,
    { normal: true, precision: 'auto' }
  ),
  createStringColumn<Project, string | number>(
    'programmeType',
    strings.threeWTableProgrammeType,
    (item) => item.programme_type_display,
  ),
  createStringColumn<Project, string | number>(
    'disasterType',
    strings.threeWTableDisasterType,
    (item) => item.dtype_detail?.name,
  ),
  createNumberColumn<Project, string | number>(
    'peopleTargeted',
    strings.threeWTablePeopleTargeted,
    (item) => item.target_total,
    undefined,
    { normal: true, precision: 'auto' }
  ),
  createNumberColumn<Project, string | number>(
    'peopleReached',
    strings.threeWTablePeopleReached2,
    (item) => item.reached_total,
    undefined,
    { normal: true, precision: 'auto' }
  ),
]);

export const getInCountryProjectColumns = (strings: Strings) => ([
  createStringColumn<Project, string | number>(
    'ns',
    strings.threeWTableNS,
    (item) => item.reporting_ns_detail?.society_name,
  ),
  ...getBaseColumns(strings),
]);

export const getNSProjectColumns = (strings: Strings) => ([
  createStringColumn<Project, string | number>(
    'country',
    strings.threeWTableCountry,
    (item) => item.project_country_detail?.name,
  ),
  ...getBaseColumns(strings),
]);

export const getAllProjectColumns = (strings: Strings) => ([
  createStringColumn<Project, string | number>(
    'country',
    strings.threeWTableCountry,
    (item) => item.project_country_detail?.name,
  ),
  createStringColumn<Project, string | number>(
    'ns',
    strings.threeWTableNS,
    (item) => item.reporting_ns_detail?.society_name,
  ),
  ...getBaseColumns(strings),
]);
