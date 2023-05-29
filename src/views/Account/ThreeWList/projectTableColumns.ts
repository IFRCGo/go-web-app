import {
  createStringColumn,
  createDateColumn,
  createActionColumn,
  createNumberColumn,
} from '#components/Table/ColumnShortcuts';

import {
  Project,
} from '#types/project.ts';

interface Strings { }
interface UserMini { }
interface CountryMini { }
interface DistrictMini { }
interface ActivityInEmergencyProjectResponse { }

export interface EmergencyProjectResponse {
  id: number;
  country: number;
  created_by_details: UserMini;
  modified_by_details: UserMini | null;
  event_details: {
    dtype: number;
    id: number;
    parent_event: number | null;
    name: string;
    slug: string | null;
    emergency_response_contact_email: string | null;
  };
  reporting_ns_details: CountryMini;
  deployed_eru_details: {
    id: number;
    type: number;
    type_display: string;
    units: number | null;
    equipment_units: number | null;
    eru_owner_details: {
      id: number;
      national_society_country_details: CountryMini;
    }
  }
  districts_details: DistrictMini[];
  activities: ActivityInEmergencyProjectResponse[];
  activity_lead_display: string;
  status_display: string;
  country_details: CountryMini;
  title: string;
  created_at: string;
  modified_at: string;
  activity_lead: 'deployed_eru' | 'national_society';
  reporting_ns_contact_name: string | null;
  reporting_ns_contact_role: string | null;
  reporting_ns_contact_email: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  created_by: number;
  modified_by: number | null;
  event: number;
  reporting_ns: number | null;
  deployed_eru: number | null;
  districts: number[];
}

export const projectKeySelector = (p: Project) => p.id;

type P = EmergencyProjectResponse;
type K = string | number;

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
  ),
  createNumberColumn<Project, string | number>(
    'peopleReached',
    strings.threeWTablePeopleReached2,
    (item) => item.reached_total,
    undefined,
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

export const getColumns = (actionColumnHeaderClassName?: string) => ([
  createStringColumn<P, K>(
    'national_society_eru',
    'National Society / ERU',
    (item) => (
      item.activity_lead === 'deployed_eru'
        ? item.deployed_eru_details
          ?.eru_owner_details
          ?.national_society_country_details
          ?.society_name
        : item.reporting_ns_details?.society_name
    ),
  ),
  createStringColumn<P, K>(
    'title',
    'Title',
    (item) => item.title,
  ),
  createDateColumn<P, K>(
    'start_date',
    'Start date',
    (item) => item.start_date,
  ),
  createStringColumn<P, K>(
    'country',
    'Country',
    (item) => item.country_details?.name,
  ),
  createStringColumn<P, K>(
    'districts',
    'Province/Region',
    // TODO: fix typecast
    (item) => (
      <ReducedListDisplay
        value= { item.districts_details?.map(d => d.name) }
        title = "Province / Region"
    />
    ),
  ),
  createStringColumn<P, K > (
    'status',
    'Status',
    (item) => item.status_display,
  ),
    createNumberColumn<P, K>(
      'people_reached',
      'Services provided to people in need', // People Reached
      (item) => getPeopleReached(item),
    ),
    createActionColumn(
      'project_actions',
      (rowKey: number | string, p: EmergencyProjectResponse) => ({
        extraActions: (
          <>
          <DropdownMenuItem
            href= {`/emergency-three-w/${rowKey}/`
      }
            icon = {< IoOpenOutline />}
      label = "View Details"
      />
      <DropdownMenuItem
            href={`/emergency-three-w/${rowKey}/edit/`}
      icon = {< IoPencil />}
      label = "Edit"
      />
      <DropdownMenuItem
            href={`/three-w/new/`}
      icon = {< IoCopy />}
      label = "Duplicate"
            state = {{
      initialValue: p,
      operationType: 'response_activity',
    }}
      />
      < />
    ),
    }),
{ headerContainerClassName: actionColumnHeaderClassName },
  ),
]);
