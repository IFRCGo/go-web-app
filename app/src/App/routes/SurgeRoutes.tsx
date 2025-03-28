import {
    Navigate,
    Outlet,
    useParams,
} from 'react-router-dom';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import type { MyOutputNonIndexRouteObject } from '#utils/routes';

import Auth from '../Auth';
import {
    customWrapRoute,
    type ExtendedProps,
    rootLayout,
} from './common';

type DefaultSurgeChild = 'active-surge-deployments';
const surgeLayout = customWrapRoute({
    parent: rootLayout,
    path: 'surge',
    forwardPath: 'active-surge-deployments' satisfies DefaultSurgeChild,
    component: {
        render: () => import('#views/Surge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge',
        visibility: 'anything',
    },
});

const surgeIndex = customWrapRoute({
    parent: surgeLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'active-surge-deployments' satisfies DefaultSurgeChild,
            replace: true,
        },
    },
    context: {
        title: 'Surge',
        visibility: 'anything',
    },
});

const activeSurgeDeployments = customWrapRoute({
    parent: surgeLayout,
    path: 'active-surge-deployments',
    component: {
        render: () => import('#views/ActiveSurgeDeployments'),
        props: {},
    },
    context: {
        title: 'Active Surge Deployments',
        visibility: 'anything',
    },
});

type DefaultSurgeOverviewChild = 'rapid-response-personnel';

const surgeOverviewLayout = customWrapRoute({
    parent: surgeLayout,
    path: 'overview',
    forwardPath: 'rapid-response-personnel' satisfies DefaultSurgeOverviewChild,
    component: {
        render: () => import('#views/SurgeOverview'),
        props: {},
    },
    context: {
        title: 'Surge Overview',
        visibility: 'anything',
    },
});

const surgeOverviewIndex = customWrapRoute({
    parent: surgeOverviewLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'rapid-response-personnel' satisfies DefaultSurgeOverviewChild,
            replace: true,
        },
    },
    context: {
        title: 'Surge Overview',
        visibility: 'anything',
    },
});

const rapidResponsePersonnel = customWrapRoute({
    parent: surgeOverviewLayout,
    path: 'rapid-response-personnel',
    component: {
        render: () => import('#views/SurgeOverview/RapidResponsePersonnel'),
        props: {},
    },
    context: {
        title: 'Rapid Response Personnel',
        visibility: 'anything',
    },
});

const emergencyResponseUnit = customWrapRoute({
    parent: surgeOverviewLayout,
    path: 'emergency-response-unit',
    component: {
        render: () => import('#views/SurgeOverview/EmergencyResponseUnit'),
        props: {},
    },
    context: {
        title: 'Emergency Response Unit',
        visibility: 'anything',
    },
});

const eruReadinessForm = customWrapRoute({
    parent: rootLayout,
    path: 'eru-readiness',
    component: {
        render: () => import('#views/EruReadinessForm'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Readiness Update Form',
        visibility: 'is-authenticated',
        permissions: ({
            isRegionalOrCountryAdmin,
            isSuperUser,
        }) => isSuperUser || isRegionalOrCountryAdmin,
    },
});

const surgeOperationalToolbox = customWrapRoute({
    parent: surgeLayout,
    path: 'operational-toolbox',
    component: {
        render: () => import('#views/SurgeOperationalToolbox'),
        props: {},
    },
    context: {
        title: 'Surge Operational Toolbox',
        visibility: 'anything',
    },
});

type DefaultSurgeCatalogueChild = 'overview';
const surgeCatalogueLayout = customWrapRoute({
    parent: surgeLayout,
    path: 'catalogue',
    forwardPath: 'overview' satisfies DefaultSurgeCatalogueChild,
    component: {
        render: () => import('#views/SurgeCatalogue'),
        props: {},
    },
    context: {
        title: 'Surge Catalogue',
        visibility: 'anything',
    },
});

const catalogueIndex = customWrapRoute({
    parent: surgeCatalogueLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: 'overview' satisfies DefaultSurgeCatalogueChild,
            replace: true,
        },
    },
    context: {
        title: 'Surge Catalogue',
        visibility: 'anything',
    },
});

