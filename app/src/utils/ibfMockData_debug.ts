// NOTE: debug file to be moved to seed data repo.

import { AlertClassType, DataSourceType, ExposedItemType, HazardType, MapLayerInfoType, MapLayerDisplayType, MeasurementUnits, type AllEventsData } from './ibfMapTypes';

// Mock data for testing - populations are made up, summed up the hierarchy
export const mockAllEventsData_MW: AllEventsData = {
  event1: {
    hazardTypes: [HazardType.Flood],
    eventName: "Flood - Malawi",
    eventId: "event1",
    alertClass: AlertClassType.Low,
    trigger: false,
    centroid: [33.78, -13.98], // Lilongwe City center
    startTime: "2026-04-01T06:00:00Z",
    reachesPeakAlertClassTime: "2026-04-07T12:00:00Z",
    endTime: "2026-04-12T18:00:00Z",
    availableLayers: [{ resourceId: 'flood_extent_7-hour_MWI', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
    exposedAdminAreas: [
      // ADM0 - Country (sum of all ADM3)
      [
        {
          placeCode: "MW",
          adminLevel: 0,
          name: "Malawi",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15 },
          ],
        },
      ],
      // ADM1 - Region (same sum, all in Central)
      [
        {
          placeCode: "MW2",
          adminLevel: 1,
          name: "Central",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15 },
          ],
        },
      ],
      // ADM2 - District (same sum, all in Lilongwe City)
      [
        {
          placeCode: "MW210",
          adminLevel: 2,
          name: "Lilongwe City",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15 },
          ],
        },
      ],
      // ADM3 - Areas
      [
        {
          placeCode: "MW21046",
          adminLevel: 3,
          name: "Area 16",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 3200, total: 3200 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 400, total: 2000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 5 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2 },
          ],
        },
        {
          placeCode: "MW21043",
          adminLevel: 3,
          name: "Area 13",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8500, total: 8500 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 3000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4 },
          ],
        },
        {
          placeCode: "MW21042",
          adminLevel: 3,
          name: "Area 12",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 12400, total: 12400 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1000, total: 3500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4 },
          ],
        },
        {
          placeCode: "MW21040",
          adminLevel: 3,
          name: "Area 10",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18700, total: 18700 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 2500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 7 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3 },
          ],
        },
        {
          placeCode: "MW21031",
          adminLevel: 3,
          name: "Area 1",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 5600, total: 5600 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 300, total: 1000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 4 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2 },
          ],
        },
      ],
    ],
    dataSources: [DataSourceType.Glofas, DataSourceType.Other],
    firstIssuedAt: "2026-04-01T08:30:00Z",
    lastUpdatedAt: "2026-04-02T00:00:00Z",
  },
  event2: {
    hazardTypes: [HazardType.Flood],
    eventName: "Flood - Malawi",
    eventId: "event2",
    alertClass: AlertClassType.High,
    trigger: true,
    centroid: [35.32, -15.38], // Zomba center
    startTime: "2026-04-06T12:00:00Z",
    reachesPeakAlertClassTime: "2026-04-08T18:00:00Z",
    endTime: "2026-04-11T09:00:00Z",
    availableLayers: [{ resourceId: 'flood_extent_7-hour_MWI', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
    exposedAdminAreas: [
      // ADM0 - Country (sum of all ADM3)
      [
        {
          placeCode: "MW",
          adminLevel: 0,
          name: "Malawi",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22 },
          ],
        },
      ],
      // ADM1 - Region (same sum, all in Southern)
      [
        {
          placeCode: "MW3",
          adminLevel: 1,
          name: "Southern",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22 },
          ],
        },
      ],
      // ADM2 - District (same sum, all in Zomba)
      [
        {
          placeCode: "MW303",
          adminLevel: 2,
          name: "Zomba",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22 },
          ],
        },
      ],
      // ADM3 - Traditional Authorities
      [
        {
          placeCode: "MW30303",
          adminLevel: 3,
          name: "SC Mkumbira",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 2100, total: 2100 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 2500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4 },
          ],
        },
        {
          placeCode: "MW30302",
          adminLevel: 3,
          name: "TA Mwambo",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 15800, total: 15800 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2000, total: 5000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 15 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 7 },
          ],
        },
        {
          placeCode: "MW30306",
          adminLevel: 3,
          name: "TA Mlumbe",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 19500, total: 19500 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2100, total: 5500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 6, total: 17 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 8 },
          ],
        },
        {
          placeCode: "MW30301",
          adminLevel: 3,
          name: "TA Kuntumanji",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 7200, total: 7200 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 2000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3 },
          ],
        },
      ],
    ],
    dataSources: [DataSourceType.Glofas, DataSourceType.Other],
    firstIssuedAt: "2026-04-01T14:15:00Z",
    lastUpdatedAt: "2026-04-02T00:00:00Z",
  },
  event3: {
    hazardTypes: [HazardType.Flood],
    eventName: "Flood - Malawi",
    eventId: "event3",
    alertClass: AlertClassType.Medium,
    trigger: false,
    centroid: [34.5, -14.5], // Between Lilongwe and Zomba
    startTime: "2026-04-08T15:00:00Z",
    reachesPeakAlertClassTime: "2026-04-10T06:00:00Z",
    endTime: "2026-04-11T21:00:00Z",
    availableLayers: [],
    exposedAdminAreas: [
      // ADM0 - Country (sum of all ADM3)
      [
        {
          placeCode: "MW",
          adminLevel: 0,
          name: "Malawi",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 29600, total: 29600 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2100, total: 10500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 28 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 12 },
          ],
        },
      ],
      // ADM1 - Regions (Central: 11700, Southern: 17900)
      [
        {
          placeCode: "MW2",
          adminLevel: 1,
          name: "Central",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 11700, total: 11700 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1000, total: 5500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 14 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 6 },
          ],
        },
        {
          placeCode: "MW3",
          adminLevel: 1,
          name: "Southern",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 17900, total: 17900 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1100, total: 5000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 14 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 6 },
          ],
        },
      ],
      // ADM2 - Districts (Lilongwe City: 11700, Zomba: 17900)
      [
        {
          placeCode: "MW210",
          adminLevel: 2,
          name: "Lilongwe City",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 11700, total: 11700 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1000, total: 5500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 14 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 6 },
          ],
        },
        {
          placeCode: "MW303",
          adminLevel: 2,
          name: "Zomba",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 17900, total: 17900 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1100, total: 5000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 14 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 6 },
          ],
        },
      ],
      // ADM3 - Combined from event1 and event2
      [
        {
          placeCode: "MW21046",
          adminLevel: 3,
          name: "Area 16",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 3200, total: 3200 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 400, total: 2500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 6 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 3 },
          ],
        },
        {
          placeCode: "MW21043",
          adminLevel: 3,
          name: "Area 13",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8500, total: 8500 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 600, total: 3000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3 },
          ],
        },
        {
          placeCode: "MW30303",
          adminLevel: 3,
          name: "SC Mkumbira",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 2100, total: 2100 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 300, total: 1500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 4 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2 },
          ],
        },
        {
          placeCode: "MW30302",
          adminLevel: 3,
          name: "TA Mwambo",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 15800, total: 15800 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 3500 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 10 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4 },
          ],
        },
      ],
    ],
    dataSources: [DataSourceType.Glofas, DataSourceType.Other],
    firstIssuedAt: "2026-04-01T19:45:00Z",
    lastUpdatedAt: "2026-04-02T00:00:00Z",
  },
};

