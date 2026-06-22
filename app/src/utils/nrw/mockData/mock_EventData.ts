/* eslint-disable max-len */

import {
    AlertClassType,
    DataSourceType,
    type EventOverviewData,
    ExposedItemType,
    MapLayerDisplayType,
    MapLayerInfoType,
    MeasurementUnits,
} from '../nrwMapTypes';
import { HazardType } from '../shared-enums';

// Mock data for testing - populations are made up, summed up the hierarchy
export const mockAllEventsData_MW: EventOverviewData[] = [
    {
        hazardTypes: [HazardType.floods],
        eventName: 'Flood - Malawi',
        eventId: 9900099,
        alertClass: AlertClassType.Medium,
        trigger: false,
        centroid: [34.0, -12.5],
        startTime: '2026-06-20T06:00:00Z',
        reachesPeakAlertClassTime: '2026-06-23T06:00:00Z',
        endTime: '2026-06-26T06:00:00Z',
        availableLayers: [{ resourceId: 'flood_extent_7-hour_MWI', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
        exposedAdminAreas: [
            // ADM0 - Country (sum of all ADM3: 51407 + 45300 = 96707)
            [
                {
                    placeCode: 'MWI',
                    adminLevel: 0,
                    name: 'Malawi',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 96707, total: 96707,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 6900, total: 25500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 17, total: 69,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 8, total: 32,
                        },
                    ],
                },
            ],
            // ADM1 - Areas (MW1: 51407, MW2: 45300)
            [
                {
                    placeCode: 'MW1',
                    adminLevel: 1,
                    name: 'Northern',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 51407, total: 51407,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3800, total: 14000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 9, total: 37,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 5, total: 18,
                        },
                    ],
                },
                {
                    placeCode: 'MW2',
                    adminLevel: 1,
                    name: 'Central',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 45300, total: 45300,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3100, total: 11000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 14,
                        },
                    ],
                },
            ],
            // ADM2 - Districts (MW105: 37307, MW103: 14100, MW201: 25900, MW202: 19400)
            [
                {
                    placeCode: 'MW105',
                    adminLevel: 2,
                    name: 'Karonga',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 37307, total: 37307,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2200, total: 8500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 6, total: 21,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 10,
                        },
                    ],
                },
                {
                    placeCode: 'MW103',
                    adminLevel: 2,
                    name: 'Nkhata Bay',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 14100, total: 14100,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1600, total: 5500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 16,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 8,
                        },
                    ],
                },
                {
                    placeCode: 'MW201',
                    adminLevel: 2,
                    name: 'Kasungu',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 25900, total: 25900,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1900, total: 6500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 18,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 8,
                        },
                    ],
                },
                {
                    placeCode: 'MW202',
                    adminLevel: 2,
                    name: 'Nkhotakota',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 19400, total: 19400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1200, total: 5000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 14,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 6,
                        },
                    ],
                },
            ],
            // ADM3 - Areas
            [
                {
                    placeCode: 'MW10506',
                    adminLevel: 3,
                    name: 'TA Kilupula',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 2300, total: 2300,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 200, total: 1500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 4,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
                {
                    placeCode: 'MW10508',
                    adminLevel: 3,
                    name: 'TA Wasambo',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 12884, total: 12884,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 3000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 7,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3,
                        },
                    ],
                },
                {
                    placeCode: 'MW10507',
                    adminLevel: 3,
                    name: 'TA Mwirang\'ombe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 22123, total: 22123,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1200, total: 4000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 10,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 5,
                        },
                    ],
                },
                {
                    placeCode: 'MW10305',
                    adminLevel: 3,
                    name: 'TA Fukamapiri',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8400, total: 8400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 900, total: 3000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 6,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3,
                        },
                    ],
                },
                {
                    placeCode: 'MW10301',
                    adminLevel: 3,
                    name: 'TA Mkumbira',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 1500, total: 1500,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 300, total: 1200,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 5,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
                {
                    placeCode: 'MW10302',
                    adminLevel: 3,
                    name: 'TA Timbiri',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 4200, total: 4200,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 400, total: 1300,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 5,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3,
                        },
                    ],
                },
                {
                    placeCode: 'MW20202',
                    adminLevel: 3,
                    name: 'TA Malenga Chanzi',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 15600, total: 15600,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 3000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4,
                        },
                    ],
                },
                {
                    placeCode: 'MW20201',
                    adminLevel: 3,
                    name: 'TA Mwadzama',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 3800, total: 3800,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 500, total: 2000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 6,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
                {
                    placeCode: 'MW20102',
                    adminLevel: 3,
                    name: 'TA Kaomba',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 25000, total: 25000,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1500, total: 4500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 4, total: 12,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 6,
                        },
                    ],
                },
                {
                    placeCode: 'MW20112',
                    adminLevel: 3,
                    name: 'TA Wimbe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 900, total: 900,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 400, total: 2000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 6,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
            ],
        ],
        dataSources: [DataSourceType.Glofas, DataSourceType.Other],
        firstIssuedAt: '2026-06-19T08:00:00Z',
        lastUpdatedAt: '2026-06-19T12:00:00Z',
    },
    {
        hazardTypes: [HazardType.floods],
        eventName: 'Flood - Malawi',
        eventId: 1001,
        alertClass: AlertClassType.Low,
        trigger: false,
        centroid: [33.78, -13.98], // Lilongwe City center
        startTime: '2026-04-01T06:00:00Z',
        reachesPeakAlertClassTime: '2026-04-07T12:00:00Z',
        endTime: '2026-04-12T18:00:00Z',
        availableLayers: [{ resourceId: 'flood_extent_7-hour_MWI', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
        exposedAdminAreas: [
            // ADM0 - Country (sum of all ADM3)
            [
                {
                    placeCode: 'MWI',
                    adminLevel: 0,
                    name: 'Malawi',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15,
                        },
                    ],
                },
            ],
            // ADM1 - Area (same sum, all in Central)
            [
                {
                    placeCode: 'MW2',
                    adminLevel: 1,
                    name: 'Central',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15,
                        },
                    ],
                },
            ],
            // ADM2 - District (same sum, all in Lilongwe City)
            [
                {
                    placeCode: 'MW210',
                    adminLevel: 2,
                    name: 'Lilongwe City',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 48400, total: 48400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3200, total: 12000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 8, total: 32,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 15,
                        },
                    ],
                },
            ],
            // ADM3 - Areas
            [
                {
                    placeCode: 'MW21046',
                    adminLevel: 3,
                    name: 'Area 16',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 3200, total: 3200,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 400, total: 2000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 5,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
                {
                    placeCode: 'MW21043',
                    adminLevel: 3,
                    name: 'Area 13',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8500, total: 8500,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 3000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4,
                        },
                    ],
                },
                {
                    placeCode: 'MW21042',
                    adminLevel: 3,
                    name: 'Area 12',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 12400, total: 12400,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1000, total: 3500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4,
                        },
                    ],
                },
                {
                    placeCode: 'MW21040',
                    adminLevel: 3,
                    name: 'Area 10',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18700, total: 18700,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 2500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 7,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3,
                        },
                    ],
                },
                {
                    placeCode: 'MW21031',
                    adminLevel: 3,
                    name: 'Area 1',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 5600, total: 5600,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 300, total: 1000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 4,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 2,
                        },
                    ],
                },
            ],
        ],
        dataSources: [DataSourceType.Glofas, DataSourceType.Other],
        firstIssuedAt: '2026-04-01T08:30:00Z',
        lastUpdatedAt: '2026-04-02T00:00:00Z',
    },
    {
        hazardTypes: [HazardType.floods],
        eventName: 'Flood - Malawi',
        eventId: 1002,
        alertClass: AlertClassType.High,
        trigger: true,
        centroid: [35.32, -15.38], // Zomba center
        startTime: '2026-04-06T12:00:00Z',
        reachesPeakAlertClassTime: '2026-04-08T18:00:00Z',
        endTime: '2026-04-11T09:00:00Z',
        availableLayers: [{ resourceId: 'flood_extent_7-hour_MWI', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
        exposedAdminAreas: [
            // ADM0 - Country (sum of all ADM3)
            [
                {
                    placeCode: 'MWI',
                    adminLevel: 0,
                    name: 'Malawi',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22,
                        },
                    ],
                },
            ],
            // ADM1 - Area (same sum, all in Southern)
            [
                {
                    placeCode: 'MW3',
                    adminLevel: 1,
                    name: 'Southern',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22,
                        },
                    ],
                },
            ],
            // ADM2 - District (same sum, all in Zomba)
            [
                {
                    placeCode: 'MW303',
                    adminLevel: 2,
                    name: 'Zomba',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 44600, total: 44600,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 5600, total: 15000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 15, total: 48,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 6, total: 22,
                        },
                    ],
                },
            ],
            // ADM3 - Traditional Authorities
            [
                {
                    placeCode: 'MW30303',
                    adminLevel: 3,
                    name: 'SC Mkumbira',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 2100, total: 2100,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 2500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4,
                        },
                    ],
                },
                {
                    placeCode: 'MW30302',
                    adminLevel: 3,
                    name: 'TA Mwambo',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 15800, total: 15800,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2000, total: 5000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 15,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 7,
                        },
                    ],
                },
                {
                    placeCode: 'MW30306',
                    adminLevel: 3,
                    name: 'TA Mlumbe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 19500, total: 19500,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 2100, total: 5500,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 6, total: 17,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 2, total: 8,
                        },
                    ],
                },
                {
                    placeCode: 'MW30301',
                    adminLevel: 3,
                    name: 'TA Kuntumanji',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 7200, total: 7200,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 800, total: 2000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 3,
                        },
                    ],
                },
            ],
        ],
        dataSources: [DataSourceType.Glofas, DataSourceType.Other],
        firstIssuedAt: '2026-04-01T14:15:00Z',
        lastUpdatedAt: '2026-04-02T00:00:00Z',
    },
];

