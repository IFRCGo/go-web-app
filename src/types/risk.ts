export type HazardTypes = 'DR' | 'FL' | 'TC' | 'FI';
export type ImminentHazardTypes = 'EQ' | 'FL' | 'CY' | 'TC' | 'SS' | 'DR' | 'WF';
export type SeasonalHazardTypes = 'EQ' | 'FL' | 'TC' | 'DR' | 'FI';

interface ExposureObject {
  value: number;
  valueFormatted: string;
  valueFormattedNoTrunc: string;
}

export interface PDCEvent {
  created_at: string;
  description: string | null;
  end_date: string | null;
  hazard_id: string;
  hazard_name: string;
  hazard_type: ImminentHazardTypes;
  id: number;
  latitude: number;
  longitude: number;
  pdc_created_at: string | null;
  pdc_updated_at: string | null;
  severity: 'warning' | 'watch' | 'advisory' | 'information' | null;
  severity_display: string | null;
  start_date: string | null;
  status: string;
  status_display: string;
  uuid: string;
}

export interface PDCEventExposure {
  footprint_geojson: GeoJSON.Feature<GeoJSON.Polygon, { type_id: string }> | null;
  storm_position_geojson: GeoJSON.Feature<GeoJSON.Point, {
    forecast_date_time: string;
    severity: string;
    storm_name: string;
    track_heading: string;
    wind_speed_mph: number;
  }>[] | null;
  population_exposure: {
    households: ExposureObject;
    total: ExposureObject;
    total0_4: ExposureObject;
    total0_14: ExposureObject;
    total5_9: ExposureObject;
    total10_14: ExposureObject;
    total15_19: ExposureObject;
    total15_64: ExposureObject;
    total20_24: ExposureObject;
    total25_29: ExposureObject;
    total30_34: ExposureObject;
    total35_39: ExposureObject;
    total40_44: ExposureObject;
    total45_49: ExposureObject;
    total50_54: ExposureObject;
    total55_59: ExposureObject;
    total60_64: ExposureObject;
    total65_69: ExposureObject;
    total65_Plus: ExposureObject;
    total70_74: ExposureObject;
    total75_79: ExposureObject;
    total80_84: ExposureObject;
    total85_89: ExposureObject;
    total90_94: ExposureObject;
    total95_99: ExposureObject;
    total100AndOver: ExposureObject;
    vulnerable: ExposureObject;
  } | null;
  capital_exposure: {
    hospital: ExposureObject;
    school: ExposureObject;
    total: ExposureObject;
  } | null;
}

export interface GDACSEvent {
  id: number,
  country_details: {
      id: number;
      name: string;
      iso: string;
      iso3: string;
      region: number;
  },
  hazard_type_display: string;
  created_at: string;
  start_date: string;
  end_date: string;
  hazard_id: number;
  hazard_name: string;
  hazard_type: ImminentHazardTypes;
  alert_level: string;
  event_details: {
    url: {
        report: string;
        details: string;
        geometry: string;
    },
    icon: string;
    iso3: string;
    name: string;
    Class: string;
    glide: string;
    todate: string;
    country: string;
    eventid: number;
    fromdate: string;
    episodeid: number;
    eventname: string;
    eventtype: string;
    iscurrent: string;
    alertlevel: string;
    alertscore: number;
    description: string;
    iconoverall: null,
    istemporary: string;
    polygonlabel: string;
    severitydata: {
        severity: number;
        severitytext: string;
        severityunit: string;
    },
    countryonland: string;
    htmldescription: string;
    episodealertlevel: string;
    episodealertscore: number;
  },
  country: number;
  latitude: number;
  longitude: number;
}

export interface GDACSEventExposure{
  footprint_geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, GDACSEvent>;
  capital_exposure: string;
}

export interface ImminentResponse {
  oddrin_data: unknown[];
  pdc_data: PDCEvent[];
}

export interface ADAMEventExposure {
  event_id: string;
  mag: number;
  mmni: number;
  url: {
    map: string;
    shakemap: string;
    population: string;
    wind: string;
    rainfall: string;
    shapefile: string
  }
  iso3: string;
  depth: number;
  place: string;
  title: string;
  latitude: number;
  longitude: number;
  mag_type: string;
  admin1_name: string;
  published_at: string;
  population_impact: number;
  country: number | null;
  alert_sent: boolean;
  alert_level: 'Red' | 'Orange' | 'Green' | 'Cones' | null;
  from_date: string;
  to_date: string;
  wind_speed: number;
  effective_date: string;
  date_processed: string;
  population: number;
  dashboard_url: string;
  flood_area: number;
  fl_croplnd: number;
  source: string;
  sitrep: string;
}

export interface ADAMEvent {
  id: number;
  hazard_type: ImminentHazardTypes;
  hazard_type_display: string;
  event_details: ADAMEventExposure;
  title: string;
  event_id: string;
  publish_date: string;
  country: number | null;
  country_details: {
    id: number;
    iso: string;
    iso3: string;
    name: string;
    region: number;
    regions_details: {
      id: number;
      name_display: string;
      name: number;
    }
  } | null;
  geojson: GeoJSON.Feature<GeoJSON.Point>;

  // TODO: add properties here
  storm_position_geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, {
    track_date: string;
    alert_level: 'Red' | 'Orange' | 'Green' | 'Cones' | null;
  }>;

  population_exposure:{
    "exposure_60km/h": number;
    "exposure_90km/h": number;
    "exposure_120km/h": number;
  }
}