const surgeCatalogueOverview = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'overview' satisfies DefaultSurgeCatalogueChild,
    component: {
        render: () => import('#views/SurgeCatalogueOverview'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge Catalogue Overview',
        visibility: 'anything',
    },
});

const surgeCatalogueEmergencyNeedsAssessment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency-needs-assessment',
    component: {
        render: () => import('#views/SurgeCatalogueEmergencyNeedsAssessment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Needs Assessment',
        visibility: 'anything',
    },
});

const surgeCatalogueEmergencyNeedsAssessmentCell = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'emergency-needs-assessment/cell',
    component: {
        render: () => import('#views/SurgeCatalogueEmergencyNeedsAssessmentCell'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Assessment Cell',
        visibility: 'anything',
    },
});

const surgeCatalogueAdministration = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'administration',
    component: {
        render: () => import('#views/SurgeCatalogueAdministration'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Administration',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecamp = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp',
    component: {
        render: () => import('#views/SurgeCatalogueBasecamp'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Catalogue',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruSmall = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-small',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruSmall'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Small',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruMedium = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-medium',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruMedium'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Medium',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampEruLarge = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/eru-large',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampEruLarge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp ERU Large',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampFacilityManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/facility-management',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampFacilityManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Facility Management',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampOffice = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/office',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampOffice'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Office',
        visibility: 'anything',
    },
});

const surgeCatalogueBasecampWelcome = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'basecamp/welcome',
    component: {
        render: () => import('#views/SurgeCatalogueBasecampWelcome'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Basecamp Admin and Welcome Service',
        visibility: 'anything',
    },
});

const surgeCatalogueCash = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash',
    component: {
        render: () => import('#views/SurgeCatalogueCash'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance',
        visibility: 'anything',
    },
});

const surgeCatalogueCashRapidResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'cash/rapid-response',
    component: {
        render: () => import('#views/SurgeCatalogueCashRapidResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Cash and Vouchers Assistance - Rapid Response',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunityEngagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community-engagement',
    component: {
        render: () => import('#views/SurgeCatalogueCommunityEngagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA)',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunityEngagementRapidResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'community/rapid-response',
    component: {
        render: () => import('#views/SurgeCatalogueCommunityEngagementRapidResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Engagement and Accountability (CEA) - Rapid Response',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunication = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication',
    component: {
        render: () => import('#views/SurgeCatalogueCommunication'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtOne = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-1',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtOne'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 1',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtTwo = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-2',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtTwo'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 2',
        visibility: 'anything',
    },
});

const surgeCatalogueCommunicationErtThree = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'communication/cert-3',
    component: {
        render: () => import('#views/SurgeCatalogueCommunicationErtThree'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Communication Emergency Response Tool 3',
        visibility: 'anything',
    },
});

const surgeCatalogueHealth = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health',
    component: {
        render: () => import('#views/SurgeCatalogueHealth'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruHospital = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-hospital',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruHospital'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'ERU Red Cross Red Crescent Emergency Hospital',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruSurgical = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-surgical',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruSurgical'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Health Surgical',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthMaternalNewbornClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/maternal-newborn-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthMaternalNewbornClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Maternal NewBorn Health Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEmergencyClinic = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/emergency-clinic',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEmergencyClinic'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Mobile Clinic',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruCholeraTreatment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-cholera-treatment',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruCholeraTreatment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Cholera Treatment Center',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityCaseManagementCholera = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-case-management-cholera',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityCaseManagementCholera'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Cholera',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityBasedSurveillance = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-based-surveillance',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityBasedSurveillance'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Based Surveillance',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthSafeDignifiedBurials = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/safe-dignified-burials',
    component: {
        render: () => import('#views/SurgeCatalogueHealthSafeDignifiedBurials'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Safe and Dignified Burials',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthInfectionPreventionAndControl = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/infection-prevention-and-control',
    component: {
        render: () => import('#views/SurgeCatalogueHealthInfectionPreventionAndControl'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Infection Prevention and Control',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthCommunityManagementMalnutrition = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/community-management-malnutrition',
    component: {
        render: () => import('#views/SurgeCatalogueHealthCommunityManagementMalnutrition'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Community Case Management of Malnutrition',
        visibility: 'anything',
    },
});

const surgeCatalogueHealthEruPsychosocialSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'health/eru-psychosocial-support',
    component: {
        render: () => import('#views/SurgeCatalogueHealthEruPsychosocialSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit Psychosocial Support',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management',
        visibility: 'anything',
    },

});

const surgeCatalogueInformationManagementSatelliteImagery = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/satellite-imagery',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementSatelliteImagery'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Satellite Imagery',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementRolesResponsibility = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/roles-responsibility',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementRolesResponsibility'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Roles and Responsibilities',
        visibility: 'anything',
    },
});

// TODO: update view name
const surgeCatalogueInformationManagementRegionalOfficeSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/regional-office-support',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support - Regional Office',
        visibility: 'anything',
    },
});

// TODO: update view name
const surgeCatalogueInformationManagementGenevaSupport = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/geneva-support',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementOperationSupport'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Management Support - Geneva',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationManagementComposition = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-management/composition',
    component: {
        render: () => import('#views/SurgeCatalogueInformationManagementComposition'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Composition of IM Resources',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationTechnology = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology',
    component: {
        render: () => import('#views/SurgeCatalogueInformationTechnology'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology',
        visibility: 'anything',
    },
});

const surgeCatalogueInformationTechnologyEruItTelecom = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'information-technology/eru-it-telecom',
    component: {
        render: () => import('#views/SurgeCatalogueInformationTechnologyEruItTelecom'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Information Technology Service',
        visibility: 'anything',
    },
});

const surgeCatalogueLivelihood = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood',
    component: {
        render: () => import('#views/SurgeCatalogueLivelihood'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihoods and Basic Needs',
        visibility: 'anything',
    },
});

const surgeCatalogueLivelihoodServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'livelihood/services',
    component: {
        render: () => import('#views/SurgeCatalogueLivelihoodServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Livelihood Service',
        visibility: 'anything',
    },
});

