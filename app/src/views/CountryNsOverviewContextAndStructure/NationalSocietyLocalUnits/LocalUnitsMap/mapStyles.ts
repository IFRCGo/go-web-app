import {
    isDefined,
    mapToList,
} from '@togglecorp/fujs';
import type {
    CirclePaint,
    Layout,
    SymbolLayout,
} from 'mapbox-gl';

import adminIcon from '#assets/icons/healthcare/admin.png';
import specializedServicesIcon from '#assets/icons/healthcare/clinic.png';
import primaryHealthCareIcon from '#assets/icons/healthcare/doctor.png';
import emergencyIcon from '#assets/icons/healthcare/emergency_response.png';
import bloodCenterIcon from '#assets/icons/healthcare/health-post.png';
import healthcareIcon from '#assets/icons/healthcare/healthcare.png';
import hospitalIcon from '#assets/icons/healthcare/hospital.png';
import residentialFacilityIcon from '#assets/icons/healthcare/house.png';
import humAssistanceIcon from '#assets/icons/healthcare/hum_assistance_centres.png';
import otherIcon from '#assets/icons/healthcare/life-saving.png';
import pharmacyIcon from '#assets/icons/healthcare/medicine.png';
import ambulanceIcon from '#assets/icons/healthcare/mobile-clinic.png';
import otherLocalUnitIcon from '#assets/icons/healthcare/other.png';
import trainingFacilityIcon from '#assets/icons/healthcare/training.png';
import {
    COLOR_BLUE,
    COLOR_DARK_GREY,
    COLOR_DARK_RED,
    COLOR_ORANGE,
    COLOR_PRIMARY_BLUE,
    COLOR_RED,
    COLOR_WHITE,
    COLOR_YELLOW,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
} from '#utils/constants';

import {
    TYPE_ADMINISTRATIVE,
    TYPE_EMERGENCY_RESPONSE,
    TYPE_HEALTH_AMBULANCE,
    TYPE_HEALTH_BLOOD_CENTER,
    TYPE_HEALTH_HOSPITAL,
    TYPE_HEALTH_OTHERS,
    TYPE_HEALTH_PHARMACY,
    TYPE_HEALTH_PHC_CENTER,
    TYPE_HEALTH_RESIDENTIAL,
    TYPE_HEALTH_SPECIAL_SERVICES,
    TYPE_HEALTH_TRAINING,
    TYPE_HEALTHCARE,
    TYPE_HUMANITARIAN,
    TYPE_OTHER,
    TYPE_TRAINING,
} from '../common';

type HealthFacilityType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 ;
type LocalUnitType = 1 | 2 | 3 | 4 | 5 | 6;

export const invisibleLayout: Layout = {
    visibility: 'none',
};

export const healthFacilityKeyToIconMap: Record<HealthFacilityType, string> = {
    1: ambulanceIcon,
    2: bloodCenterIcon,
    3: hospitalIcon,
    4: pharmacyIcon,
    5: primaryHealthCareIcon,
    6: residentialFacilityIcon,
    7: trainingFacilityIcon,
    8: specializedServicesIcon,
    9: otherIcon,
};

export const localUnitTypeKeyToIconMap: Record<LocalUnitType, string> = {
    1: adminIcon,
    2: healthcareIcon,
    3: emergencyIcon,
    4: humAssistanceIcon,
    5: trainingFacilityIcon,
    6: otherLocalUnitIcon,
};

// eslint-disable-next-line max-len
export const localUnitIconKeys = Object.keys(localUnitTypeKeyToIconMap) as unknown as LocalUnitType[];

export const localUnitMapIcons = mapToList(
    localUnitTypeKeyToIconMap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

const localUnitIconImage: SymbolLayout['icon-image'] = [
    'match',
    ['get', 'healthFacilityType'],
    ...(localUnitMapIcons).flatMap(({ key }) => [Number(key), key]),
    '6',
];

// eslint-disable-next-line max-len
export const healthFacilityKeys = Object.keys(healthFacilityKeyToIconMap) as unknown as HealthFacilityType[];

export const mapIcons = mapToList(
    healthFacilityKeyToIconMap,
    (icon, key) => (icon ? ({ key, icon }) : undefined),
).filter(isDefined);

const iconImage: SymbolLayout['icon-image'] = [
    'match',
    ['get', 'healthFacilityType'],
    ...(mapIcons).flatMap(({ key }) => [Number(key), key]),
    '9',
];

const circleColor: CirclePaint['circle-color'] = [
    'match',
    ['get', 'type'],
    TYPE_ADMINISTRATIVE,
    COLOR_RED,
    TYPE_HEALTHCARE,
    COLOR_ORANGE,
    TYPE_EMERGENCY_RESPONSE,
    COLOR_BLUE,
    TYPE_HUMANITARIAN,
    COLOR_YELLOW,
    TYPE_TRAINING,
    COLOR_PRIMARY_BLUE,
    TYPE_OTHER,
    COLOR_DARK_RED,
    COLOR_DARK_GREY,
];

const healthFacilityCircleColor: CirclePaint['circle-color'] = [
    'match',
    ['get', 'healthFacilityType'],
    TYPE_HEALTH_AMBULANCE,
    COLOR_RED,
    TYPE_HEALTH_HOSPITAL,
    COLOR_ORANGE,
    TYPE_HEALTH_PHC_CENTER,
    COLOR_BLUE,
    TYPE_HEALTH_TRAINING,
    COLOR_YELLOW,
    TYPE_HEALTH_RESIDENTIAL,
    COLOR_PRIMARY_BLUE,
    TYPE_HEALTH_OTHERS,
    COLOR_DARK_RED,
    COLOR_DARK_GREY,
];

export const basePointPaint: CirclePaint = {
    'circle-radius': 24,
    'circle-color': circleColor,
    'circle-opacity': 0.6,
    'circle-stroke-color': circleColor,
    'circle-stroke-width': 1,
    'circle-stroke-opacity': 1,
};

export const healthFacilityBasePointPaint: CirclePaint = {
    'circle-radius': 10,
    'circle-color': healthFacilityCircleColor,
    'circle-opacity': 0.6,
    'circle-stroke-color': healthFacilityCircleColor,
    'circle-stroke-width': 1,
    'circle-stroke-opacity': 1,
};

export const healthCarePointIconLayout: SymbolLayout = {
    visibility: 'visible',
    'icon-image': iconImage,
    'icon-size': 0.15,
    'icon-allow-overlap': false,
};

export const localUnitPointIconLayout: SymbolLayout = {
    visibility: 'visible',
    'icon-image': localUnitIconImage,
    'icon-size': 0.15,
    'icon-allow-overlap': false,
};
