import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ChevronDownLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { _cs } from '@togglecorp/fujs';

import Bar from './Bar';
import {
    type PhaseKey,
    PHASES,
    type TimelineGroup,
} from './types';
import { packLanes } from './utils';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
}

function OperationalTimeline(props: Props) {
    const { className } = props;

    const strings = useTranslation(i18n);

    // Groups start collapsed; the user expands the ones they need.
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const handleGroupToggle = useCallback(
        (groupId: string) => {
            setExpandedGroups((prevValue) => ({
                ...prevValue,
                [groupId]: !prevValue[groupId],
            }));
        },
        [],
    );

    const phaseLabels: Record<PhaseKey, string> = {
        pre_disaster: strings.phasePreDisaster,
        w1: strings.phaseW1,
        w2: strings.phaseW2,
        w3: strings.phaseW3,
        w4: strings.phaseW4,
        month_2: strings.phaseMonth2,
        month_3: strings.phaseMonth3,
        month_4: strings.phaseMonth4,
        month_5_12: strings.phaseMonth5To12,
        closure: strings.phaseClosure,
    };

    /**
     * ====================================================================
     * ⚠️  LEGACY PLACEHOLDER DATA — TO BE REPLACED  ⚠️
     * ====================================================================
     * Auto-seeded from the previous static timeline assets (the deleted
     * `operational_timeline_body.svg` and its inline `operationTimelineContent`
     * array) by a one-off extraction that mapped each pill's x-range to a phase
     * and joined names/URLs by element id. It keeps the page functional during
     * the migration and MUST be reviewed/replaced with IFRC-supplied content:
     *
     *  - `startPhase`/`endPhase` are APPROXIMATE (the legacy SVG had ~7 visual
     *    columns, linearly mapped onto the 10 ordinal PHASES).
     *  - The group split (Emergency Response / Surge / IM / Shelter / Operations
     *    Support) is PROVISIONAL — the legacy data was a flat list of 11 sections
     *    with no top-level grouping, and "Shelter" is an entirely new placeholder
     *    group. The real taxonomy must come from IFRC.
     *  - `description` / `lastUpdate` / real document labels DO NOT EXIST in the
     *    legacy data. Each bar's `document.url` is its old SharePoint folder link
     *    (click-through preserved) with a generic label. Only "Establish EA
     *    Funding Requirements" is fleshed out (fabricated copy) to demonstrate
     *    the hover card (see Image 2 of the design).
     *
     * The data is kept inline because the repo's i18n-usage lint rule only
     * inspects this co-located index.tsx for `strings.*` references.
     * ====================================================================
     */
    const groups = useMemo<TimelineGroup[]>(
        () => [
            {
                id: 'emergency-response',
                label: strings.groupEmergencyResponse,
                activities: [
                    {
                        id: 'assessment',
                        label: strings.activityAssessment,
                        description: strings.activityAssessmentDescription,
                        bars: [
                            {
                                id: 'element1',
                                label: strings.barNeedsAssessments,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoEvMuAQ97lOm7vibFy6OEYBfbdF5l0cDjGpNPMYH_uVLw?e=hffR2U',
                                },
                            },
                        ],
                    },
                    {
                        id: 'planning',
                        label: strings.activityPlanning,
                        description: strings.activityPlanningDescription,
                        bars: [
                            {
                                id: 'element4',
                                label: strings.barLaunchDref,
                                startPhase: 'pre_disaster',
                                endPhase: 'w3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eh2oMhgNSqdGmT43ZUYBzk0BZUk4BK3apoDFk-461u2EtQ',
                                },
                            },
                            {
                                id: 'element5',
                                label: strings.barEstablishEaFunding,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                lastUpdate: strings.barEstablishEaFundingLastUpdate,
                                description: strings.barEstablishEaFundingDescription,
                                document: {
                                    label: strings.barEstablishEaFundingDocument,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eu6-noLTkX5JmPAhaeDmQtcB2IEGx_mRnAQFNK8IwgiDCQ',
                                },
                            },
                            {
                                id: 'element1_2',
                                label: strings.barCreateRiskRegister,
                                startPhase: 'w4',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmONBUO8gDVArGtE4OD6skoB6JlOKL5qmU2OF4iv8v6Aiw',
                                },
                            },
                            {
                                id: 'element6',
                                label: strings.barLaunchEa,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Es4FC38i50hHnjMXLovQva0BNZRltQzPD0yKDP39a2g8DQ',
                                },
                            },
                            {
                                id: 'element4_2',
                                label: strings.barCreateTransitionPlan,
                                startPhase: 'month_3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EuU329vYiZhJnzYDHSZuIV8BSEccfQAabKTtnWliSMdBtA',
                                },
                            },
                            {
                                id: 'element5_2',
                                label: strings.barRevisedResponseWorkshops,
                                startPhase: 'month_3',
                                endPhase: 'month_5_12',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EjN_meFam45BsqAYM0d9Tm0BHXnGsGxKqLAe5zpacYYWsA',
                                },
                            },
                            {
                                id: 'element6_2',
                                label: strings.barRevisionEmergencyAppeal,
                                startPhase: 'month_3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?RootFolder=/sites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FOPERATIONAL%20TOOLBOX%2F1%2E%20Timeline%20documents%2F02%2E%20Planning%2F02%2E09%20Revise%20Emergency%20Appeal%2DEPoA',
                                },
                            },
                            {
                                id: 'element7',
                                label: strings.barDevelopRecoveryApproach,
                                startPhase: 'month_2',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqU4PReiQ-FPm21whSQO3HUBqhLNfczLCzYxsqHZCh-2BA',
                                },
                            },
                            {
                                id: 'element4_3',
                                label: strings.barDevelopResponseOptions,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eh6fh83QrctBri8qnV_nIgMBnL_PLJUO1Lo7bYZEzJi3SQ',
                                },
                            },
                            {
                                id: 'element4_4',
                                label: strings.barCompleteOperationalStrategy,
                                startPhase: 'w2',
                                endPhase: 'w4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqgeyJbUWUtHqiGygkbzDlQBNFBgUHN26INuxRH4F9KoNQ',
                                },
                            },
                            {
                                id: 'element4_5',
                                label: strings.barDevelopImplementationPlan,
                                startPhase: 'w4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErnkTcrVFuhFupPbDRYEcd8BOAAnnGji1Jy-9og1kUVAuQ',
                                },
                            },
                        ],
                    },
                    {
                        id: 'coordination',
                        label: strings.activityCoordination,
                        description: strings.activityCoordinationDescription,
                        bars: [
                            {
                                id: 'element8',
                                label: strings.barEstablishTaskForces,
                                startPhase: 'pre_disaster',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EkwZzW2JdFVEvydPtqH_gEABF6G5AuIHRcl8J_ReyEroow',
                                },
                            },
                            {
                                id: 'element8_2',
                                label: strings.barEstablishMovementCoordination,
                                startPhase: 'pre_disaster',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://smcctoolkit.org/tool-kit',
                                },
                            },
                            {
                                id: 'element10',
                                label: strings.barReviseMovementCoordination,
                                startPhase: 'w4',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElUAIzfu4oxAuKPk3WUewvkBmUjIt1yPflN6v0PH-GNX_w?e=YGkbj5',
                                },
                            },
                            {
                                id: 'element9',
                                label: strings.barActivateShelterCluster,
                                startPhase: 'pre_disaster',
                                endPhase: 'w3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://www.sheltercluster.org/global',
                                },
                            },
                            {
                                id: 'element30',
                                label: strings.barFederationResponsePlan,
                                startPhase: 'month_3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo-iSVU8fjZMp9sJ3YWl8n8BwMVarYubQeLHVFiWfvPWVw?e=Nk2ZDK',
                                },
                            },
                            {
                                id: 'element1_4',
                                label: strings.barHoldMiniSummit,
                                startPhase: 'w2',
                                endPhase: 'w4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErEYlKDN8r5Pops7rCADsjgBPNNrBv2G6Tbv-lCM7TpYtQ',
                                },
                            },
                            {
                                id: 'element1_3',
                                label: strings.barExternalCoordinationPlan,
                                startPhase: 'w2',
                                endPhase: 'w4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElJyGf5pFExJgA8iwgkQXJIB4QWRL0EoDu4xGWsrOZFMCg',
                                },
                            },
                            {
                                id: 'element11',
                                label: strings.barMovementPartnerMeetings,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpflNbdSn4hMnnZ24mZ1X5ABnW8i_f3-IqGsPPjuI57ypw?e=aHoqNk',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: 'surge',
                label: strings.groupSurge,
                activities: [
                    {
                        id: 'surge-and-hr',
                        label: strings.activitySurgeAndHr,
                        bars: [
                            {
                                id: 'element12',
                                label: strings.barSendSurgeAlert,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/El814u3TtXlPracWs32VorIB_pULshHLHCus5wZuIRArpw',
                                },
                            },
                            {
                                id: 'element16',
                                label: strings.barEndOfMission,
                                startPhase: 'w4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqZNZFoYcjhNqXVciAM5vuABjlGg4fvzwZHKeylvhtBGBQ',
                                },
                            },
                            {
                                id: 'element13',
                                label: strings.barWorkforcePlanning,
                                startPhase: 'w1',
                                endPhase: 'w4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eq38VyX2Q39GmoFCOf2e4vcB1s8onYrxbHGNFcNap7BzRw',
                                },
                            },
                            {
                                id: 'element13_2',
                                label: strings.barBeginRecruitment,
                                startPhase: 'w3',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmHk4Z-OkdZIlfal90vzLHIB4p3CBV_ocOHCmMMuhS8HoA',
                                },
                            },
                            {
                                id: 'element1_6',
                                label: strings.barUpdateOrganigram,
                                startPhase: 'month_3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EmHk4Z-OkdZIlfal90vzLHIB4p3CBV_ocOHCmMMuhS8HoA',
                                },
                            },
                            {
                                id: 'element1_5',
                                label: strings.barReportConcerns,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EhDClHP53pZGmGXse6Ef7vUBhanWIJY-CxsDmNGDceRARA',
                                },
                            },
                        ],
                    },
                    {
                        id: 'monitoring-evaluation',
                        label: strings.activityMonitoringEvaluation,
                        bars: [
                            {
                                id: 'element17',
                                label: strings.barCreateSitreps,
                                startPhase: 'pre_disaster',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo01vTabxF9Aj27p6S3mSuoBbDN7ixfS_PRs0MHGUxyD2A',
                                },
                            },
                            {
                                id: 'element18',
                                label: strings.barIndicatorTracking,
                                startPhase: 'month_3',
                                endPhase: 'month_5_12',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpbUfG-SUZ5Ap97uj4g4r9sBvSQW9RxLg5xVczuijS77cg',
                                },
                            },
                            {
                                id: 'element1_7',
                                label: strings.barDevelopMEPlan,
                                startPhase: 'w4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoWr3j4-JXNIqxbmLiCQfA8B2QgMKxH7eZPv2sHS5tg-6g',
                                },
                            },
                            {
                                id: 'element19',
                                label: strings.barReviseMEPlan,
                                startPhase: 'month_4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EoWr3j4-JXNIqxbmLiCQfA8B2QgMKxH7eZPv2sHS5tg-6g',
                                },
                            },
                            {
                                id: 'element1_8',
                                label: strings.barOpsUpdate,
                                startPhase: 'w2',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ej7atMLNhOVBp9mqejlvk_sBp450NJB4-50ee1YjjErg_Q',
                                },
                            },
                            {
                                id: 'element1_9',
                                label: strings.barOpsUpdateTwo,
                                startPhase: 'w4',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ej7atMLNhOVBp9mqejlvk_sBp450NJB4-50ee1YjjErg_Q',
                                },
                            },
                            {
                                id: 'element20',
                                label: strings.barFederationReporting,
                                startPhase: 'month_4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvaYwaFc9TVDiV3_H4G03vgBt-h2RiABultu8pQPnSCCrA',
                                },
                            },
                            {
                                id: 'element21',
                                label: strings.barConductRte,
                                startPhase: 'month_4',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Egwg83-q2bREoEXPIfBTn5kBMbIUHX_utbt63rFJp8JsQw',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: 'im',
                label: strings.groupIm,
                activities: [
                    {
                        id: 'information-management',
                        label: strings.activityInformationManagement,
                        bars: [
                            {
                                id: 'element1_12',
                                label: strings.barMaintainGoPage,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed8QtQCbLzxHpp6cm7xR9WkBc8Qz0cx0k0oj1VgoL2aahw',
                                },
                            },
                            {
                                id: 'element1_13',
                                label: strings.barSituationalOverview,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnpwY1GhzuRBmo7WAQ_7PQoBhi55A-zc3Eh1BaXrllW0tw',
                                },
                            },
                            {
                                id: 'element1_10',
                                label: strings.barDefineImStrategy,
                                startPhase: 'w2',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvlSgJM5xWVJp87dPDFefeMBCDndFtU-WtlpV9x7wskdUw',
                                },
                            },
                            {
                                id: 'element1_14',
                                label: strings.barProduceMovementPicture,
                                startPhase: 'w2',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://smcctoolkit.org/tool-kit/#x-section-4',
                                },
                            },
                            {
                                id: 'element1_11',
                                label: strings.barActivateSims,
                                startPhase: 'w1',
                                endPhase: 'w3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://rcrcsims.org',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: 'shelter',
                label: strings.groupShelter,
                // NOTE: NEW placeholder group — the legacy data had no Shelter
                // section. These bars are illustrative and must be replaced with
                // IFRC-supplied Shelter & Settlements content.
                activities: [
                    {
                        id: 'shelter-settlements',
                        label: strings.activityShelter,
                        bars: [
                            {
                                id: 'shelter-cluster',
                                label: strings.barShelterClusterCoordination,
                                startPhase: 'pre_disaster',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://www.sheltercluster.org/global',
                                },
                            },
                            {
                                id: 'shelter-assessment',
                                label: strings.barShelterAssessment,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://www.sheltercluster.org/global',
                                },
                            },
                            {
                                id: 'shelter-response-plan',
                                label: strings.barShelterResponsePlan,
                                startPhase: 'w2',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://www.sheltercluster.org/global',
                                },
                            },
                        ],
                    },
                ],
            },
            {
                id: 'operations-support',
                label: strings.groupOperationsSupport,
                activities: [
                    {
                        id: 'finance-admin',
                        label: strings.activityFinanceAdmin,
                        bars: [
                            {
                                id: 'element22',
                                label: strings.barDrefProjectAgreement,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElpuKM7mqitHlqGOrTAbdJwBhe7Pscaa21Pwv4kAEChJHw',
                                },
                            },
                            {
                                id: 'element23',
                                label: strings.barDevelopOperatingBudget,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ek1-VTpEYqlCtS7fQ3uXNrcB0PqHfQ961Mu5s5AiTRk4og?e=MeZc8W',
                                },
                            },
                            {
                                id: 'element24_2',
                                label: strings.barReviseOperatingBudget,
                                startPhase: 'w3',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ek1-VTpEYqlCtS7fQ3uXNrcB0PqHfQ961Mu5s5AiTRk4og?e=MeZc8W',
                                },
                            },
                            {
                                id: 'element25',
                                label: strings.barAppealProjectAgreement,
                                startPhase: 'w4',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Em0ZAEsalk5Jul1Uonrx8xwBJGSEZdbYyU5wAIUSOj_-fg',
                                },
                            },
                            {
                                id: 'element24',
                                label: strings.barPear,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvVyOV0vODNOhB_hMZi4Us0Bl9hB3hvrFY6fmS55IYyifg?e=uAro8S',
                                },
                            },
                            {
                                id: 'element1_15',
                                label: strings.barPlanOfArrival,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnL5Opb7DhJAuWwsNzGqQpIB4pqlXntVUm1XRY6AZBSgUA?e=lU4ULX',
                                },
                            },
                            {
                                id: 'element27',
                                label: strings.barPartnersCall,
                                startPhase: 'w2',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Evym_hIX3HZFhzEqSUii9G8B9odeetryN5kXoFZiryJl6Q?e=2KXNnW',
                                },
                            },
                            {
                                id: 'element1_16',
                                label: strings.barResourceMobilizationPlan,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EgouBf10MC1DgxcIDdRu5_kBd7iT2aXIQm_vdymzO6AZhw?e=TaLqnG',
                                },
                            },
                            {
                                id: 'element28',
                                label: strings.barUpdateResourceMobilization,
                                startPhase: 'w3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EsF3Ei5eH4JKrAALHBWxVX4BnAm9i5-o-Z_VxVqgxvVMAg?e=aQAcpO',
                                },
                            },
                            {
                                id: 'element1_17',
                                label: strings.barEstablishWelcomeService,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eo1XPZuxHRRLgArAv5NA7lkBmILPSH9fcMwZ_ajBZHKGUg?e=2VeVU9',
                                },
                            },
                            {
                                id: 'element29',
                                label: strings.barMonitorPledges,
                                startPhase: 'w3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ev-opnr7uyVFgzk-h3lX9BgB8fHsBhqiukJDL_5KBX57bA?e=jpbj6G',
                                },
                            },
                        ],
                    },
                    {
                        id: 'logistics',
                        label: strings.activityLogistics,
                        bars: [
                            {
                                id: 'element1_19',
                                label: strings.barReviseCustoms,
                                startPhase: 'pre_disaster',
                                endPhase: 'w3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ErfZJPKdfjJIgI6DE9t0D6sB1XVEpNb-vGrrM7wlcOw1QA',
                                },
                            },
                            {
                                id: 'element1_20',
                                label: strings.barCreateFleetPlan,
                                startPhase: 'w3',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ep-ZW8Nh_-FOi7Qo9FCOfxIBsTHJDpvW6k82Xz3fl4xtjQ',
                                },
                            },
                            {
                                id: 'element1_21',
                                label: strings.barFleetPlanRegional,
                                startPhase: 'month_2',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Et5Cc35pRYpJtas4a3IBooABKh0m6JR7dHdfLXGkQpKHDQ?e=UY2R5w',
                                },
                            },
                            {
                                id: 'element1_22',
                                label: strings.barSetupProcurement,
                                startPhase: 'w4',
                                endPhase: 'month_4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvI36WxaE2hMrh03KVK-RAkBAUHdwWKERLPjDaSmIRLbuw',
                                },
                            },
                            {
                                id: 'element1_23',
                                label: strings.barReviseProcurement,
                                startPhase: 'month_3',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EvI36WxaE2hMrh03KVK-RAkBAUHdwWKERLPjDaSmIRLbuw',
                                },
                            },
                            {
                                id: 'element1_18',
                                label: strings.barCreateLogisticsPlan,
                                startPhase: 'w2',
                                endPhase: 'month_2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EnYRiFl7N-pErKxD-zRnFpIB07s7ezSEafHKQJNzaSbhFQ',
                                },
                            },
                            {
                                id: 'element26',
                                label: strings.barMobilizationTable,
                                startPhase: 'pre_disaster',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/ElJ7QaCcS2RCtxnRPHFb0W0B_C0tzKhGy8kjUsbENzs2Ww',
                                },
                            },
                        ],
                    },
                    {
                        id: 'safety-security',
                        label: strings.activitySafetySecurity,
                        bars: [
                            {
                                id: 'element1_24',
                                label: strings.barDevelopSecurityPlan,
                                startPhase: 'pre_disaster',
                                endPhase: 'month_3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpHQGrFvG2pPk-0cwLYIHTsBjoQH-e6WLwOBI50ODTjyuw',
                                },
                            },
                            {
                                id: 'element1_25',
                                label: strings.barUpdateSecurityPlan,
                                startPhase: 'month_2',
                                endPhase: 'closure',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EpHQGrFvG2pPk-0cwLYIHTsBjoQH-e6WLwOBI50ODTjyuw',
                                },
                            },
                            {
                                id: 'element1_26',
                                label: strings.barDevelopMedevac,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EiK1nlWLC35IpNWCcXZHDpIB5ZgD83UBhdgFIltmPkSVsw',
                                },
                            },
                        ],
                    },
                    {
                        id: 'communications',
                        label: strings.activityCommunications,
                        bars: [
                            {
                                id: 'element1_27',
                                label: strings.barKeyMessages,
                                startPhase: 'pre_disaster',
                                endPhase: 'w2',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EqNijq6LJgJMiRKSgYp5eocBORHiCWXUPr7-rCwLqzH6MA',
                                },
                            },
                            {
                                id: 'element1_28',
                                label: strings.barCommunicationsPlan,
                                startPhase: 'w1',
                                endPhase: 'w3',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Eq38joe3oBBFqPt6vz8Q3SkBlVdjHebEjOkJQIUQNKn-Ng',
                                },
                            },
                        ],
                    },
                    {
                        id: 'other',
                        label: strings.activityOther,
                        bars: [
                            {
                                id: 'element1_29',
                                label: strings.barEnvironmentalImpact,
                                startPhase: 'w3',
                                endPhase: 'w4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/EiMzmHnXvBxJqWm17AdqMgEBEZFFH5-C1dLcx4bM1jlcGw',
                                },
                            },
                            {
                                id: 'element1_30',
                                label: strings.barComplianceSteps,
                                startPhase: 'w4',
                                endPhase: 'month_4',
                                document: {
                                    label: strings.openResourceLabel,
                                    url: 'https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/Ehpgtwo3zXVOowJihJtw5EYBT5YeOYAwlJq22ZZnpxFG1Q',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
        [strings],
    );

    return (
        <div className={_cs(styles.operationalTimeline, className)}>
            <div className={styles.timeline}>
                <div className={styles.headerRow}>
                    <div className={styles.gutter} />
                    <div className={styles.phaseHeader}>
                        {PHASES.map((phase) => (
                            <div
                                key={phase}
                                className={styles.phaseHeaderCell}
                            >
                                {phaseLabels[phase]}
                            </div>
                        ))}
                    </div>
                </div>
                {groups.map((group) => {
                    const expanded = expandedGroups[group.id] ?? false;

                    return (
                        <div
                            key={group.id}
                            className={styles.group}
                        >
                            <Button
                                name={group.id}
                                onClick={handleGroupToggle}
                                className={styles.groupHeader}
                                styleVariant="transparent"
                                spacing="none"
                                aria-expanded={expanded}
                                before={expanded
                                    ? <ChevronDownLineIcon className={styles.chevron} />
                                    : <ChevronRightLineIcon className={styles.chevron} />}
                            >
                                <span className={styles.groupLabel}>
                                    {group.label}
                                </span>
                            </Button>
                            {expanded && group.activities.map((activity) => {
                                const { positioned, laneCount } = packLanes(activity.bars);

                                return (
                                    <div
                                        key={activity.id}
                                        className={styles.activityRow}
                                    >
                                        <div className={styles.gutter}>
                                            <div className={styles.activityLabel}>
                                                {activity.label}
                                            </div>
                                            {activity.description && (
                                                <div className={styles.activityDescription}>
                                                    {activity.description}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={styles.phaseArea}
                                            style={{
                                                gridTemplateRows: `repeat(${laneCount}, auto)`,
                                            }}
                                        >
                                            {positioned.map((bar) => (
                                                <Bar
                                                    key={bar.id}
                                                    bar={bar}
                                                    lastUpdateLabel={strings.lastUpdateLabel}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OperationalTimeline;