const surgeCatalogueLogistics = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics',
    component: {
        render: () => import('#views/SurgeCatalogueLogistics'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Logistics',
        visibility: 'anything',
    },
});

const surgeCatalogueLogisticsEru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/eru',
    component: {
        render: () => import('#views/SurgeCatalogueLogisticsEru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency Response Unit',
        visibility: 'anything',
    },
});

const surgeCatalogueLogisticsLpscmNs = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'logistics/lpscm-ns',
    component: {
        render: () => import('#views/SurgeCatalogueLogisticsLpscmNs'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'LPSCM for National Societies',
        visibility: 'anything',
    },
});

const surgeCatalogueOperationsManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations-management',
    component: {
        render: () => import('#views/SurgeCatalogueOperationsManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Operations Management',
        visibility: 'anything',
    },
});

const surgeCatalogueOperationManagementHeops = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'operations-management/heops',
    component: {
        render: () => import('#views/SurgeCatalogueOperationsManagementHeops'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Head of Emergency Operations (HEOPS)',
        visibility: 'anything',
    },
});

const surgeCataloguePgi = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pgi',
    component: {
        render: () => import('#views/SurgeCataloguePgi'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Protection, Gender and inclusion (PGI)',
        visibility: 'anything',
    },
});

const surgeCataloguePgiServices = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pgi/services',
    component: {
        render: () => import('#views/SurgeCataloguePgiServices'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Protection Gender and Inclusion - Services',
        visibility: 'anything',
    },
});

const surgeCataloguePmer = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer',
    component: {
        render: () => import('#views/SurgeCataloguePmer'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Planning, Monitoring, Evaluation And Reporting (PMER)',
        visibility: 'anything',
    },
});

const surgeCataloguePmerEmergencyPlanAction = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer/emergency-plan-action',
    component: {
        render: () => import('#views/SurgeCataloguePmerEmergencyPlanAction'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Emergency plan of action EPOA monitoring evaluation plan',
        visibility: 'anything',
    },
});

