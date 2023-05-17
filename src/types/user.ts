import type { Country } from './country';

export interface Subscription {
  country: number | null;
  dtype: number | null;
  event: number | null;
  lookup_id: string;
  region: number | null;
  rtype: number;
  stype: number;
}

export interface UserMini {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  is_admin_for_countries: number[];
  is_admin_for_regions: number[];
  is_ifrc_admin: boolean;
  is_superuser: boolean
  lang_permissions: {
    en: boolean;
    es: boolean;
    fr: boolean;
    ar: boolean;
  }
  profile: {
    city: string;
    country: Country;
    department: string | null; // NOTE: should verify
    org: string;
    org_type: string;
    phone_number: string;
    position: string;
  }
  subscription: Subscription[];
}
