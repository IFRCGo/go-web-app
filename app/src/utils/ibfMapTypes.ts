// Data types and structures for the IBF map backend and NRW frontend.
// The enums are shared values between the backend and frontend.
// Do not change any values without first checking with the IBF backend team.

export enum HazardType {
  Flood = "flood",
  Drought = "drought",
}

// Enum to identify alert classes
// These then point to the color/style/localized string in the front end.
// A given country may support only a subset of these.
export enum AlertClassType {
  High = "high",
  Medium = "medium",  
  Low = "low",
}

// Units for labelling values in the UI
export enum MeasurementUnits {
  Km = "km",
  Buildings = "buildings",
  People = "people",
  Locations = "locations",
  None = "",
}

// The types of items with exposure data
export enum ExposedItemType {
  Population = "population",
  Buildings = "buildings",
  Roads = "roads",
  Schools = "schools",
  Clinics = "clinics",
}

// Key to identify the type of map layer info being shown.
// This is used to style/label it on the frontend.
export enum MapLayerInfoType {
  Population = "population",
  EventExtent = "event_extent",
  RedCrossBranches = "red_cross_branches",
  Clinics = "clinics",
}

export enum MapLayerDisplayType {
  // Image data, i.e. PNGs
  Raster = "raster",
  // Vector shape data for lines and polygons, including admin areas
  Shape = "shape",
  // Vector point data, such as for glofas locations
  Point = "point",
  // Vector tiles, used for dense vector information such as many buildings and roads
  VectorTile = "vector_tile",
}

// Data for showing exposure of a given ExposedItemType
export interface ExposureCategory {
  type: ExposedItemType;
  exposed: number;
  total: number;
  unit: MeasurementUnits;
}

// Details for a data layer that can be added to a map
export interface MapLayerDetails {
  // ID that can be used to fetch the actual map layer data
  resourceId: string;

  // The type of data on this layer
  // This can be used to label the layer in the UI, style it, etc.
  dataType: MapLayerInfoType;
  
  // The way this data will be displayed
  displayType: MapLayerDisplayType;
}

// Data for an overview of an event
export interface EventOverviewData {
  hazardTypes: HazardType[];

  // Translated, user-facing name for the event
  eventName: string;

  // ID to later reference the event, as well as for making other API calls for related resources
  eventId: string;

  alertClass: AlertClassType;

  // Whether this is a triggering event or not.
  trigger: boolean;

  // affects where we zoom to, and where we place the icon on the map
  // [lon, lat]
  centroid: [number, number];

  // Event time range, as ISO date strings with hours
  startTime: string; 
  endTime: string;
  reachesPeakAlertClassTime: string;

  // Event creation/update times, as ISO date strings
  firstIssuedAt: string;
  lastUpdatedAt: string;

  // List of lists of details for each exposed admin area. The first index is the admin level (0, 1, 2...)
  exposedAdminAreas: EventAdminAreaData[][];

  // Other data layers that can be added to the map for this event
  availableLayers: MapLayerDetails[];

  // sources used for the data (Glofas, etc.)
  dataSources: DataSourceType[];

}

// Sources for the data used in events, map layers, etc.
export enum DataSourceType {
  Glofas = "glofas",
  Other = "other",
}

// Event data specific to an admin area. Each admin area with exposure has one of these.
export interface EventAdminAreaData {
  placeCode: string;
  adminLevel: number;
  name: string;
  exposure: ExposureCategory[];
}

// Data for all events, keyed by event ID
export type AllEventsData = Record<string, EventOverviewData>;

// Country-level non-event data
// This is a work in progress still and will either have more data added to it, or merged into some other source.
export interface CountryMapData {
  // Available map layers for the country that can be added
  availableLayers: MapLayerDetails[];

  // The event data sources for forecasted events.
  // This can differentiate between supported event types as well as MRW/IBF data sources.
  // If this is empty, then the country is not supported for NRW.
  supportedEventDataSources: EventDataSources[];
}

// Supported event data sources for a country.
export enum EventDataSources {
  Ibf = "ibf",
  Mrw = "mrw",
}

// Details needed by the map when an event is selected
// This is derived from EventOverviewData and passed to the map component
export interface SelectedEventMapDetails {
  eventId: string;
  centroid: [number, number];
  // Admin area codes affected by this event, keyed by admin level
  exposedRegionsByLevel: Map<number, string[]>;
}