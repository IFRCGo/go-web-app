import { useMemo } from 'react';

import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes, { DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import { type TemplateSchema } from '#utils/importTemplate';
import { type DrefRequestBody } from '#views/DrefApplicationForm/schema';

function useImportTemplateSchema() {
    const nationalSocieties = useNationalSociety();
    const countries = useCountry();
    const disasterTypes = useDisasterTypes();

    const {
        dref_planned_intervention_title,
        dref_national_society_action_title,
        dref_identified_need_title,
        dref_dref_onset_type,
        dref_dref_disaster_category,
    } = useGlobalEnums();

    const optionsMap = useMemo(() => ({
        __boolean: [
            {
                key: true,
                label: 'Yes',
            },
            {
                key: false,
                label: 'No',
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
        source_information: [
            { key: 'source__0', label: 'Source #1' },
            { key: 'source__1', label: 'Source #2' },
            { key: 'source__2', label: 'Source #3' },
            { key: 'source__3', label: 'Source #4' },
            { key: 'source__4', label: 'Source #5' },
        ],
        planned_interventions_indicators: [
            { key: 'indicator__0', label: 'Indicator #1' },
            { key: 'indicator__1', label: 'Indicator #2' },
            { key: 'indicator__2', label: 'Indicator #3' },
            { key: 'indicator__3', label: 'Indicator #4' },
            { key: 'indicator__4', label: 'Indicator #5' },
        ],
        risk_security: [
            { key: 'risk__0', label: 'Risk #1' },
            { key: 'risk__1', label: 'Risk #2' },
            { key: 'risk__2', label: 'Risk #3' },
            { key: 'risk__3', label: 'Risk #4' },
            { key: 'risk__4', label: 'Risk #5' },
        ],
        national_society_actions: dref_national_society_action_title?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        needs_identified: dref_identified_need_title?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
    }), [
        countries,
        disasterTypes,
        nationalSocieties,
        dref_planned_intervention_title,
        dref_national_society_action_title,
        dref_identified_need_title,
        dref_dref_onset_type,
        dref_dref_disaster_category,
    ]);

    const drefFormSchema: TemplateSchema<DrefRequestBody, typeof optionsMap> = useMemo(() => ({
        type: 'object',
        fields: {
            national_society: {
                type: 'select',
                label: 'National society',
                validation: 'number',
                optionsKey: 'national_society',
                headingBefore: 'Essential Information',
            },

            // We're skipping type of DREF since we'll have separate
            // template for each type of dref
            // type_of_dref: xxx

            disaster_type: {
                type: 'select',
                label: 'Type of disaster',
                validation: 'number',
                optionsKey: 'disaster_type',
            },

            type_of_onset: {
                type: 'select',
                label: 'Type of Onset',
                validation: 'number',
                optionsKey: 'type_of_onset',
            },

            is_man_made_event: {
                type: 'select',
                label: 'Is this a man made event?',
                validation: 'boolean',
                optionsKey: '__boolean',
            },

            disaster_category: {
                type: 'select',
                label: 'Disaster Category',
                validation: 'number',
                optionsKey: 'disaster_category',
                description: 'https://www.ifrc.org/sites/default/files/2021-07/IFRC%20Emergency%20Response%20Framework%20-%202017.pdf',
            },

            country: {
                type: 'select',
                label: 'Affected Country',
                validation: 'number',
                optionsKey: 'country',
                description: 'NOTE: You may add the targeted region during the import',
            },

            title: {
                type: 'input',
                label: 'DREF Title',
                validation: 'string',
            },

            emergency_appeal_planned: {
                type: 'select',
                label: 'Emergency appeal planned',
                optionsKey: '__boolean',
                validation: 'boolean',
            },

            // Event eventDetail
            // Previous Operations
            did_it_affect_same_area: {
                type: 'select',
                label: 'Has a similar event affected the same area(s) in the last 3 years?',
                optionsKey: '__boolean',
                validation: 'boolean',
                headingBefore: 'Previous Operation',
            },

            did_it_affect_same_population: {
                type: 'select',
                label: 'Did it affect the same population groups?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: 'Select only if you\'ve selected Yes for the above',
            },

            did_ns_respond: {
                type: 'select',
                label: 'Did the National Society respond?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: 'Select only if you\'ve selected Yes for the above',
            },

            did_ns_request_fund: {
                type: 'select',
                label: 'Did the National Society request funding from DREF for that event(s)?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: 'Select only if you\'ve selected Yes for the above',
            },

            ns_request_text: {
                type: 'input',
                label: 'If yes, please specify which operations',
                validation: 'string',
                description: 'Select only if you\'ve selected Yes for the above',
            },

            dref_recurrent_text: {
                type: 'input',
                label: 'If you have answered yes to all questions above, justify why the use of DREF for a recurrent event, or how this event should not be considered recurrent',
                validation: 'textArea',
            },

            lessons_learned: {
                type: 'input',
                label: 'Lessons Learned',
                validation: 'textArea',
                description: 'Specify how the lessons learnt from these previous operations are being used to mitigate similar challenges in the current operation',
            },

            event_date: {
                type: 'input',
                label: 'Date of the Event / Date when the trigger was met',
                validation: 'date',
                headingBefore: 'Description of the Event',
                description: 'When the `Type of Onset` is Slow, we store the input date as `Date when the trigger was met. When the `Type of Onset` is Sudden, we store the input date as `Date of the Event`.',
            },

            num_affected: {
                type: 'input',
                validation: 'number',
                label: 'Total affected population',
                description: 'People Affected include all those whose lives and livelihoods have been impacted as a direct result of the shock or stress.',
            },

            people_in_need: {
                type: 'input',
                validation: 'number',
                label: 'People in need (Optional)',
                description: 'People in Need (PIN) are those members whose physical security, basic rights, dignity, living conditions or livelihoods are threatened or have been disrupted, and whose current level of access to basic services, goods and social protection is inadequate to re-establish normal living conditions without additional assistance.',
            },

            event_description: {
                type: 'input',
                validation: 'textArea',
                label: 'What happened, where and when?',
            },

            event_scope: {
                type: 'input',
                validation: 'textArea',
                label: 'Scope and scale of the event',
                description: 'Describe the extent this hazard will produce negative impacts on lives, livelihoods, well-being and infrastructure. Explain which people are most likely to experience the impacts of this hazard? Where do they live, and why are they vulnerable? Please explain which groups (e.g elderly, children, people with disabilities, IDPs, Refugees, etc.) are most likely to be affected? Provide historic information on how communities have been affected by the magnitude of this hazard in the past?',
            },

            source_information: {
                type: 'list',
                label: 'Source Information',
                description: 'Add the links and the name of the sources, the name will be shown in the export, as an hyperlink.',
                optionsKey: 'source_information',
                children: {
                    type: 'object',
                    fields: {
                        source_name: {
                            type: 'input',
                            validation: 'string',
                            label: 'Name',
                        },
                        source_link: {
                            type: 'input',
                            validation: 'string',
                            label: 'Link',
                            description: 'Add the links and the name of the sources, the name will be shown in the export, as an hyperlink.',
                        },
                    },
                },
            },

            did_national_society: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Has the National Society started any actions?',
                headingBefore: 'Current National Society Actions',
            },

            ns_respond_date: {
                type: 'input',
                validation: 'date',
                label: 'Start date of National Society actions',
            },

            national_society_actions: {
                type: 'list',
                label: 'National Society Actions',
                keyFieldName: 'title',
                optionsKey: 'national_society_actions',
                description: 'Please indicate a description of the ongoing response with if possible: Branches involved, number of volunteers/staff involved in actions, assets deployed/distributed, number of people reach. Impact/added value of the NS in the response already ongoing.',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'textArea',
                            label: 'Description',
                        },
                    },
                },
            },

            ifrc: {
                type: 'input',
                validation: 'textArea',
                label: 'IFRC',
                description: 'Presence or not of IFRC in country (if not, indicate the cluster covering), support provided for this response, domestic coordination, technical, strategic, surge. Explain what support provided in terms of Secretariat services: PMER, Finance, Admin, HR, Security, logistics, NSD.',
                headingBefore: 'IFRC Network Actions Related To The Current Event',
            },

            partner_national_society: {
                type: 'input',
                validation: 'textArea',
                label: 'Participating National Societies',
                description: 'Briefly set out which PNS are present and give details of PNS contributions/roles on the ground and remotely for this specific operation',
            },

            icrc: {
                type: 'input',
                validation: 'textArea',
                label: 'ICRC',
                description: 'Presence or not of ICRC in country, and support directly provided for this emergency response. Other programs and support provided outside of the scope of this emergency should not be indicated here.',
                headingBefore: 'ICRC Actions Related To The Current Event',
            },

            government_requested_assistance: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Government has requested international assistance',
                headingBefore: 'Other Actors Actions Related To The Current Event',
            },

            national_authorities: {
                type: 'input',
                validation: 'textArea',
                label: 'National authorities',
            },

            un_or_other_actor: {
                type: 'input',
                validation: 'textArea',
                label: 'UN or other actors',
            },

            is_there_major_coordination_mechanism: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Are there major coordination mechanisms in place?',
            },

            major_coordination_mechanism: {
                type: 'input',
                validation: 'string',
                label: 'List coordination mechanisms/platform in place at local/district and national level. Indicate the lead authorities/agencies. How the National Society is involved/positioned in this coordination. Does the NS in any lead/co-lead role? Any identified gap/overlap in the coordination (e.g., sector missing…)?',
            },

            needs_identified: {
                type: 'list',
                label: 'Needs (Gaps) Identified',
                keyFieldName: 'title',
                optionsKey: 'needs_identified',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'textArea',
                            label: 'Description',
                        },
                    },
                },
            },

            identified_gaps: {
                type: 'input',
                validation: 'textArea',
                label: 'Any identified gaps/limitations in the assessment',
            },

            // Operation
            operation_objective: {
                type: 'input',
                validation: 'textArea',
                label: 'Overall objective of the operation',
                headingBefore: 'Objective and Strategy Rationale',
            },

            response_strategy: {
                type: 'input',
                validation: 'textArea',
                label: 'Operation strategy rationale',
            },

            people_assisted: {
                type: 'input',
                validation: 'textArea',
                label: 'Who will be targeted through this operation?',
                description: 'Explain the logic behind our targets. Which groups are we targeting and why are we targeting these particular groups? Explain how you will target vulnerable groups (e.g., Migrants, refugees, etc.)',
                headingBefore: 'Targeting Strategy',
            },

            selection_criteria: {
                type: 'input',
                validation: 'textArea',
                label: 'Explain the selection criteria for the targeted population',
                description: 'Explain the rational and logic behind which groups are being targeted and why and address vulnerable groups',
            },

            women: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: Women',
                headingBefore: 'Total Targeted Population',
            },

            men: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: Men',
            },

            girls: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: Girls (under 18)',
            },

            boys: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: Boys (under 18)',
            },

            total_targeted_population: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: Total',
            },

            disability_people_per: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: People with Disability',
            },

            people_per_urban: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: Urban',
            },

            people_per_local: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: Rural',
            },

            displaced_people: {
                type: 'input',
                validation: 'number',
                label: 'Estimated number of People on the move (if any)',
            },

            risk_security: {
                type: 'list',
                label: 'Risk and security considerations',
                optionsKey: 'risk_security',
                children: {
                    type: 'object',
                    fields: {
                        risk: {
                            type: 'input',
                            validation: 'string',
                            label: 'Risk',
                        },
                        mitigation: {
                            type: 'input',
                            validation: 'string',
                            label: 'Mitigation action',
                        },
                    },
                },
            },

            risk_security_concern: {
                type: 'input',
                validation: 'textArea',
                label: 'Please indicate any security and safety concerns for this operation',
            },

            has_child_safeguarding_risk_analysis_assessment: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: 'Has the child safeguarding risk analysis assessment been completed?',
                description: 'The IFRC Child Safeguarding Risk Analysis helps Operations quickly identify and rate their key child safeguarding risks in order to reduce the risk of harm against children, as outlined as a requirement in the IFRC Child Safeguarding Policy. Here are the link to the tool and Q&A',
            },

            amount_requested: {
                type: 'input',
                validation: 'number',
                label: 'Requested Amount in CHF',
                headingBefore: 'Planned Interventions',
            },

            planned_interventions: {
                type: 'list',
                label: 'Add the interventions that apply',
                optionsKey: 'planned_interventions',
                keyFieldName: 'title',
                children: {
                    type: 'object',
                    fields: {
                        budget: {
                            type: 'input',
                            validation: 'number',
                            label: 'Budget',
                        },
                        person_targeted: {
                            type: 'input',
                            validation: 'number',
                            label: 'Person targeted',
                        },
                        description: {
                            description: 'A list should start with an \' * \' followed by a space. There are no limits to the number of lists that can be included. \n Eg: \n * Activity XYZ \n * Activity ABC',
                            type: 'input',
                            validation: 'string',
                            label: 'List of activities',
                        },
                        indicators: {
                            type: 'list',
                            label: 'Indicators',
                            optionsKey: 'planned_interventions_indicators',
                            children: {
                                type: 'object',
                                fields: {
                                    title: {
                                        type: 'input',
                                        validation: 'string',
                                        label: 'Title',
                                    },
                                    target: {
                                        type: 'input',
                                        validation: 'number',
                                        label: 'Target',
                                    },
                                },
                            },
                        },
                    },
                },
            },

            human_resource: {
                type: 'input',
                validation: 'textArea',
                label: 'How many staff and volunteers will be involved in this operation. Briefly describe their role.',
                headingBefore: 'About Support Services',
            },

            is_surge_personnel_deployed: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Will be surge personnel be deployed?',
            },

            surge_personnel_deployed: {
                type: 'input',
                validation: 'string',
                label: 'Role profile of the deployed personnel',
                description: 'Please provide the role profile needed.',
            },

            logistic_capacity_of_ns: {
                type: 'input',
                validation: 'textArea',
                label: 'If there is procurement, will be done by National Society or IFRC?',
                description: 'Will it be for replenishment or for distribution? If for distribution, how long is the tendering expected to take? For Cash and Voucher Assistance, what is the status of the Financial Service Provider?',
            },

            pmer: {
                type: 'input',
                validation: 'textArea',
                label: 'How will this operation be monitored?',
                description: 'Will there be IFRC monitoring visits? How will it be deployed?',
            },

            communication: {
                type: 'input',
                validation: 'textArea',
                label: 'Please briefly explain the National Societies communication strategy for this operation.',
                description: 'Will the IFRC be supporting with communication? What roles will be involved?',
            },

            // Submission
            ns_request_date: {
                type: 'input',
                validation: 'date',
                label: 'Date of National Society Application',
                headingBefore: 'Operational Timeframes',
            },

            operation_timeframe: {
                type: 'input',
                validation: 'number',
                label: 'Operation timeframe',
            },
        },
    }), []);

    return {
        drefFormSchema,
        optionsMap,
    };
}

export default useImportTemplateSchema;