// Mock data for Zambia testing
export const mockAllEventsData_ZM: EventOverviewData[] = [
    {
        hazardTypes: [HazardType.floods],
        eventName: 'Flood - Zambia',
        eventId: 2001,
        alertClass: AlertClassType.Low,
        trigger: false,
        centroid: [24.8, -13.68], // Mufumbwe center
        startTime: '2026-04-05T08:00:00Z',
        reachesPeakAlertClassTime: '2026-04-07T20:00:00Z',
        endTime: '2026-04-10T14:00:00Z',
        availableLayers: [{ resourceId: 'flood_map_ZMB_RP20_c0_b3857', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
        exposedAdminAreas: [
            // ADM0 - Country (sum of all ADM3)
            [
                {
                    placeCode: 'ZMB',
                    adminLevel: 0,
                    name: 'Zambia',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8,
                        },
                    ],
                },
            ],
            // ADM1 - Province
            [
                {
                    placeCode: 'ZM70',
                    adminLevel: 1,
                    name: 'Northwestern',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8,
                        },
                    ],
                },
            ],
            // ADM2 - District
            [
                {
                    placeCode: 'ZM7004',
                    adminLevel: 2,
                    name: 'Mufumbwe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 13100, total: 13100,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1800, total: 11000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 3, total: 18,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 8,
                        },
                    ],
                },
            ],
            // ADM3 - Wards
            [
                {
                    placeCode: '080510707',
                    adminLevel: 3,
                    name: 'Shukwe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 4200, total: 4200,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 700, total: 5000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 1, total: 8,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 0, total: 4,
                        },
                    ],
                },
                {
                    placeCode: '080510705',
                    adminLevel: 3,
                    name: 'Kalambu',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 8900, total: 8900,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1100, total: 6000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 10,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 4,
                        },
                    ],
                },
            ],
        ],
        dataSources: [DataSourceType.Glofas, DataSourceType.Other],
        firstIssuedAt: '2026-04-01T10:00:00Z',
        lastUpdatedAt: '2026-04-02T00:00:00Z',
    },
    {
        hazardTypes: [HazardType.floods],
        eventName: 'Flood - Zambia',
        eventId: 2002,
        alertClass: AlertClassType.Medium,
        trigger: true,
        centroid: [24.8, -13.68], // Mufumbwe center
        startTime: '2026-04-07T10:00:00Z',
        reachesPeakAlertClassTime: '2026-04-10T08:00:00Z',
        endTime: '2026-04-13T16:00:00Z',
        availableLayers: [{ resourceId: 'flood_map_ZMB_RP20_c0_b3857', dataType: MapLayerInfoType.EventExtent, displayType: MapLayerDisplayType.Raster }],
        exposedAdminAreas: [
            // ADM0 - Country (sum of all ADM3)
            [
                {
                    placeCode: 'ZMB',
                    adminLevel: 0,
                    name: 'Zambia',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14,
                        },
                    ],
                },
            ],
            // ADM1 - Province
            [
                {
                    placeCode: 'ZM70',
                    adminLevel: 1,
                    name: 'Northwestern',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14,
                        },
                    ],
                },
            ],
            // ADM2 - District
            [
                {
                    placeCode: 'ZM7004',
                    adminLevel: 2,
                    name: 'Mufumbwe',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 18800, total: 18800,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 4500, total: 18000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 7, total: 25,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 4, total: 14,
                        },
                    ],
                },
            ],
            // ADM3 - Wards
            [
                {
                    placeCode: '080510701',
                    adminLevel: 3,
                    name: 'Kashima West',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 12500, total: 12500,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 3000, total: 12000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 5, total: 16,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 3, total: 9,
                        },
                    ],
                },
                {
                    placeCode: '080510702',
                    adminLevel: 3,
                    name: 'Kashima East',
                    exposure: [
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Population, exposed: 6300, total: 6300,
                        },
                        {
                            unit: MeasurementUnits.Km, type: ExposedItemType.Roads, exposed: 1500, total: 6000,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Schools, exposed: 2, total: 9,
                        },
                        {
                            unit: MeasurementUnits.None, type: ExposedItemType.Clinics, exposed: 1, total: 5,
                        },
                    ],
                },
            ],
        ],
        dataSources: [DataSourceType.Glofas, DataSourceType.Other],
        firstIssuedAt: '2026-04-01T16:30:00Z',
        lastUpdatedAt: '2026-04-02T00:00:00Z',
    },
];
