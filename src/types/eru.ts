import { CountryMini } from './country';

export interface ERU {
  available: boolean;
  deployed_to: CountryMini;
  equipment_units: number;
  eru_owner: {
    id: number;
    created_at: string;
    updated_at: string;
    eru_set: {
      available: boolean;
      deployed_to: CountryMini;
      equipment_units: number;
      eru: number;
      event: number | null;
      id: number;
      type: number;
      type_display: string;
      units: number
    }[];
    national_society_country: CountryMini;
  }
  event: number | null;
  id: number;
  type: number;
  type_display: string;
  units: number;
}
