import { useMemo } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes, { type DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import usePrimarySector from '#hooks/domain/usePrimarySector';
import {
    DREF_TYPE_IMMINENT,
    DREF_TYPE_RESPONSE,
    type TypeOfDrefEnum,
} from '#utils/constants';
import { type TemplateSchema } from '#utils/importTemplate';
import {
    ONSET_SUDDEN,
    OPERATION_TIMEFRAME_IMMINENT,
} from '#views/DrefApplicationForm/common';
import { type DrefRequestBody } from '#views/DrefApplicationForm/schema';

import i18n from './i18n.json';

// Numbered slots each repeatable list (source/risk/indicator) offers in the template.
const MAX_LIST_ENTRIES = 5;

function useImportTemplateSchema() {
    const strings = useTranslation(i18n);

    const nationalSocieties = useNationalSociety();
    const countries = useCountry();
    const disasterTypes = useDisasterTypes();
    const primarySectors = usePrimarySector();

    const {
        dref_planned_intervention_title,
        dref_national_society_action_title,
        dref_identified_need_title,
        dref_dref_onset_type,
        dref_dref_disaster_category,
        dref_proposed_action,
    } = useGlobalEnums();

    const nationalSocietyActionsDescMap: Record<string, string> = useMemo(() => ({
        shelter_housing_and_settlements: strings.nsActionDesc_shelter_housing_and_settlements,
        livelihoods_and_basic_needs: strings.nsActionDesc_livelihoods_and_basic_needs,
        multi_purpose_cash: strings.nsActionDesc_multi_purpose_cash,
        health: strings.nsActionDesc_health,
        water_sanitation_and_hygiene: strings.nsActionDesc_water_sanitation_and_hygiene,
        protection_gender_and_inclusion: strings.nsActionDesc_protection_gender_and_inclusion,
        education: strings.nsActionDesc_education,
        migration_and_displacement: strings.nsActionDesc_migration_and_displacement,
        risk_reduction_climate_adaptation_and_recovery:
            strings.nsActionDesc_risk_reduction_climate_adaptation_and_recovery,
        community_engagement_and_accountability:
            strings.nsActionDesc_community_engagement_and_accountability,
        environment_sustainability: strings.nsActionDesc_environment_sustainability,
        coordination: strings.nsActionDesc_coordination,
        national_society_readiness: strings.nsActionDesc_national_society_readiness,
        assessment: strings.nsActionDesc_assessment,
        resource_mobilization: strings.nsActionDesc_resource_mobilization,
        activation_of_contingency_plans: strings.nsActionDesc_activation_of_contingency_plans,
        national_society_eoc: strings.nsActionDesc_national_society_eoc,
        other: strings.nsActionDesc_other,
    }), [strings]);

    const needsIdentifiedDescMap: Record<string, string> = useMemo(() => ({
        shelter_housing_and_settlements: strings.needDesc_shelter_housing_and_settlements,
        livelihoods_and_basic_needs: strings.needDesc_livelihoods_and_basic_needs,
        multi_purpose_cash_grants: strings.needDesc_multi_purpose_cash_grants,
        health: strings.needDesc_health,
        water_sanitation_and_hygiene: strings.needDesc_water_sanitation_and_hygiene,
        protection_gender_and_inclusion: strings.needDesc_protection_gender_and_inclusion,
        education: strings.needDesc_education,
        migration_and_displacement: strings.needDesc_migration_and_displacement,
        risk_reduction_climate_adaptation_and_recovery:
            strings.needDesc_risk_reduction_climate_adaptation_and_recovery,
        community_engagement_and_accountability:
            strings.needDesc_community_engagement_and_accountability,
        environment_sustainability: strings.needDesc_environment_sustainability,
    }), [strings]);

    const optionsMap = useMemo(() => ({
        __boolean: [
            {
                key: true,
                label: strings.optYes,
            },
            {
                key: false,
                label: strings.optNo,
            },
        ],
        national_society: nationalSocieties.map(
            ({ id, society_name }) => ({ key: id, label: society_name }),
        ),
        country: countries?.map(
            ({ id, name }) => ({ key: id, label: name }),
        ),
        disaster_type: disasterTypes?.map(
            ({ id, name }: DisasterType) => ({ key: id, label: name }),
        ) ?? [],
        type_of_onset: dref_dref_onset_type?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        disaster_category: dref_dref_disaster_category?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        planned_interventions: dref_planned_intervention_title?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        source_information: Array.from({ length: MAX_LIST_ENTRIES }, (_, i) => ({
            key: `source__${i}`,
            label: resolveToString(strings.optSource, { n: i + 1 }),
        })),
        planned_interventions_indicators: Array.from({ length: MAX_LIST_ENTRIES }, (_, i) => ({
            key: `indicator__${i}`,
            label: resolveToString(strings.optIndicator, { n: i + 1 }),
        })),
        risk_security: Array.from({ length: MAX_LIST_ENTRIES }, (_, i) => ({
            key: `risk__${i}`,
            label: resolveToString(strings.optRisk, { n: i + 1 }),
        })),
        national_society_actions: dref_national_society_action_title?.map(
            ({ key, value }) => ({
                key,
                label: value,
                description: nationalSocietyActionsDescMap[key],
            }),
        ) ?? [],
        needs_identified: dref_identified_need_title?.map(
            ({ key, value }) => ({
                key,
                label: value,
                description: needsIdentifiedDescMap[key],
            }),
        ) ?? [],
        proposed_action_type: dref_proposed_action?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        primary_sector: primarySectors?.map(
            ({ key, label }) => ({ key, label }),
        ) ?? [],
    }), [
        countries,
        disasterTypes,
        nationalSocieties,
        primarySectors,
        dref_planned_intervention_title,
        dref_national_society_action_title,
        dref_identified_need_title,
        dref_dref_onset_type,
        dref_dref_disaster_category,
        dref_proposed_action,
        nationalSocietyActionsDescMap,
        needsIdentifiedDescMap,
        strings,
    ]);

    // Self-contained literal; the Imminent schema below shares this optionsMap + engine.
    const responseSchema: TemplateSchema<DrefRequestBody, typeof optionsMap> = useMemo(() => ({
        type: 'object',
        fields: {
            // OPERATION OVERVIEW

            national_society: {
                type: 'select',
                label: strings.respNationalSocietyLabel,
                validation: 'number',
                optionsKey: 'national_society',
                description: strings.respNationalSocietyDesc,
            },

            // We're skipping type of DREF since we'll have separate template for each type of dref
            // type_of_dref: xxx

            disaster_type: {
                type: 'select',
                label: strings.respDisasterTypeLabel,
                validation: 'number',
                optionsKey: 'disaster_type',
                description: strings.respDisasterTypeDesc,
            },

            type_of_onset: {
                type: 'select',
                label: strings.respTypeOfOnsetLabel,
                validation: 'number',
                optionsKey: 'type_of_onset',
                description: [
                    { text: strings.respTypeOfOnsetDesc1 },
                    { text: '\n' },
                    { text: strings.respTypeOfOnsetSuddenTerm, bold: true },
                    { text: strings.respTypeOfOnsetSuddenBody },
                    { text: '\n' },
                    { text: strings.respTypeOfOnsetSlowTerm, bold: true },
                    { text: strings.respTypeOfOnsetSlowBody },
                ],
            },

            is_man_made_event: {
                type: 'select',
                label: strings.respIsManMadeEventLabel,
                validation: 'boolean',
                optionsKey: '__boolean',
                description: [
                    { text: strings.respIsManMadeEventDesc1 },
                    { text: '\n' },
                    { text: strings.respIsManMadeEventDesc2, italic: true },
                ],
            },

            disaster_category: {
                type: 'select',
                label: strings.respDisasterCategoryLabel,
                validation: 'number',
                optionsKey: 'disaster_category',
                description: strings.respDisasterCategoryDesc,
            },

            country: {
                type: 'select',
                label: strings.respCountryLabel,
                validation: 'number',
                optionsKey: 'country',
                description: strings.respCountryDesc,
            },

            title: {
                type: 'input',
                label: strings.respTitleLabel,
                validation: 'string',
            },

            // EVENT DETAIL

            did_it_affect_same_area: {
                headingBefore: strings.respPreviousOperationHeading,
                type: 'select',
                label: strings.respDidItAffectSameAreaLabel,
                optionsKey: '__boolean',
                validation: 'boolean',
            },

            did_it_affect_same_population: {
                type: 'select',
                label: strings.respDidItAffectSamePopulationLabel,
                optionsKey: '__boolean',
                validation: 'boolean',
                description: strings.respDidItAffectSamePopulationDesc,
            },

            did_ns_respond: {
                type: 'select',
                label: strings.respDidNsRespondLabel,
                optionsKey: '__boolean',
                validation: 'boolean',
                description: strings.respDidNsRespondDesc,
            },

            did_ns_request_fund: {
                type: 'select',
                label: strings.respDidNsRequestFundLabel,
                optionsKey: '__boolean',
                validation: 'boolean',
                description: strings.respDidNsRequestFundDesc,
            },

            ns_request_text: {
                type: 'input',
                label: [{ text: strings.respNsRequestTextLabel, italic: true }],
                validation: 'string',
                description: strings.respNsRequestTextDesc,
            },

            dref_recurrent_text: {
                type: 'input',
                label: strings.respDrefRecurrentTextLabel,
                validation: 'textArea',
            },

            lessons_learned: {
                type: 'input',
                label: strings.respLessonsLearnedLabel,
                validation: 'textArea',
                description: [
                    { text: strings.respLessonsLearnedDesc1 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respLessonsLearnedDesc2 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respLessonsLearnedDesc3 },
                    { text: '\n' },
                    { text: strings.respLessonsLearnedDesc4, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respLessonsLearnedDesc5, bold: true },
                    { text: ' ' },
                    { text: strings.respLessonsLearnedDesc6, italic: true },
                ],
            },

            // FIXME: These are not showing up on the file
            complete_child_safeguarding_risk: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.respCompleteChildSafeguardingRiskLabel,
                description: strings.respCompleteChildSafeguardingRiskDesc,
            },

            child_safeguarding_risk_level: {
                type: 'input',
                label: strings.respChildSafeguardingRiskLevelLabel,
                validation: 'textArea',
                description: strings.respChildSafeguardingRiskLevelDesc,
            },

            event_date: {
                headingBefore: strings.respDescriptionOfTheEventHeading,
                type: 'input',
                label: strings.respEventDateLabel,
                validation: 'date',
                description: strings.respEventDateDesc,
            },

            num_affected: {
                type: 'input',
                validation: 'number',
                label: strings.respNumAffectedLabel,
                description: strings.respNumAffectedDesc,
            },

            estimated_number_of_affected_male: {
                type: 'input',
                validation: 'number',
                label: strings.respEstimatedNumberOfAffectedMaleLabel,
                description: '',
            },

            estimated_number_of_affected_female: {
                type: 'input',
                validation: 'number',
                label: strings.respEstimatedNumberOfAffectedFemaleLabel,
                description: '',
            },

            estimated_number_of_affected_minors: {
                type: 'input',
                validation: 'number',
                label: strings.respEstimatedNumberOfAffectedMinorsLabel,
                description: '',
            },

            people_in_need: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respPeopleInNeedLabel1 },
                    { text: ' ' },
                    { text: strings.respPeopleInNeedLabel2, italic: true },
                ],
                description: strings.respPeopleInNeedDesc,
            },

            event_description: {
                type: 'input',
                validation: 'textArea',
                label: strings.respEventDescriptionLabel,
                description: [
                    { text: strings.respEventDescriptionDesc1, italic: true },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc2, bold: true },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc3 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc4, bold: true },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc5 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc6, bold: true },
                    { text: '\n' },
                    { text: strings.respEventDescriptionDesc7 },
                ],
            },

            event_scope: {
                type: 'input',
                validation: 'textArea',
                label: strings.respEventScopeLabel,
                description: [
                    { text: strings.respEventScopeDesc1 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc2, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc3, underline: true },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc4, bold: true },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc5 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc6 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc7 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc8, bold: true },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc9 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc10 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc11, bold: true },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc12 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc13 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc14, bold: true },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc15 },
                    { text: '\n' },
                    { text: strings.respEventScopeDesc16 },
                ],
            },

            source_information: {
                type: 'list',
                label: strings.respSourceInformationLabel,
                optionsKey: 'source_information',
                children: {
                    type: 'object',
                    fields: {
                        source_name: {
                            type: 'input',
                            validation: 'string',
                            label: strings.respSourceNameLabel,
                        },
                        source_link: {
                            type: 'input',
                            validation: 'string',
                            label: strings.respSourceLinkLabel,
                            description: strings.respSourceLinkDesc,
                        },
                    },
                },
            },

            // ACTIONS NEEDS

            did_national_society: {
                headingBefore: strings.respCurrentNationalSocietyActionsHeading,
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.respDidNationalSocietyLabel,
                description: strings.respDidNationalSocietyDesc,
            },

            ns_respond_date: {
                type: 'input',
                validation: 'date',
                label: strings.respNsRespondDateLabel,
                description: strings.respNsRespondDateDesc,
            },

            national_society_actions: {
                type: 'list',
                label: strings.respNationalSocietyActionsLabel,
                // NOTE: This has not been hidden in the shared template, but to make this
                // consistent we can hide this
                hiddenLabel: true,
                keyFieldName: 'title',
                optionsKey: 'national_society_actions',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'textArea',
                            label: strings.respNsActionDescriptionLabel,
                            description: strings.respNsActionDescriptionDesc,
                        },
                    },
                },
            },

            ifrc: {
                headingBefore: strings.respIfrcNetworkActionsHeading,
                type: 'input',
                validation: 'textArea',
                label: strings.respIfrcLabel,
                description: strings.respIfrcDesc,
            },

            partner_national_society: {
                type: 'input',
                validation: 'textArea',
                label: strings.respPartnerNationalSocietyLabel,
                description: strings.respPartnerNationalSocietyDesc,
            },

            icrc: {
                headingBefore: strings.respIcrcActionsHeading,
                type: 'input',
                validation: 'textArea',
                label: strings.respIcrcLabel,
                description: strings.respIcrcDesc,
            },

            government_requested_assistance: {
                headingBefore: strings.respOtherActorsActionsHeading,
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.respGovernmentRequestedAssistanceLabel,
                description: strings.respGovernmentRequestedAssistanceDesc,
            },

            national_authorities: {
                type: 'input',
                validation: 'textArea',
                label: strings.respNationalAuthoritiesLabel,
                description: strings.respNationalAuthoritiesDesc,
            },

            un_or_other_actor: {
                type: 'input',
                validation: 'textArea',
                label: strings.respUnOrOtherActorLabel,
                description: strings.respUnOrOtherActorDesc,
            },

            is_there_major_coordination_mechanism: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.respIsThereMajorCoordinationMechanismLabel,
                description: strings.respIsThereMajorCoordinationMechanismDesc,
            },

            major_coordination_mechanism: {
                type: 'input',
                validation: 'textArea',
                label: strings.respMajorCoordinationMechanismLabel,
                description: strings.respMajorCoordinationMechanismDesc,
            },

            needs_identified: {
                type: 'list',
                label: strings.respNeedsIdentifiedLabel,
                keyFieldName: 'title',
                optionsKey: 'needs_identified',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'textArea',
                            label: strings.respNeedDescriptionLabel,
                            description: strings.respNeedDescriptionDesc,
                        },
                    },
                },
            },

            identified_gaps: {
                type: 'input',
                validation: 'textArea',
                label: strings.respIdentifiedGapsLabel,
                description: [
                    { text: strings.respIdentifiedGapsDesc1, underline: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respIdentifiedGapsDesc2 },
                    { text: '\n' },
                    { text: strings.respIdentifiedGapsDesc3 },
                    { text: '\n' },
                    { text: strings.respIdentifiedGapsDesc4 },
                    { text: '\n' },
                    { text: strings.respIdentifiedGapsDesc5 },
                    { text: '\n' },
                    { text: strings.respIdentifiedGapsDesc6 },
                    { text: '\n' },
                ],
            },

            // OPERATION

            operation_objective: {
                headingBefore: strings.respObjectiveAndStrategyHeading,
                type: 'input',
                validation: 'textArea',
                label: strings.respOperationObjectiveLabel,
                description: [
                    { text: strings.respOperationObjectiveDesc1 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respOperationObjectiveDesc2, bold: true },
                ],
            },

            response_strategy: {
                type: 'input',
                validation: 'textArea',
                label: strings.respResponseStrategyLabel,
                description: [
                    { text: strings.respResponseStrategyDesc1 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respResponseStrategyDesc2, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respResponseStrategyDesc3 },
                    { text: '\n' },
                    { text: strings.respResponseStrategyDesc4 },
                    { text: '\n' },
                    { text: strings.respResponseStrategyDesc5 },
                    { text: '\n' },
                    { text: strings.respResponseStrategyDesc6 },
                ],
            },

            people_assisted: {
                headingBefore: strings.respTargetingStrategyHeading,
                type: 'input',
                validation: 'textArea',
                label: strings.respPeopleAssistedLabel,
                description: [
                    { text: strings.respPeopleAssistedDesc1 },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respPeopleAssistedDesc2 },
                ],
            },

            selection_criteria: {
                type: 'input',
                validation: 'textArea',
                label: strings.respSelectionCriteriaLabel,
                description: strings.respSelectionCriteriaDesc,
            },

            women: {
                headingBefore: strings.respTotalTargetedPopulationHeading,
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respWomenLabel1 },
                    { text: ' ' },
                    { text: strings.respWomenLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            men: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respMenLabel1 },
                    { text: ' ' },
                    { text: strings.respMenLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            girls: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respGirlsLabel1 },
                    { text: ' ' },
                    { text: strings.respGirlsLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            boys: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respBoysLabel1 },
                    { text: ' ' },
                    { text: strings.respBoysLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            total_targeted_population: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respTotalTargetedPopulationLabel1 },
                    { text: ' ' },
                    { text: strings.respTotalTargetedPopulationLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            disability_people_per: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respDisabilityPeoplePerLabel1 },
                    { text: ' ' },
                    { text: strings.respDisabilityPeoplePerLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationPercentageDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationPercentageDescSuffix },
                ],
            },

            people_per_urban: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respPeoplePerUrbanLabel1 },
                    { text: ' ' },
                    { text: strings.respPeoplePerUrbanLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationPercentageDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationPercentageDescSuffix },
                ],
            },

            people_per_local: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respPeoplePerLocalLabel1 },
                    { text: ' ' },
                    { text: strings.respPeoplePerLocalLabel2, bold: true },
                ],
                description: [
                    { text: strings.respPopulationPercentageDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationPercentageDescSuffix },
                ],
            },

            displaced_people: {
                type: 'input',
                validation: 'number',
                label: [
                    { text: strings.respDisplacedPeopleLabel1 },
                    { text: ' ' },
                    { text: strings.respDisplacedPeopleLabel2, bold: true },
                    { text: ' ' },
                    { text: strings.respDisplacedPeopleLabel3 },
                ],
                description: [
                    { text: strings.respPopulationNumberDescPrefix, italic: true },
                    { text: ' ' },
                    { text: strings.respPopulationNumberDescSuffix },
                ],
            },

            risk_security: {
                type: 'list',
                label: strings.respRiskSecurityLabel,
                optionsKey: 'risk_security',
                children: {
                    type: 'object',
                    fields: {
                        risk: {
                            type: 'input',
                            validation: 'string',
                            label: strings.respRiskLabel,
                            description: [
                                { text: strings.respRiskDesc1, bold: true },
                                { text: ' ' },
                                { text: strings.respRiskDesc2 },
                                { text: '\n' },
                                { text: '\n' },
                                { text: strings.respRiskDesc3 },
                                { text: '\n' },
                                { text: strings.respRiskDesc4 },
                                { text: '\n' },
                                { text: strings.respRiskDesc5 },
                            ],
                        },
                        mitigation: {
                            type: 'input',
                            validation: 'string',
                            label: strings.respMitigationLabel,
                            description: [
                                { text: strings.respMitigationDesc1, bold: true },
                                { text: '\n' },
                                { text: '\n' },
                                { text: strings.respMitigationDesc2 },
                                { text: '\n' },
                                { text: strings.respMitigationDesc3 },
                            ],
                        },
                    },
                },
            },

            risk_security_concern: {
                type: 'input',
                validation: 'textArea',
                label: strings.respRiskSecurityConcernLabel,
                description: [
                    { text: strings.respRiskSecurityConcernDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respRiskSecurityConcernDesc2 },
                    { text: '\n' },
                    { text: strings.respRiskSecurityConcernDesc3 },
                    { text: '\n' },
                    { text: strings.respRiskSecurityConcernDesc4 },
                ],
            },

            has_anti_fraud_corruption_policy: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasAntiFraudCorruptionPolicyLabel,
                description: '',
            },

            has_sexual_abuse_policy: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasSexualAbusePolicyLabel,
                description: '',
            },

            has_child_protection_policy: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasChildProtectionPolicyLabel,
                description: '',
            },

            has_whistleblower_protection_policy: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasWhistleblowerProtectionPolicyLabel,
                description: '',
            },

            has_anti_sexual_harassment_policy: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasAntiSexualHarassmentPolicyLabel,
                description: '',
            },
            has_child_safeguarding_risk_analysis_assessment: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: strings.respHasChildSafeguardingRiskAnalysisAssessmentLabel,
                description: strings.respHasChildSafeguardingRiskAnalysisAssessmentDesc,
            },

            amount_requested: {
                headingBefore: strings.respPlannedInterventionsHeading,
                type: 'input',
                validation: 'number',
                label: [{ text: strings.respAmountRequestedLabel, bold: true }],
                description: strings.respAmountRequestedDesc,
            },

            planned_interventions: {
                type: 'list',
                // NOTE: This has been hidden in the shared template
                label: strings.respPlannedInterventionsLabel,
                hiddenLabel: true,
                optionsKey: 'planned_interventions',
                keyFieldName: 'title',
                children: {
                    type: 'object',
                    fields: {
                        budget: {
                            type: 'input',
                            validation: 'number',
                            label: strings.respInterventionBudgetLabel,
                            description: strings.respInterventionBudgetDesc,
                        },
                        person_targeted: {
                            type: 'input',
                            validation: 'number',
                            label: strings.respInterventionPersonTargetedLabel,
                            description: strings.respInterventionPersonTargetedDesc,
                        },
                        description: {
                            type: 'input',
                            validation: 'string',
                            label: strings.respInterventionDescriptionLabel,
                            description: [
                                { text: strings.respInterventionDescriptionDesc1 },
                                { text: '\n' },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc2 },
                                { text: '\n' },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc3 },
                                { text: '\n' },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc4, underline: true },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc5, bold: true },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc6, bold: true },
                                { text: '\n' },
                                { text: strings.respInterventionDescriptionDesc7, bold: true },
                                { text: '\n' },
                            ],
                        },
                        indicators: {
                            type: 'list',
                            label: strings.respIndicatorsLabel,
                            // NOTE: This has not been hidden in the shared
                            // template, but to make this consistent we can hide this
                            hiddenLabel: true,
                            optionsKey: 'planned_interventions_indicators',
                            children: {
                                type: 'object',
                                fields: {
                                    title: {
                                        type: 'input',
                                        validation: 'string',
                                        label: strings.respIndicatorTitleLabel,
                                        description: strings.respIndicatorTitleDesc,
                                    },
                                    target: {
                                        type: 'input',
                                        validation: 'number',
                                        label: strings.respIndicatorTargetLabel,
                                        description: strings.respIndicatorTargetDesc,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            human_resource: {
                headingBefore: strings.respAboutSupportServicesHeading,
                type: 'input',
                validation: 'textArea',
                label: strings.respHumanResourceLabel,
                description: [
                    { text: strings.respHumanResourceDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respHumanResourceDesc2 },
                    { text: '\n' },
                    { text: strings.respHumanResourceDesc3 },
                    { text: '\n' },
                    { text: strings.respHumanResourceDesc4 },
                ],
            },

            is_volunteer_team_diverse: {
                type: 'input',
                validation: 'textArea',
                label: strings.respIsVolunteerTeamDiverseLabel,
                description: strings.respIsVolunteerTeamDiverseDesc,
            },

            is_surge_personnel_deployed: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.respIsSurgePersonnelDeployedLabel,
                description: strings.respIsSurgePersonnelDeployedDesc,
            },

            surge_personnel_deployed: {
                type: 'input',
                validation: 'string',
                label: strings.respSurgePersonnelDeployedLabel,
                description: [
                    { text: strings.respSurgePersonnelDeployedDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respSurgePersonnelDeployedDesc2 },
                    { text: '\n' },
                    { text: strings.respSurgePersonnelDeployedDesc3 },
                    { text: '\n' },
                    { text: strings.respSurgePersonnelDeployedDesc4 },
                ],
            },

            logistic_capacity_of_ns: {
                type: 'input',
                validation: 'textArea',
                label: strings.respLogisticCapacityOfNsLabel,
                description: [
                    { text: strings.respLogisticCapacityOfNsDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respLogisticCapacityOfNsDesc2 },
                    { text: '\n' },
                    { text: strings.respLogisticCapacityOfNsDesc3 },
                    { text: '\n' },
                    { text: strings.respLogisticCapacityOfNsDesc4 },
                    { text: '\n' },
                    { text: strings.respLogisticCapacityOfNsDesc5 },
                    { text: '\n' },
                    { text: strings.respLogisticCapacityOfNsDesc6 },
                ],
            },

            pmer: {
                type: 'input',
                validation: 'textArea',
                label: strings.respPmerLabel,
                description: [
                    { text: strings.respPmerDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respPmerDesc2 },
                    { text: '\n' },
                    { text: strings.respPmerDesc3 },
                    { text: '\n' },
                    { text: strings.respPmerDesc4 },
                    { text: '\n' },
                    { text: strings.respPmerDesc5 },
                ],
            },

            communication: {
                type: 'input',
                validation: 'textArea',
                label: strings.respCommunicationLabel,
                description: [
                    { text: strings.respCommunicationDesc1, bold: true },
                    { text: '\n' },
                    { text: '\n' },
                    { text: strings.respCommunicationDesc2 },
                    { text: '\n' },
                    { text: strings.respCommunicationDesc3 },
                    { text: '\n' },
                    { text: strings.respCommunicationDesc4 },
                    { text: '\n' },
                    { text: strings.respCommunicationDesc5 },
                ],
            },

            // TIMEFRAME AND CONTACTS

            ns_request_date: {
                type: 'input',
                validation: 'date',
                label: strings.respNsRequestDateLabel,
                description: strings.respNsRequestDateDesc,
            },

            operation_timeframe: {
                type: 'input',
                validation: 'number',
                label: strings.respOperationTimeframeLabel,
                description: [
                    { text: strings.respOperationTimeframeDesc1 },
                    { text: ' ' },
                    { text: strings.respOperationTimeframeDesc2, bold: true },
                    { text: strings.respOperationTimeframeDesc3 },
                ],
            },
        },
    }), [strings]);

    // FIXME(imminent): confirm field guidance/cover copy with IFRC.
    const imminentSchema: TemplateSchema<DrefRequestBody, typeof optionsMap> = useMemo(() => ({
        type: 'object',
        fields: {
            // OPERATION OVERVIEW

            national_society: {
                type: 'select',
                label: strings.immNationalSocietyLabel,
                validation: 'number',
                optionsKey: 'national_society',
                description: strings.immNationalSocietyDesc,
            },

            disaster_type: {
                type: 'select',
                label: strings.immDisasterTypeLabel,
                validation: 'number',
                optionsKey: 'disaster_type',
                description: strings.immDisasterTypeDesc,
            },

            type_of_onset: {
                type: 'select',
                label: strings.immTypeOfOnsetLabel,
                validation: 'number',
                optionsKey: 'type_of_onset',
                defaultValue: optionsMap.type_of_onset.find(
                    (option) => option.key === ONSET_SUDDEN,
                )?.label,
                description: strings.immTypeOfOnsetDesc,
            },

            is_man_made_event: {
                type: 'select',
                label: strings.immIsManMadeEventLabel,
                validation: 'boolean',
                optionsKey: '__boolean',
                description: strings.immIsManMadeEventDesc,
            },

            country: {
                type: 'select',
                label: strings.immCountryLabel,
                validation: 'number',
                optionsKey: 'country',
                description: strings.immCountryDesc,
            },

            title: {
                type: 'input',
                label: strings.immTitleLabel,
                validation: 'string',
            },

            // EVENT DETAIL

            hazard_date: {
                headingBefore: strings.immDescriptionOfTheHazardHeading,
                type: 'input',
                label: strings.immHazardDateLabel,
                validation: 'date',
                description: strings.immHazardDateDesc,
            },

            hazard_date_and_location: {
                type: 'input',
                label: strings.immHazardDateAndLocationLabel,
                validation: 'textArea',
                description: strings.immHazardDateAndLocationDesc,
            },

            hazard_vulnerabilities_and_risks: {
                type: 'input',
                label: strings.immHazardVulnerabilitiesAndRisksLabel,
                validation: 'textArea',
                description: strings.immHazardVulnerabilitiesAndRisksDesc,
            },

            num_affected: {
                type: 'input',
                validation: 'number',
                label: strings.immNumAffectedLabel,
                description: strings.immNumAffectedDesc,
            },

            estimated_number_of_affected_male: {
                type: 'input',
                validation: 'number',
                label: strings.immEstimatedNumberOfAffectedMaleLabel,
            },

            estimated_number_of_affected_female: {
                type: 'input',
                validation: 'number',
                label: strings.immEstimatedNumberOfAffectedFemaleLabel,
            },

            estimated_number_of_affected_girls_under_18: {
                type: 'input',
                validation: 'number',
                label: strings.immEstimatedNumberOfAffectedGirlsUnder18Label,
            },

            estimated_number_of_affected_boys_under_18: {
                type: 'input',
                validation: 'number',
                label: strings.immEstimatedNumberOfAffectedBoysUnder18Label,
            },

            source_information: {
                type: 'list',
                label: strings.immSourceInformationLabel,
                optionsKey: 'source_information',
                children: {
                    type: 'object',
                    fields: {
                        source_name: {
                            type: 'input',
                            validation: 'string',
                            label: strings.immSourceNameLabel,
                        },
                        source_link: {
                            type: 'input',
                            validation: 'string',
                            label: strings.immSourceLinkLabel,
                            description: strings.immSourceLinkDesc,
                        },
                    },
                },
            },

            // OPERATION

            people_targeted_with_early_actions: {
                headingBefore: strings.immTargetingHeading,
                type: 'input',
                validation: 'number',
                label: strings.immPeopleTargetedWithEarlyActionsLabel,
            },

            proposed_action: {
                headingBefore: strings.immProposedActionsHeading,
                type: 'list',
                label: strings.immProposedActionsLabel,
                hiddenLabel: true,
                optionsKey: 'proposed_action_type',
                keyFieldName: 'proposed_type',
                children: {
                    type: 'object',
                    fields: {
                        total_budget: {
                            type: 'input',
                            validation: 'number',
                            label: [{ text: strings.immProposedActionBudgetLabel, bold: true }],
                            description: strings.immProposedActionBudgetDesc,
                        },
                        activities: {
                            type: 'list',
                            label: strings.immActivitiesLabel,
                            hiddenLabel: true,
                            optionsKey: 'primary_sector',
                            keyFieldName: 'sector',
                            children: {
                                type: 'object',
                                fields: {
                                    activity: {
                                        type: 'input',
                                        validation: 'textArea',
                                        label: strings.immActivityLabel,
                                        description: strings.immActivityDesc,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            is_surge_personnel_deployed: {
                headingBefore: strings.immAboutSupportServicesHeading,
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: strings.immIsSurgePersonnelDeployedLabel,
                description: strings.immIsSurgePersonnelDeployedDesc,
            },

            surge_personnel_deployed: {
                type: 'input',
                validation: 'string',
                label: strings.immSurgePersonnelDeployedLabel,
                description: strings.immSurgePersonnelDeployedDesc,
            },

            addressed_humanitarian_impacts: {
                type: 'input',
                validation: 'textArea',
                label: strings.immAddressedHumanitarianImpactsLabel,
                description: strings.immAddressedHumanitarianImpactsDesc,
            },

            // TIMEFRAME AND CONTACTS

            ns_request_date: {
                headingBefore: strings.immTimeframeHeading,
                type: 'input',
                validation: 'date',
                label: strings.immNsRequestDateLabel,
                description: strings.immNsRequestDateDesc,
            },

            operation_timeframe_imminent: {
                type: 'input',
                validation: 'number',
                label: strings.immOperationTimeframeImminentLabel,
                defaultValue: OPERATION_TIMEFRAME_IMMINENT,
                description: strings.immOperationTimeframeImminentDesc,
            },
        },
    }), [strings, optionsMap.type_of_onset]);

    const drefSchemaByType = useMemo<
        Partial<Record<TypeOfDrefEnum, TemplateSchema<DrefRequestBody, typeof optionsMap>>>
    >(() => ({
        [DREF_TYPE_RESPONSE]: responseSchema,
        [DREF_TYPE_IMMINENT]: imminentSchema,
    }), [responseSchema, imminentSchema]);

    const templateStrings = useMemo(() => ({
        columnFieldHeader: strings.columnFieldHeader,
        columnValueHeader: strings.columnValueHeader,
        columnDescriptionHeader: strings.columnDescriptionHeader,
        validationNumberError: strings.validationNumberError,
        validationIntegerError: strings.validationIntegerError,
        validationDateError: strings.validationDateError,
        validationListError: strings.validationListError,
        validationErrorTitle: strings.validationErrorTitle,
        coverTabName: strings.coverTabName,
        cover: {
            heading: strings.coverHeading,
            subHeading: strings.coverSubHeading,
            overviewHeading: strings.coverOverviewHeading,
            overviewDescription: strings.coverOverviewDescription,
            eligibilityHeading: strings.coverEligibilityHeading,
            eligibilityResponse: strings.coverEligibilityResponse,
            eligibilityImminent: strings.coverEligibilityImminent,
            noteResponse: strings.coverNoteResponse,
            noteImminent: strings.coverNoteImminent,
            howToUseHeading: strings.coverHowToUseHeading,
            howToUseDescription: strings.coverHowToUseDescription,
            structureHeading: strings.coverStructureHeading,
            structureResponse: strings.coverStructureResponse,
            structureImminent: strings.coverStructureImminent,
            stepsHeading: strings.coverStepsHeading,
            stepsDescription: strings.coverStepsDescription,
        },
    }), [strings]);

    return {
        drefSchemaByType,
        optionsMap,
        templateStrings,
    };
}

export type OptionsMapping = ReturnType<typeof useImportTemplateSchema>['optionsMap']
export type TemplateStrings = ReturnType<typeof useImportTemplateSchema>['templateStrings']

export default useImportTemplateSchema;
