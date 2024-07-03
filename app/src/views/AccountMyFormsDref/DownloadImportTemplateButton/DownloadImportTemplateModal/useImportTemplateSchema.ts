import { useMemo } from 'react';

import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
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
            ({ id, name }) => ({ key: id, label: name }),
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
        ],
        planned_interventions__indicators: [
            { key: 'indicator__0', label: 'Indicator #1' },
            { key: 'indicator__1', label: 'Indicator #2' },
            { key: 'indicator__2', label: 'Indicator #3' },
        ],
        risk_security: [
            { key: 'risk__0', label: 'Risk #1' },
            { key: 'risk__1', label: 'Risk #2' },
            { key: 'risk__2', label: 'Risk #3' },
        ],
        national_society_actions: dref_national_society_action_title?.map(
            ({ key, value }) => ({ key, label: value }),
        ) ?? [],
        identified_needs: dref_identified_need_title?.map(
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
            },

            country: {
                type: 'select',
                label: 'Country',
                validation: 'number',
                optionsKey: 'country',
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
                validation: 'string',
            },

            lessons_learned: {
                type: 'input',
                label: 'Lessons Learned',
                validation: 'string',
                description: 'Specify how the lessons learnt from these previous operations are being used to mitigate similar challenges in the current operation',
            },

            event_date: {
                type: 'input',
                label: 'Date of the Event',
                validation: 'date',
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
                validation: 'string',
                label: 'What happened, where and when?',
            },

            event_scope: {
                type: 'input',
                validation: 'string',
                label: 'Scope and scale of the event',
            },

            source_information: {
                type: 'list',
                label: 'Source Information',
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
                        },
                    },
                },
            },

            did_national_society: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Has the National Society started any actions?',
            },

            national_society_actions: {
                type: 'list',
                label: 'National Society Actions',
                keyFieldName: 'title',
                optionsKey: 'national_society_actions',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'string',
                            label: 'Description',
                        },
                    },
                },
            },

            ifrc: {
                type: 'input',
                validation: 'string',
                label: 'IFRC',
            },

            partner_national_society: {
                type: 'input',
                validation: 'string',
                label: 'Participating National Societies',
            },

            icrc: {
                type: 'input',
                validation: 'string',
                label: 'ICRC',
            },

            government_requested_assistance: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Government has requested international assistance',
            },

            national_authorities: {
                type: 'input',
                validation: 'string',
                label: 'National authorities',
            },

            un_or_other_actor: {
                type: 'input',
                validation: 'string',
                label: 'UN or other actors',
            },

            is_there_major_coordination_mechanism: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Are there major coordination mechanisms in place?',
            },

            needs_identified: {
                type: 'list',
                label: 'Identified Needs',
                optionsKey: 'identified_needs',
                children: {
                    type: 'object',
                    fields: {
                        description: {
                            type: 'input',
                            validation: 'string',
                            label: 'Description',
                        },
                    },
                },
            },

            identified_gaps: {
                type: 'input',
                validation: 'string',
                label: 'Any identified gaps/limitations in the assessment',
            },

            // Operation
            operation_objective: {
                type: 'input',
                validation: 'string',
                label: 'Overall objective of the operation',
            },

            response_strategy: {
                type: 'input',
                validation: 'string',
                label: 'Operation strategy rationale',
            },

            people_assisted: {
                type: 'input',
                validation: 'string',
                label: 'Who will be targeted through this operation?',
            },

            selection_criteria: {
                type: 'input',
                validation: 'string',
                label: 'Explain the selection criteria for the targeted population',
            },

            women: {
                type: 'input',
                validation: 'number',
                label: 'Women',
            },

            men: {
                type: 'input',
                validation: 'number',
                label: 'Men',
            },

            girls: {
                type: 'input',
                validation: 'number',
                label: 'Girls',
            },

            boys: {
                type: 'input',
                validation: 'number',
                label: 'Boys (under 18)',
            },

            total_targeted_population: {
                type: 'input',
                validation: 'number',
                label: 'Total Population',
            },

            disability_people_per: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage People with Disability',
            },

            people_per_urban: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage (Urban to Rural)',
            },

            displaced_people: {
                type: 'input',
                validation: 'number',
                label: 'Estimated number of People on the move (if any)',
            },

            risk_security: {
                type: 'list',
                label: 'Please indicate about potential operational risk for this operations and mitigation actions',
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
                validation: 'string',
                label: 'Please indicate any security and safety concerns for this operation',
            },

            has_child_safeguarding_risk_analysis_assessment: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: 'Has the child safeguarding risk analysis assessment been completed?',
            },

            amount_requested: {
                type: 'input',
                validation: 'number',
                label: 'Requested Amount in CHF',
            },

            planned_interventions: {
                type: 'list',
                label: 'Planned interventions',
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
                            type: 'input',
                            validation: 'string',
                            label: 'List of activities',
                        },
                        indicators: {
                            type: 'list',
                            label: 'Indicators',
                            optionsKey: 'planned_interventions__indicators',
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
                validation: 'string',
                label: 'How many staff and volunteers will be involved in this operation. Briefly describe their role.',
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
                label: 'Description',
            },

            logistic_capacity_of_ns: {
                type: 'input',
                validation: 'string',
                label: 'If there is procurement, will be done by National Society or IFRC?',
            },

            pmer: {
                type: 'input',
                validation: 'string',
                label: 'How will this operation be monitored?',
            },

            communication: {
                type: 'input',
                validation: 'string',
                label: 'Please briefly explain the National Societies communication strategy for this operation.',
            },

            // Submission
            ns_request_date: {
                type: 'input',
                validation: 'date',
                label: 'Date of National Society Application',
            },

            submission_to_geneva: {
                type: 'input',
                validation: 'date',
                label: 'Date of Submission to GVA',
            },

            date_of_approval: {
                type: 'input',
                validation: 'date',
                label: 'Date of Approval',
            },

            operation_timeframe: {
                type: 'input',
                validation: 'number',
                label: 'Operation timeframe',
            },

            end_date: {
                type: 'input',
                validation: 'date',
                label: 'End date of Operation',
            },

            publishing_date: {
                type: 'input',
                validation: 'date',
                label: 'Date of Publishing',
            },

            appeal_code: {
                type: 'input',
                validation: 'string',
                label: 'Appeal Code',
            },

            glide_code: {
                type: 'input',
                validation: 'string',
                label: 'GLIDE number',
            },

            ifrc_appeal_manager_name: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Appeal Manager Name',
            },

            ifrc_appeal_manager_title: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Appeal Manager Title',
            },

            ifrc_appeal_manager_email: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Appeal Manager Email',
            },

            ifrc_appeal_manager_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Appeal Manager Phone Number',
            },

            ifrc_project_manager_name: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Project Manager Name',
            },

            ifrc_project_manager_title: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Project Manager Title',
            },

            ifrc_project_manager_email: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Project Manager Email',
            },

            ifrc_project_manager_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'IFRC Project Manager Phone Number',
            },

            national_society_contact_name: {
                type: 'input',
                validation: 'string',
                label: 'National Society Contact Name',
            },

            national_society_contact_title: {
                type: 'input',
                validation: 'string',
                label: 'National Society Contact Title',
            },

            national_society_contact_email: {
                type: 'input',
                validation: 'string',
                label: 'National Society Contact Email',
            },

            national_society_contact_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'National Society Contact Phone Number',
            },

            ifrc_emergency_name: {
                type: 'input',
                validation: 'string',
                label: 'IFRC focal point for the emergency Name',
            },

            ifrc_emergency_title: {
                type: 'input',
                validation: 'string',
                label: 'IFRC focal point for the emergency Title',
            },

            ifrc_emergency_email: {
                type: 'input',
                validation: 'string',
                label: 'IFRC focal point for the emergency Email',
            },

            ifrc_emergency_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'IFRC focal point for the emergency Phone number',
            },

            regional_focal_point_name: {
                type: 'input',
                validation: 'string',
                label: 'DREF Regional Focal Point Name',
            },

            regional_focal_point_title: {
                type: 'input',
                validation: 'string',
                label: 'DREF Regional Focal Point Title',
            },

            regional_focal_point_email: {
                type: 'input',
                validation: 'string',
                label: 'DREF Regional Focal Point Email',
            },

            regional_focal_point_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'DREF Regional Focal Point Phone Number',
            },

            media_contact_name: {
                type: 'input',
                validation: 'string',
                label: 'Media Contact Name',
            },

            media_contact_title: {
                type: 'input',
                validation: 'string',
                label: 'Media Contact Title',
            },

            media_contact_email: {
                type: 'input',
                validation: 'string',
                label: 'Media Contact Email',
            },

            media_contact_phone_number: {
                type: 'input',
                validation: 'string',
                label: 'Media Contact Phone Number',
            },
        },
    }), []);

    return {
        drefFormSchema,
        optionsMap,
    };
}

export default useImportTemplateSchema;