const surgeCataloguePmerRealTimeEvaluation = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'pmer/real-time-evaluation',
    component: {
        render: () => import('#views/SurgeCataloguePmerRealTimeEvaluation'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Real time evaluation RTE and guidance',
        visibility: 'anything',
    },
});

const surgeCatalogueShelter = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter',
    component: {
        render: () => import('#views/SurgeCatalogueShelter'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter',
        visibility: 'anything',
    },
});

const surgeCatalogueShelterCoordinatorTeam = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter/coordinator-team',
    component: {
        render: () => import('#views/SurgeCatalogueShelterCoordinatorTeam'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter Surge Coordinator',
        visibility: 'anything',
    },
});

const surgeCatalogueShelterTechnicalTeam = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'shelter/technical-team',
    component: {
        render: () => import('#views/SurgeCatalogueShelterTechnicalTeam'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Shelter Technical Team',
        visibility: 'anything',
    },
});

const surgeCatalogueWash = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash',
    component: {
        render: () => import('#views/SurgeCatalogueWash'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Water, Sanitation and Hygiene (WASH)',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKit2 = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/kit-2',
    component: {
        render: () => import('#views/SurgeCatalogueWashKit2'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-2',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKit5 = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/kit-5',
    component: {
        render: () => import('#views/SurgeCatalogueWashKit5'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-5',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitM15Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/m15-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitM15Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'WASH Kit-M15 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitMsm20Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/msm20-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitMsm20Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Wash Kit-MSM20 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashKitM40Eru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/m40-eru',
    component: {
        render: () => import('#views/SurgeCatalogueWashKitM40Eru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Wash Kit-M40 ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueWashWaterSupplyRehabilitation = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/water-supply-rehabilitation',
    component: {
        render: () => import('#views/SurgeCatalogueWashWaterSupplyRehabilitation'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Water Supply Rehabilitation',
        visibility: 'anything',
    },
});

const surgeCatalogueWashHwts = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/hwts',
    component: {
        render: () => import('#views/SurgeCatalogueWashHwts'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Household Water Treatment and Safe Storage (HWTS)',
        visibility: 'anything',
    },
});

const surgeCatalogueWashSludge = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'wash/sludge',
    component: {
        render: () => import('#views/SurgeCatalogueWashSludge'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Faecal Sludge Management',
        visibility: 'anything',
    },
});

const surgeCatalogueRelief = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'relief',
    component: {
        render: () => import('#views/SurgeCatalogueRelief'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Relief',
        visibility: 'anything',
    },
});

const surgeCatalogueReliefEru = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'relief/eru',
    component: {
        render: () => import('#views/SurgeCatalogueReliefEru'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Relief ERU',
        visibility: 'anything',
    },
});

const surgeCatalogueSecurity = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'security',
    component: {
        render: () => import('#views/SurgeCatalogueSecurity'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Security',
        visibility: 'anything',
    },
});

const surgeCatalogueSecurityManagement = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'security/management',
    component: {
        render: () => import('#views/SurgeCatalogueSecurityManagement'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Security Management',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherCivilMilitaryRelations = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/civil-military-relations',
    component: {
        render: () => import('#views/SurgeCatalogueOtherCivilMilitaryRelations'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Civil Military Relations',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherDisasterRiskReduction = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/disaster-risk-reduction',
    component: {
        render: () => import('#views/SurgeCatalogueOtherDisasterRiskReduction'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Disaster Risk Reduction',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherHumanitarianDiplomacy = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/humanitarian-diplomacy',
    component: {
        render: () => import('#views/SurgeCatalogueOtherHumanitarianDiplomacy'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Humanitarian Diplomacy',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherHumanResources = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/human-resources',
    component: {
        render: () => import('#views/SurgeCatalogueOtherHumanResources'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Human Resources',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherInternationalDisasterResponseLaw = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/international-disaster-response-law',
    component: {
        render: () => import('#views/SurgeCatalogueOtherInternationalDisasterResponseLaw'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'International Disaster Response Law',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherMigration = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/migration',
    component: {
        render: () => import('#views/SurgeCatalogueOtherMigration'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Migration',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherNationalSocietyDevelopment = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/national-society-development',
    component: {
        render: () => import('#views/SurgeCatalogueOtherNationalSocietyDevelopment'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'National Society Development',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherStrategicPartnershipsResourceMobilisation = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/strategic-partnership-resource-mobilisation',
    component: {
        render: () => import('#views/SurgeCatalogueOtherStrategicPartnershipsResourceMobilisation'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Partnership Resource Development',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherPreparednessEffectiveResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/preparedness-effective-response',
    component: {
        render: () => import('#views/SurgeCatalogueOtherPreparednessEffectiveResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Preparedness Effective Response',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherRecovery = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/recovery',
    component: {
        render: () => import('#views/SurgeCatalogueOtherRecovery'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Recovery',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherGreenResponse = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/green-response',
    component: {
        render: () => import('#views/SurgeCatalogueOtherGreenResponse'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Green Response',
        visibility: 'anything',
    },
});

const surgeCatalogueOtherUAV = customWrapRoute({
    parent: surgeCatalogueLayout,
    path: 'other/uav',
    component: {
        render: () => import('#views/SurgeCatalogueOtherUAV'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Uncrewed Aerial Vehicles (Drones)',
        visibility: 'anything',
    },
});

const allDeployedPersonnel = customWrapRoute({
    parent: rootLayout,
    path: 'deployed-personnels/all',
    component: {
        render: () => import('#views/AllDeployedPersonnel'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Personnel',
        visibility: 'anything',
    },
});

const allDeployedEmergencyResponseUnits = customWrapRoute({
    parent: rootLayout,
    path: 'deployed-erus/all',
    component: {
        render: () => import('#views/AllDeployedEmergencyResponseUnits'),
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'All Deployed Emergency Response Units',
        visibility: 'anything',
    },
});

// eslint-disable-next-line react-refresh/only-export-components
function DeploymentNavigate() {
    const params = useParams<{ surgeId: string }>();

    const deploymentRouteMap: Record<string, MyOutputNonIndexRouteObject<ExtendedProps>> = {
        overview: surgeOverviewLayout,
        'operational-toolbox': surgeOperationalToolbox,
        personnel: allDeployedPersonnel,
        erus: allDeployedEmergencyResponseUnits,
    };

    const newRoute = isDefined(params.surgeId)
        ? deploymentRouteMap[params.surgeId]
        : undefined;

    const path = isDefined(newRoute)
        ? newRoute.absoluteForwardPath
        : surgeOverviewLayout.absoluteForwardPath;

    return (
        <Navigate
            to={path}
            replace
        />
    );
}

const deploymentOthers = customWrapRoute({
    parent: rootLayout,
    path: 'deployments/:surgeId/*',
    component: {
        eagerLoad: true,
        render: DeploymentNavigate,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Catalogue of surge services',
        visibility: 'anything',
    },
});

const deploymentCatalogueLayout = customWrapRoute({
    parent: rootLayout,
    path: 'deployments/catalogue',
    component: {
        eagerLoad: true,
        render: () => <Outlet />,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Catalogue of surge services',
        visibility: 'anything',
    },
});

// eslint-disable-next-line react-refresh/only-export-components
function DeploymentCatalogueNavigate() {
    const params = useParams<{
        catalogueId: string,
        subCatalogueId: string,
    }>();

    type WrappedRoute = MyOutputNonIndexRouteObject<ExtendedProps>;

    const catalogueRouteMap: Record<string, WrappedRoute> = {
        overview: surgeCatalogueOverview,
        emergency: surgeCatalogueEmergencyNeedsAssessment,
        administration: surgeCatalogueAdministration,
        basecamp: surgeCatalogueBasecamp,
        cash: surgeCatalogueCash,
        community: surgeCatalogueCommunityEngagement,
        communications: surgeCatalogueCommunication,
        health: surgeCatalogueHealth,
        infoMgt: surgeCatalogueInformationManagement,
        informationTech: surgeCatalogueInformationTechnology,
        livelihoods: surgeCatalogueLivelihood,
        logistics: surgeCatalogueLogistics,
        operations: surgeCatalogueOperationsManagement,
        protection: surgeCataloguePgi,
        planning: surgeCataloguePmer,
        relief: surgeCatalogueRelief,
        security: surgeCatalogueSecurity,
        shelter: surgeCatalogueShelter,
        water: surgeCatalogueWash,
    };

    const subCatalogueRouteMap: Record<string, Record<string, WrappedRoute>> = {
        emergency: {
            'assessment-cell': surgeCatalogueEmergencyNeedsAssessmentCell,
        },
        basecamp: {
            'eru-base-camp-small': surgeCatalogueBasecampEruSmall,
            'eru-base-camp-medium': surgeCatalogueBasecampEruMedium,
            'eru-base-camp-large': surgeCatalogueBasecampEruLarge,
            'facility-management': surgeCatalogueBasecampFacilityManagement,
            office: surgeCatalogueBasecampOffice,
            welcome: surgeCatalogueBasecampWelcome,
        },
        cash: {
            cva: surgeCatalogueCashRapidResponse,
        },
        community: {
            'community-engagement-and-accountability': surgeCatalogueCommunityEngagementRapidResponse,
        },
        communications: {
            'communications-emergency-response-tool-cert-3': surgeCatalogueCommunicationErtThree,
            'communications-emergency-response-tool-cert-2': surgeCatalogueCommunicationErtTwo,
            'communications-emergency-response-tool-cert-1': surgeCatalogueCommunicationErtOne,
        },
        health: {
            'eru-pss-module': surgeCatalogueHealthEruPsychosocialSupport,
            'community-case-management-of-malnutrition-ccmm': surgeCatalogueHealthCommunityManagementMalnutrition,
            'safe-and-dignified-burials': surgeCatalogueHealthSafeDignifiedBurials,
            'infection-prevention-and-control': surgeCatalogueHealthInfectionPreventionAndControl,
            'community-based-surveillance-cbs': surgeCatalogueHealthCommunityBasedSurveillance,
            'community-case-management-of-cholera-ccmc': surgeCatalogueHealthCommunityCaseManagementCholera,
            'eru-cholera-treatment-center': surgeCatalogueHealthEruCholeraTreatment,
            'emergency-mobile-clinic': surgeCatalogueHealthEmergencyClinic,
            'maternal-newborn-health-clinic': surgeCatalogueHealthMaternalNewbornClinic,
            'surgical-surge': surgeCatalogueHealthEruSurgical,
            'eru-red-cross-red-crescent-emergency-hospital': surgeCatalogueHealthEruHospital,
            'eru-red-cross-red-crescent-emergency-clinic': surgeCatalogueHealthEruClinic,
        },
        infoMgt: {
            // NOTE: sims was probably replace with link to its site
            // 'surge-information-management-support-sims': ,
            'roles-and-resps': surgeCatalogueInformationManagementRolesResponsibility,
            'im-support-for-op': surgeCatalogueInformationManagementRegionalOfficeSupport,
            'ifrc-geneva-im': surgeCatalogueInformationManagementGenevaSupport,
            'composition-of-im-res': surgeCatalogueInformationManagementComposition,
            'Satellite-imagery': surgeCatalogueInformationManagementSatelliteImagery,
        },
        informationTech: {
            'eru-it-telecom': surgeCatalogueInformationTechnologyEruItTelecom,
        },
        livelihoods: {
            'livelihoods-and-basic-needs': surgeCatalogueLivelihoodServices,
        },
        logistics: {
            'lpscm-for-national-societies': surgeCatalogueLogisticsLpscmNs,
            'logistics-eru': surgeCatalogueLogisticsEru,
        },
        operations: {
            'head-of-emergency-operations-heops': surgeCatalogueOperationManagementHeops,
        },
        protection: {
            'protection-gender-and-inclusion': surgeCataloguePgiServices,
        },
        planning: {
            'real-time-evaluation-rte-and-guidance': surgeCataloguePmerRealTimeEvaluation,
            'emergency-plan-of-action-epoa-monitoring-evaluation-plan': surgeCataloguePmerEmergencyPlanAction,
        },
        relief: {
            'eru-relief': surgeCatalogueReliefEru,
        },
        security: {
            'security-management': surgeCatalogueSecurityManagement,
        },
        shelter: {
            'stt-shelter-technical-team': surgeCatalogueShelterTechnicalTeam,
            'sct-shelter-coordination-team': surgeCatalogueShelterCoordinatorTeam,
        },
        water: {
            'faecal-sludge-management': surgeCatalogueWashSludge,
            'household-water-treatment-and-safe-storage-hwts': surgeCatalogueWashHwts,
            'water-supply-rehabilitation-wsr': surgeCatalogueWashWaterSupplyRehabilitation,
            'm40-eru': surgeCatalogueWashKitM40Eru,
            'msm20-eru': surgeCatalogueWashKitMsm20Eru,
            'm15-eru': surgeCatalogueWashKitM15Eru,
            'kit-5': surgeCatalogueWashKit5,
            'kit-2': surgeCatalogueWashKit2,
        },
        other: {
            'civil-military-relations': surgeCatalogueOtherCivilMilitaryRelations,
            'disaster-risk-reduction-drr': surgeCatalogueOtherDisasterRiskReduction,
            'humanitarian-diplomacy': surgeCatalogueOtherHumanitarianDiplomacy,
            'human-resources': surgeCatalogueOtherHumanResources,
            'international-disaster-response-law': surgeCatalogueOtherInternationalDisasterResponseLaw,
            migration: surgeCatalogueOtherMigration,
            'national-society-development': surgeCatalogueOtherNationalSocietyDevelopment,
            'strategic-partnership-resource-mobilisation': surgeCatalogueOtherStrategicPartnershipsResourceMobilisation,
            'preparedness-for-effective-response-per': surgeCatalogueOtherPreparednessEffectiveResponse,
            recovery: surgeCatalogueOtherRecovery,
            greenresponse: surgeCatalogueOtherGreenResponse,
            uav: surgeCatalogueOtherUAV,
        },
    };

    const newCatalogueRoute = isTruthyString(params.catalogueId)
        ? catalogueRouteMap[params.catalogueId]
        : undefined;

    const newSubCatalogueRoute = isTruthyString(params.catalogueId)
        && isTruthyString(params.subCatalogueId)
        ? subCatalogueRouteMap[params.catalogueId]?.[params.subCatalogueId]
        : undefined;

    const path = newSubCatalogueRoute?.absoluteForwardPath
        ?? newCatalogueRoute?.absoluteForwardPath
        ?? surgeCatalogueOverview.absoluteForwardPath;

    return (
        <Navigate
            to={path}
            replace
        />
    );
}

const deploymentCatalogueIndex = customWrapRoute({
    parent: deploymentCatalogueLayout,
    index: true,
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: '/surge/catalogue',
            replace: true,
        },
    },
    wrapperComponent: Auth,
    context: {
        title: 'Catalogue of Surge Services',
        visibility: 'anything',
    },
});

const deploymentCatalogueChildren = customWrapRoute({
    parent: deploymentCatalogueLayout,
    path: ':catalogueId/:subCatalogueId?',
    component: {
        eagerLoad: true,
        render: DeploymentCatalogueNavigate,
        props: {},
    },
    wrapperComponent: Auth,
    context: {
        title: 'Catalogue of Surge Services',
        visibility: 'anything',
    },
});

const obsoleteUrlDeployments = customWrapRoute({
    parent: rootLayout,
    path: 'deployments',
    component: {
        eagerLoad: true,
        render: Navigate,
        props: {
            to: surgeOverviewLayout.absolutePath,
        },
    },
    wrapperComponent: Auth,
    context: {
        title: 'Surge Overview',
        visibility: 'anything',
    },
});

export default {
    surgeLayout,
    surgeOverviewLayout,
    surgeOperationalToolbox,
    surgeCatalogueLayout,
    surgeOverviewIndex,
    surgeIndex,
    catalogueIndex,
    surgeCatalogueOverview,
    surgeCatalogueEmergencyNeedsAssessment,
    surgeCatalogueEmergencyNeedsAssessmentCell,
    surgeCatalogueAdministration,
    surgeCatalogueBasecamp,
    surgeCatalogueBasecampEruSmall,
    surgeCatalogueBasecampEruMedium,
    surgeCatalogueBasecampEruLarge,
    surgeCatalogueBasecampFacilityManagement,
    surgeCatalogueBasecampOffice,
    surgeCatalogueBasecampWelcome,
    surgeCatalogueCash,
    surgeCatalogueCashRapidResponse,
    surgeCatalogueCommunityEngagement,
    surgeCatalogueCommunityEngagementRapidResponse,
    surgeCatalogueCommunication,
    surgeCatalogueCommunicationErtOne,
    surgeCatalogueCommunicationErtTwo,
    surgeCatalogueCommunicationErtThree,
    surgeCatalogueHealth,
    surgeCatalogueHealthEruClinic,
    surgeCatalogueHealthEruHospital,
    surgeCatalogueHealthEruSurgical,
    surgeCatalogueHealthMaternalNewbornClinic,
    surgeCatalogueHealthEmergencyClinic,
    surgeCatalogueHealthEruCholeraTreatment,
    surgeCatalogueHealthCommunityCaseManagementCholera,
    surgeCatalogueHealthCommunityBasedSurveillance,
    surgeCatalogueHealthSafeDignifiedBurials,
    surgeCatalogueHealthInfectionPreventionAndControl,
    surgeCatalogueHealthCommunityManagementMalnutrition,
    surgeCatalogueHealthEruPsychosocialSupport,
    surgeCatalogueInformationManagement,
    surgeCatalogueInformationManagementSatelliteImagery,
    surgeCatalogueInformationManagementRolesResponsibility,
    surgeCatalogueInformationManagementRegionalOfficeSupport,
    surgeCatalogueInformationManagementGenevaSupport,
    surgeCatalogueInformationManagementComposition,
    surgeCatalogueInformationTechnology,
    surgeCataloguePmer,
    surgeCataloguePmerEmergencyPlanAction,
    surgeCataloguePmerRealTimeEvaluation,
    surgeCatalogueInformationTechnologyEruItTelecom,
    surgeCatalogueLivelihood,
    surgeCatalogueLivelihoodServices,
    surgeCatalogueSecurity,
    surgeCatalogueSecurityManagement,
    surgeCatalogueLogistics,
    surgeCatalogueLogisticsEru,
    surgeCatalogueLogisticsLpscmNs,
    surgeCatalogueOperationsManagement,
    surgeCatalogueOperationManagementHeops,
    surgeCataloguePgi,
    surgeCatalogueRelief,
    surgeCatalogueReliefEru,
    surgeCataloguePgiServices,
    surgeCatalogueShelter,
    surgeCatalogueShelterTechnicalTeam,
    surgeCatalogueShelterCoordinatorTeam,
    surgeCatalogueWash,
    surgeCatalogueWashKit2,
    surgeCatalogueWashKit5,
    surgeCatalogueWashKitM15Eru,
    surgeCatalogueWashKitMsm20Eru,
    surgeCatalogueWashKitM40Eru,
    surgeCatalogueWashWaterSupplyRehabilitation,
    surgeCatalogueWashHwts,
    surgeCatalogueWashSludge,
    surgeCatalogueOtherCivilMilitaryRelations,
    surgeCatalogueOtherDisasterRiskReduction,
    surgeCatalogueOtherHumanitarianDiplomacy,
    surgeCatalogueOtherHumanResources,
    surgeCatalogueOtherInternationalDisasterResponseLaw,
    surgeCatalogueOtherMigration,
    surgeCatalogueOtherNationalSocietyDevelopment,
    surgeCatalogueOtherStrategicPartnershipsResourceMobilisation,
    surgeCatalogueOtherPreparednessEffectiveResponse,
    surgeCatalogueOtherRecovery,
    surgeCatalogueOtherGreenResponse,
    surgeCatalogueOtherUAV,

    allDeployedPersonnel,
    allDeployedEmergencyResponseUnits,

    // Redirect routes
    deploymentCatalogueLayout,
    deploymentCatalogueIndex,
    deploymentCatalogueChildren,
    deploymentOthers,
    obsoleteUrlDeployments,
    activeSurgeDeployments,
    rapidResponsePersonnel,
    emergencyResponseUnit,
    eruReadinessForm,
};