// Mock data for Zambia testing
export const mockAllEventsData_ZM: AllEventsData = {
  event1: {
    hazardTypes: [HazardType.Flood],
    eventName: "Flood - Zambia",
    eventId: "event1",
    alertClass: AlertClassType.Low,
    trigger: false,
    centroid: [24.8, -13.68], // Mufumbwe center
    startTime: "2026-04-05T08:00:00Z",
    reachesPeakAlertClassTime: "2026-04-07T20:00:00Z",
    endTime: "2026-04-10T14:00:00Z",
    availableLayers: [{ resourceId: 'flood_map_ZMB_RP20_c0_b3857', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
    exposedAdminAreas: [
      // ADM0 - Country (sum of all ADM3)
      [
        {
          placeCode: "ZM",
          adminLevel: 0,
          name: "Zambia",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8 },
          ],
        },
      ],
      // ADM1 - Province
      [
        {
          placeCode: "ZM70",
          adminLevel: 1,
          name: "Northwestern",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8 },
          ],
        },
      ],
      // ADM2 - District
      [
        {
          placeCode: "ZM7004",
          adminLevel: 2,
          name: "Mufumbwe",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8 },
          ],
        },
      ],
      // ADM3 - Wards
      [
        {
          placeCode: "080510707",
          adminLevel: 3,
          name: "Shukwe",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 4200, total: 4200 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 5000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 8 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 4 },
          ],
        },
        {
          placeCode: "080510705",
          adminLevel: 3,
          name: "Kalambu",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8900, total: 8900 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1100, total: 6000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 10 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4 },
          ],
        },
      ],
    ],
    dataSources: [DataSourceType.Glofas, DataSourceType.Other],
    firstIssuedAt: "2026-04-01T10:00:00Z",
    lastUpdatedAt: "2026-04-02T00:00:00Z",
  },
  event2: {
    hazardTypes: [HazardType.Flood],
    eventName: "Flood - Zambia",
    eventId: "event2",
    alertClass: AlertClassType.Medium,
    trigger: true,
    centroid: [24.8, -13.68], // Mufumbwe center
    startTime: "2026-04-07T10:00:00Z",
    reachesPeakAlertClassTime: "2026-04-10T08:00:00Z",
    endTime: "2026-04-13T16:00:00Z",
    availableLayers: [{ resourceId: 'flood_map_ZMB_RP20_c0_b3857', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
    exposedAdminAreas: [
      // ADM0 - Country (sum of all ADM3)
      [
        {
          placeCode: "ZM",
          adminLevel: 0,
          name: "Zambia",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14 },
          ],
        },
      ],
      // ADM1 - Province
      [
        {
          placeCode: "ZM70",
          adminLevel: 1,
          name: "Northwestern",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14 },
          ],
        },
      ],
      // ADM2 - District
      [
        {
          placeCode: "ZM7004",
          adminLevel: 2,
          name: "Mufumbwe",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14 },
          ],
        },
      ],
      // ADM3 - Wards
      [
        {
          placeCode: "080510701",
          adminLevel: 3,
          name: "Kashima West",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 12500, total: 12500 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3000, total: 12000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 16 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 9 },
          ],
        },
        {
          placeCode: "080510702",
          adminLevel: 3,
          name: "Kashima East",
          exposure: [
            { unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 6300, total: 6300 },
            { unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1500, total: 6000 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 9 },
            { unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 5 },
          ],
        },
      ],
    ],
    dataSources: [DataSourceType.Glofas, DataSourceType.Other],
    firstIssuedAt: "2026-04-01T16:30:00Z",
    lastUpdatedAt: "2026-04-02T00:00:00Z",
  },
};
