import { useMemo } from 'react';

import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes, { DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useNationalSociety from '#hooks/domain/useNationalSociety';
import { type TemplateSchema } from '#utils/importTemplate';
import { type DrefRequestBody } from '#views/DrefApplicationForm/schema';

const nationalSocietyActionsDescMap: Record<string, string> = {
    shelter_housing_and_settlements: 'Actions related to immediate shelter needs and the recovery of housing for displaced or affected populations. It includes emergency shelter provisions, housing repairs, and support for longer-term settlement planning.',
    livelihoods_and_basic_needs: 'Providing basic survival needs like food, clothing, and essential household items, as well as restoring livelihoods (e.g., farming, small businesses) to help affected communities regain economic stability.',
    multi_purpose_cash: 'Providing cash assistance that can be used flexibly by households to meet their most urgent needs, such as food, shelter, healthcare, or other expenses.',
    health: 'Healthcare services for affected communities, including medical assistance, mental health and psychosocial support, and the prevention of disease outbreaks.\n\nBackground on affected / not-affected health service delivery, supply chain, and logistics, and what different actors (hospitals, clinics, government, partners, etc…) are doing to support the health-related needs.\n\nCommon types of infectious diseases in the area / prone in that particular crisis.\n\nHow affected peopla re reacting and coping (positive and/or negative coping strategies), and what is the availability and accessibility of MHPSS services and mental health institutions.',
    water_sanitation_and_hygiene: 'Provision of clean water, adequate sanitation, and hygiene support to prevent waterborne diseases and ensure healthy living conditions.',
    protection_gender_and_inclusion: 'Protection of vulnerable groups, including women, children, older people, people with disabilities, minority groups, etc. It ensures gender-sensitive approaches and promotes inclusivity in emergency response efforts.',
    education: 'Actions related to ensuring that children and youth have access to education, even in emergencies. This includes temporary learning spaces, educational materials, and efforts to keep the youth engaged in learning during crises.',
    migration_and_displacement: 'Supporting displaced individuals and communities, including refugees, migrants, and internally displaced persons. This sector looks at safe, dignified solutions and addresses the unique needs of those on the move.',
    risk_reduction_climate_adaptation_and_recovery: 'Efforts to reduce the impact of future disasters through risk reduction strategies, climate change adaptation measures, and recovery planning to help communities become more resilient.',
    community_engagement_and_accountability: 'Ensuring affected communities are actively engaged in decision-making processes and have access to accurate information. It promotes transparency, feedback mechanisms, and accountability to those being assisted.',
    environment_sustainability: 'Ensuring that response activities are environmentally sustainable, minimising harm to the environment and integrating green practices into recovery and rehabilitation efforts.',
    coordination: 'Collaboration with other humanitarian actors, government agencies, and partners to ensure a coherent and effective response. Coordination helps avoid duplication of efforts and ensures resources are used efficiently.',
    national_society_readiness: 'Relates to the preparedness of the National Society to respond effectively to emergencies. This includes staff readiness, operational capacity, and logistical preparations.',
    assessment: 'Refers to conducting rapid needs assessments to gather essential data on the impact of the event and the specific needs of affected populations. Assessments guide the development of an appropriate response.',
    resource_mobilization: 'Securing the necessary financial, material, and human resources to support emergency response efforts, including fundraising, partnerships, and donations.',
    activation_of_contingency_plans: 'Putting pre-established emergency plans into action when a disaster occurs. Contingency plans outline specific steps to be taken in response to different scenarios.',
    national_society_eoc: 'Activation of the National Society\'s Emergency Operations Centre, which coordinates response activities, manages resources, and monitors the evolving situation during emergencies.',
    other: 'This section captures any other actions that do not fit into the above sectors but are critical to the emergency response. Be specific when describing these additional needs.',
};
const needsIdentifiedDescMap: Record<string, string> = {
    shelter_housing_and_settlements: 'Immediate shelter needs and the recovery of housing for displaced or affected populations. It includes emergency shelter provisions, housing repairs, and support for longer-term settlement planning.\n\n# houses and infrastructure damaged, type/condition of damage (total, severe, partial), availability of public facilities – evacuation shelters, schools, etc. nearby and how are they used.',
    livelihoods_and_basic_needs: 'Basic survival needs like food, clothing, and essential household items, as well as restoring livelihoods (e.g., farming, small businesses) to help affected communities regain economic stability.',
    multi_purpose_cash_grants: 'Needs and gaps related to providing cash assistance that can be used flexibly by households to meet their most urgent needs, such as food, shelter, healthcare, or other expenses.',
    health: 'Needs and gaps related to healthcare services for affected communities, including medical assistance, mental health and psychosocial support, and the prevention of disease outbreaks.',
    water_sanitation_and_hygiene: 'Gaps related to the provision of clean water, adequate sanitation, and hygiene support to prevent waterborne diseases and ensure healthy living conditions.',
    protection_gender_and_inclusion: 'Needs and gaps related to protection of vulnerable groups, including women, children, older people, people with disabilities, minority groups, etc.',
    education: 'Gaps in providing children and youth with access to education, even in emergencies. This includes disruption of the education system, insufficient temporary learning spaces, educational materials, and efforts to keep students engaged in learning during crises.',
    migration_and_displacement: 'Needs and gaps related to supporting displaced individuals and communities, including refugees, migrants, and internally displaced persons.',
    risk_reduction_climate_adaptation_and_recovery: 'Needs and gaps relate to the efforts to reduce the impact of future disasters through risk reduction strategies, climate change adaptation measures, and recovery planning to help communities become more resilient.',
    community_engagement_and_accountability: 'Needs and gaps in efforts to actively engaged in decision-making processes and have access to accurate information. Need for transparency, feedback mechanisms, and accountability to those being assisted.',
    environment_sustainability: 'Needs and gaps related to ensuring that response activities are environmentally sustainable, minimising harm to the environment and integrating green practices into recovery and rehabilitation efforts.',
};

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

    // FIXME: rename this to drefTemplateSchema
    const drefFormSchema: TemplateSchema<DrefRequestBody, typeof optionsMap> = useMemo(() => ({
        type: 'object',
        fields: {
            // OPERATION OVERVIEW

            national_society: {
                type: 'select',
                label: 'National society',
                validation: 'number',
                optionsKey: 'national_society',
                description: 'Indicate your National Society by selecting it from the drop-down list.',
            },

            // We're skipping type of DREF since we'll have separate template for each type of dref
            // type_of_dref: xxx

            disaster_type: {
                type: 'select',
                label: 'Type of disaster',
                validation: 'number',
                optionsKey: 'disaster_type',
                description: 'Select the relevant type of disaster from the drop-down list.',
            },

            type_of_onset: {
                type: 'select',
                label: 'Type of Onset',
                validation: 'number',
                optionsKey: 'type_of_onset',
                description: (
                    'Select the type of onset from the drop-down list.\n'
                    + '<b>Sudden-onset disaster</b> – a single, discrete event that occurs in a matter of days or even hours (e.g. earthquakes, flash floods).\n'
                    + '<b>Slow-onset disaster</b> - slow onset events evolve gradually from incremental changes occurring over many months/years or from an increased frequency or intensity of recurring events (e.g. Droughts, Food insecurity, Epidemics, etc.)'
                ),
            },

            is_man_made_event: {
                type: 'select',
                label: 'Is this a man made event?',
                validation: 'boolean',
                optionsKey: '__boolean',
                description: (
                    'Select <b>Yes</b> or <b>No</b> from the drop-down list.\n'
                    + '<i>Is the event caused or triggered by human interventions?</i>'
                ),
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
                description: 'Select <b>Yes</b> or <b>No</b> from the drop-down list.',
            },

            // EVENT DETAIL

            did_it_affect_same_area: {
                headingBefore: 'Previous Operation',
                type: 'select',
                label: 'Has a similar event affected the same area(s) in the <u>last 3 years</u>?',
                optionsKey: '__boolean',
                validation: 'boolean',
            },

            did_it_affect_same_population: {
                type: 'select',
                label: 'Did it affect the same population groups?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: (
                    'Indicate only if there was a similar event affecting the same area in the last 3 years.\n'
                    + 'Otherwise, leave the box empty.'
                ),
            },

            did_ns_respond: {
                type: 'select',
                label: 'Did the National Society respond?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: (
                    'Indicate only if it affected the same population groups\n'
                    + 'Otherwise, leave the box empty.'
                ),
            },

            did_ns_request_fund: {
                type: 'select',
                label: 'Did the National Society request funding from DREF for that event(s)?',
                optionsKey: '__boolean',
                validation: 'boolean',
                description: (
                    'Indicate only if the national society responded\n'
                    + 'Otherwise, leave the box empty.'
                ),
            },

            ns_request_text: {
                type: 'input',
                label: '<i>If yes, please specify which operations</i>',
                validation: 'string',
                description: (
                    'Indicate only if the national society requested funding from DREF for that event(s).\n'
                    + 'Otherwise, leave the box empty.'
                ),
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
                description: (
                    'Indicate only if there was a similar event affecting the same area in the last 3 years.\n'
                    + '\n'
                    + 'Specify how the lessons learnt from these previous operations are planned to be used to mitigate similar challenges in the current operation.\n'
                    + '\n'
                    + 'The format should be concise, actionable, and focused on a specific insight:\n'
                    + '<b>[Action or Practice] + [Outcome/Result] + [Key Takeaway or Recommendation]</b>\n'
                    + '\n'
                    + '<b>Example:</b> <i>Engaging local suppliers early in the procurement process led to faster delivery of relief items, highlighting the need to establish pre-agreed contracts with reliable vendors before emergencies.</i>'
                ),
            },

            event_date: {
                headingBefore: 'Description of the Event',
                type: 'input',
                label: 'Date of the Event / Date when the trigger was met',
                validation: 'date',
                description: 'DD/MM/YYY',
            },

            num_affected: {
                type: 'input',
                validation: 'number',
                label: 'Total affected population',
                description: 'People Affected include all those whose lives and livelihoods have been impacted as a direct result of the event.',
            },

            people_in_need: {
                type: 'input',
                validation: 'number',
                label: 'People in need <i>(Optional)</i>',
                description: 'People in Need are those members whose physical security, basic rights, dignity, living conditions or livelihoods are threatened or have been disrupted, and whose current level of access to basic services, goods and social protection is inadequate to re-establish normal living conditions without additional assistance.',
            },

            event_description: {
                type: 'input',
                validation: 'textArea',
                label: 'What happened, where and when?',
                description: (
                    '<i>Clearly describe:</i>\n'
                    + '<b>What happened:</b>\n'
                    + 'Briefly explain the nature of the emergency (e.g., flood, earthquake, epidemic). Include key details such as the intensity, and any unique aspects of the event.</b>\n'
                    + '\n'
                    + '<b>Where:</b>\n'
                    + 'Specify the geographic location(s) affected. Be as precise as possible, including names of countries, regions, cities, or specific areas impacted by the event.\n'
                    + '\n'
                    + '<b>When:</b>\n'
                    + 'Indicate the date and time when the event occurred or began. If the situation is ongoing, mention that and provide relevant updates on the timeframe.'
                ),
            },

            event_scope: {
                type: 'input',
                validation: 'textArea',
                label: 'Scope and scale of the event',
                description: (
                    'Describe how the event produces negative impacts on lives, livelihoods, well-being and infrastructure.\n'
                    + '<b>Explain which people are most likely to experience the impacts of this hazard? Where do they live, and why are they vulnerable? Please explain which groups (e.g elderly, children, people with disabilities, IDPs, Refugees, etc.) are most likely to be affected? Provide historic information on how communities have been affected by the magnitude of this hazard in the past?</b>\n'
                    + '\n'
                    + '<u>Consider the following:</u>\n'
                    + '<b>Humanitarian Impact:</b>\n'
                    + '- Are the statistics on damages and losses (e.g., number of people affected, casualties, displaced populations) clearly stated and supported by reliable data?\n'
                    + '- Is the scale of the disaster described in terms of its impact on different sectors (e.g., housing, health, water and sanitation, livelihoods)?\n'
                    + '- Are vulnerable groups (e.g., women, children, elderly, disabled) and their specific needs highlighted?\n'
                    + '<b>Extent of Damage:</b>\n'
                    + '- Does the section include detailed information on the physical destruction (e.g., homes, infrastructure, public services)?\n'
                    + '- Are economic impacts (e.g., loss of livelihoods, market disruptions) discussed in detail?\n'
                    + '<b>Comparative Analysis:</b>\n'
                    + '- If applicable, does the document compare the current disaster to previous similar events in the region to contextualize its scale?\n'
                    + '- Are there any predictions or projections about how the situation might develop, based on past experiences or current trends?\n'
                    + '<b>Sources and Validation:</b>\n'
                    + '- Are the data and statistics provided in this subsection supported by credible sources (e.g., government reports, UN agencies, credible NGOs)?\n'
                    + '- Are sources cited appropriately, ensuring transparency and the ability to verify information?'
                ),
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
                            description: 'Specify the names (up to 5) of the key information sources. If possible, provide links.\nThe names will be shown in the export as an hyperlink.',
                        },
                    },
                },
            },

            // ACTIONS NEEDS

            did_national_society: {
                headingBefore: 'Current National Society Actions',
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Has the National Society started any actions?',
                description: 'Select <b>Yes</b> or <b>No</b> from the drop-down list.',
            },

            ns_respond_date: {
                type: 'input',
                validation: 'date',
                label: 'If yes, start date of National Society actions',
                description: 'DD/MM/YYY',
            },

            national_society_actions: {
                type: 'list',
                label: 'National Society Actions',
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
                            label: '<b>Description</b>',
                            description: '<ins>national_society_actions.description</ins>',
                        },
                    },
                },
            },

            ifrc: {
                headingBefore: 'IFRC Network Actions Related To The Current Event',
                type: 'input',
                validation: 'textArea',
                label: 'IFRC',
                description: 'Presence or not of IFRC in country (if not, indicate the cluster covering). Support provided for this response, domestic coordination, technical, strategic, surge. Explain what support is being provided in terms of Secretariat services: PMER, Finance, Admin, HR, Security, logistics, NSD.',
            },

            partner_national_society: {
                type: 'input',
                validation: 'textArea',
                label: 'Participating National Societies',
                description: 'Briefly set out which PNS are present and give details of PNS contributions/roles on the ground and remotely for this specific operation',
            },

            icrc: {
                headingBefore: 'ICRC Actions Related To The Current Event',
                type: 'input',
                validation: 'textArea',
                label: 'Description',
                description: 'Presence or not of ICRC in country, and support directly provided for this emergency response. Other programs and support provided outside of the scope of this emergency should not be indicated here.',
            },

            government_requested_assistance: {
                headingBefore: 'Other Actors Actions Related To The Current Event',
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Government has requested international assistance',
                description: 'Select <b>Yes</b> or <b>No</b> from the drop-down list.',
            },

            national_authorities: {
                type: 'input',
                validation: 'textArea',
                label: 'National authorities',
                description: 'Brief description of actions taken by the national authorities.',
            },

            un_or_other_actor: {
                type: 'input',
                validation: 'textArea',
                label: 'UN or other actors',
                description: 'Brief description of actions taken by the UN or other actors.',
            },

            is_there_major_coordination_mechanism: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Are there major coordination mechanisms in place?',
                description: (
                    '- Inform on the inter-agency / inter-governmental coordination that has been formally or informally set up.\n'
                    + '- If possible, include the methods of coordination / information sharing.\n'
                    + '- If possible, include brief information how task / locations / etc. are coordinated and divided.\n'
                ),
            },

            major_coordination_mechanism: {
                type: 'input',
                validation: 'textArea',
                label: 'Major coordination mechanism',
                description: (
                    'List coordination mechanisms/platform in place at local/district and national level. Indicate the lead authorities/agencies. How the National Society is involved/positioned in this coordination. Does the NS in any lead/co-lead role? Any identified gap/overlap in the coordination (e.g., sector missing…)?\n'
                    + 'Indicate only if there are major coordination mechanism in place\n'
                    + 'Otherwise, leave the box empty.'
                ),
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
                            label: '<b>Description</b>',
                            description: '<ins>needs_identified.description</ins>',
                        },
                    },
                },
            },

            identified_gaps: {
                type: 'input',
                validation: 'textArea',
                label: 'Any identified gaps/limitations in the assessment',
                description: (
                    '<u>Consider the following:</u>\n'
                    + '\n'
                    + '- <b>Unmet needs</b>: are there specific sectors (e.g., shelter, WASH, health) where needs remain unmet or only partially addressed?\n'
                    + '- <b>Resource shortages</b>: highlight any shortages in available resources (e.g., funding, personnel, supplies) that limit the ability to meet the identified needs.\n'
                    + '- <b>Operational challenges</b>: mention any operational constraints that are preventing a full response to the needs (e.g., logistical issues, insufficient capacity).\n'
                    + '- <b>Coordination issues</b>: note any challenges in coordinating with other actors or agencies that have resulted in gaps in service delivery or response coverage.\n'
                    + '- <b>Vulnerable groups</b>: identify any specific vulnerable groups whose needs may not have been fully captured or addressed during the assessment (e.g., displaced persons, elderly, people with disabilities).\n'
                ),
            },

            // OPERATION

            operation_objective: {
                headingBefore: 'Objective and Strategy Rationale',
                type: 'input',
                validation: 'textArea',
                label: 'Overall objective of the operation',
                description: (
                    'The objective statement should clearly and concisely describe the primary goal of the operation, focusing on the humanitarian impact and the specific needs the operation aims to address.\n'
                    + '\n'
                    + '<b>The IFRC-DREF operation aims to <i>[primary action]</i> in order to <i>[desired impact]</i> for <i>[target population]</i> affected by <i>[event/disasted]</i>, by providing <i>[key services/interventions]</i> and ensuring <i>[core outcomes such as protection, dignity, and resilience]</i> over <i>[operation period]</i></b>.'
                ),
            },

            response_strategy: {
                type: 'input',
                validation: 'textArea',
                label: 'Operation strategy rationale',
                description: (
                    'Elaborate on the overall plan, strategy and approach of the operation; explain the reasoning behind the chosen strategy for the emergency operation.\n'
                    + '\n'
                    + '<b>Explain how the identified needs/gaps and actions taken/plannes are linked.</b>\n'
                    + '\n'
                    + '- Highlight the most urgent needs the operation aims to address.\n'
                    + '- Describe the main priorities and explain why these priorities were chosed based on the specific context of the emergency.\n'
                    + '- Justify why particular methods and actions were selected and how they are expected to achieve the desired outcomes.\n'
                    + '- Include any key factors that influence the strategy; mention how these factors were considered in shaping the operation.'
                ),
            },

            people_assisted: {
                headingBefore: 'Targeting Strategy',
                type: 'input',
                validation: 'textArea',
                label: 'Who will be targeted through this operation?',
                description: (
                    'Explain the logic behind the targets. Which groups are targeted and why these particular groups? Explain how you will target vulnerable groups (e.g., Migrants, refugees, pregnant women, older people, etc.)\n'
                    + '\n'
                    + 'Mention if any data were used to identify who is most vulnerable.'
                ),
            },

            selection_criteria: {
                type: 'input',
                validation: 'textArea',
                label: 'Explain the selection criteria for the targeted population',
                description: 'Explain the rational and logic behind which groups are being targeted and why and address vulnerable groups',
            },

            women: {
                headingBefore: 'Total Targeted Population',
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: <b>Women</b>',
                description: '<i>Number, e.g. XX,XXX.</i>',
            },

            men: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: <b>Men</b>',
                description: '<i>Number, e.g. XX,XXX.</i>',
            },

            girls: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: <b>Girls (under 18)</b>',
                description: '<i>Number, e.g. XX,XXX.</i>',
            },

            boys: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: <b>Boys (under 18)</b>',
                description: '<i>Number, e.g. XX,XXX.</i>',
            },

            total_targeted_population: {
                type: 'input',
                validation: 'number',
                label: 'Targeted Population: <b>Total</b>',
                description: '<i>Number, e.g. XX,XXX.</i>',
            },

            disability_people_per: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: <b>People with Disability</b>',
                description: '<i>Percentage, e.g. XX%.</i>',
            },

            people_per_urban: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: <b>Urban</b>',
                description: '<i>Percentage, e.g. XX%.</i>',
            },

            people_per_local: {
                type: 'input',
                validation: 'number',
                label: 'Estimated Percentage: <b>Rural</b>',
                description: '<i>Percentage, e.g. XX%.</i>',
            },

            displaced_people: {
                type: 'input',
                validation: 'number',
                label: 'Estimated number of <b>People on the move</b> (if any)',
                description: '<i>Number, e.g. XX,XXX.</i>',
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
                            label: '<b>Risk</b>',
                            description: (
                                '<b>Identify up to 5 key potential risks or threats that could negatively impact the success of the operation.</b> These can range from environmental risks to social or logistical challenges.\n'
                                + '\n'
                                + '- What are the primary risks that could affect the operation’s implementation?\n'
                                + '- Are there any context-specific risks that need to be considered?\n'
                                + '- How might these risks impact the operation’s objectives, timeline, or resources?'
                            ),
                        },
                        mitigation: {
                            type: 'input',
                            validation: 'string',
                            label: '<b>Mitigation action</b>',
                            description: (
                                '<b>Actions or strategies that will be implemented to reduce or manage the identified risks, ensuring the operation can proceed as planned.</b>\n'
                                + '\n'
                                + '- What specific measures or strategies will be put in place to mitigate the risks identified?\n'
                                + '- Will contingency plans or additional resources be required to address these risks?'
                            ),
                        },
                    },
                },
            },

            risk_security_concern: {
                type: 'input',
                validation: 'textArea',
                label: 'Please indicate any security and safety concerns for this operation',
                description: (
                    '<b>Describe any specific security or safety threats that could impact the safety of personnel, volunteers, and communities during the operation.</b>\n'
                    + '\n'
                    + '- Are there any security concerns related to the areas where the operation will take place (e.g., conflict zones, high-crime areas)?\n'
                    + '- What safety risks could impact the well-being of staff, volunteers, or beneficiaries (e.g., dangerous terrain, health risks)?\n'
                    + '- Are there any specific security protocols or measures that need to be established or followed during the operation?'
                ),
            },

            has_child_safeguarding_risk_analysis_assessment: {
                type: 'select',
                optionsKey: '__boolean',
                validation: 'boolean',
                label: 'Has the child safeguarding risk analysis assessment been completed?',
                description: 'The IFRC Child Safeguarding Risk Analysis helps Operations quickly identify and rate their key child safeguarding risks in order to reduce the risk of harm against children, as outlined as a requirement in the IFRC Child Safeguarding Policy.',
            },

            amount_requested: {
                headingBefore: 'Planned Interventions',
                type: 'input',
                validation: 'number',
                label: '<b>Requested Amount in CHF</b>',
                description: 'General funding requested to fund the interventions.',
            },

            planned_interventions: {
                type: 'list',
                // NOTE: This has been hidden in the shared template
                label: 'Add the interventions that apply',
                hiddenLabel: true,
                optionsKey: 'planned_interventions',
                keyFieldName: 'title',
                children: {
                    type: 'object',
                    fields: {
                        budget: {
                            type: 'input',
                            validation: 'number',
                            label: '<b>Budget</b>',
                            description: 'Budget planned to be spent on the activities under this sector.',
                        },
                        person_targeted: {
                            type: 'input',
                            validation: 'number',
                            label: '<b>Person targeted</b>',
                            description: 'Number of people planned to be reached through the activities under this sector.',
                        },
                        description: {
                            type: 'input',
                            validation: 'string',
                            label: '<b>List of activities</b>',
                            description: (
                                'Specific activities that will be carried out as part of the intervention in each sector. The activities should directly address the identified needs and align with the operation’s strategic objectives.\n'
                                + '\n'
                                + '- What specific actions will be taken in this sector to meet the identified needs?\n'
                                + '\n'
                                + 'A list should start with an \' * \' followed by a space. There are no limits to the number of lists that can be included.\n'
                                + '\n'
                                + '<u>Example</u>:\n'
                                + '<b>* Activity A</b>\n'
                                + '<b>* Activity B</b>\n'
                                + '<b>* Activity B</b>\n'
                            ),
                        },
                        indicators: {
                            type: 'list',
                            label: 'Indicators',
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
                                        label: 'Title',
                                        description: (
                                            'Start by choosing indicators from the IFRC indicator databank whenever possible. This makes it easier to compare and analyse results across all emergency operations.\n'
                                            + '\n'
                                            + 'Pick indicators that align with the planned activities. This ensures that the indicators accurately reflect the actions being taken on the ground. Missing important indicators could mean missed chances to showcase the positive impact of the work being done.\n'
                                            + '\n'
                                            + 'Keep in mind that more indicators can mean more work. Each indicator selected requires monitoring, tracking, and reporting, so be sure to choose the ones that best reflect the key outcomes of your actions.\n'
                                            + '\n'
                                            + 'Consider the type of indicator unit. For example, it’s often simpler and clearer to track and report on the “number of people” rather than a “percentage of people.”'
                                        ),
                                    },
                                    target: {
                                        type: 'input',
                                        validation: 'number',
                                        label: 'Target',
                                        description: 'For each indicator, set a target. This helps track progress and measure whether the operation is achieving its key objectives, making it easier to report results later on.',
                                    },
                                },
                            },
                        },
                    },
                },
            },

            human_resource: {
                headingBefore: 'About Support Services',
                type: 'input',
                validation: 'textArea',
                label: 'How many staff and volunteers will be involved in this operation. Briefly describe their role.',
                description: (
                    '<b>Overview of the human resources that will be engaged in the operation, including both staff and volunteers.</b>\n'
                    + '\n'
                    + '- How many staff members and volunteers are expected to participate?\n'
                    + '- What specific roles or responsibilities will they have during the operation?\n'
                    + '- Are there any key leadership positions or coordinators overseeing the activities?'
                ),
            },

            is_surge_personnel_deployed: {
                type: 'select',
                validation: 'boolean',
                optionsKey: '__boolean',
                label: 'Will be surge personnel be deployed?',
                description: 'Select <b>Yes</b> or <b>No</b> from the drop-down list.',
            },

            surge_personnel_deployed: {
                type: 'input',
                validation: 'string',
                label: 'Role profile of the deployed personnel',
                description: (
                    '<b>Describe the skills and qualifications/profile of the surge personnel or any additional staff (to be) deployed specifically for the operation.</b>\n'
                    + '\n'
                    + '- What expertise or skill sets are required for the personnel being deployed?\n'
                    + '- What roles will these personnel fulfil?\n'
                    + '- Are there specific tasks or sectors they will be managing?'
                ),
            },

            logistic_capacity_of_ns: {
                type: 'input',
                validation: 'textArea',
                label: 'If there is procurement, will be done by National Society or IFRC?',
                description: (
                    '<b>Explain the responsibility for procurement activities during the operation.</b>\n'
                    + '\n'
                    + '- Who will be responsible for procurement (National Society or IFRC)?\n'
                    + '- Will procurement involve local or international suppliers?\n'
                    + '- Will it be for replenishment or for distribution? \n'
                    + '- If for distribution, how long is the tendering expected to take? \n'
                    + '- For Cash and Voucher Assistance, what is the status of the Financial Service Provider?'
                ),
            },

            pmer: {
                type: 'input',
                validation: 'textArea',
                label: 'How will this operation be monitored?',
                description: (
                    '<b>Describe the mechanisms that will be used to track the progress and effectiveness of the operation.</b>\n'
                    + '\n'
                    + '- What systems will be used to monitor the operation\'s activities and outcomes?\n'
                    + '- How will progress be tracked, and who will be responsible for monitoring?\n'
                    + '- What indicators or milestones will be used to assess the success of the operation?\n'
                    + '- Will there be IFRC monitoring visits? How will it be deployed?'
                ),
            },

            communication: {
                type: 'input',
                validation: 'textArea',
                label: 'Please briefly explain the National Societies communication strategy for this operation.',
                description: (
                    '<b>Describe how the National Society will manage internal and external communication throughout the operation.</b>\n'
                    + '\n'
                    + '- What communication channels will be used to share information internally among teams and externally with stakeholders, partners, and the public?\n'
                    + '- How will the National Society ensure transparent and effective communication with the affected communities?\n'
                    + '- Is there a media strategy in place for external communication, such as press releases or social media updates?\n'
                    + '- Will the IFRC be supporting with communication? What roles will be involved?'
                ),
            },

            // TIMEFRAME AND CONTACTS

            ns_request_date: {
                type: 'input',
                validation: 'date',
                label: 'Date of National Society Application',
                description: 'DD/MM/YYY',
            },

            operation_timeframe: {
                type: 'input',
                validation: 'number',
                label: 'Operation timeframe',
                description: 'Indicate the number of months, e.g. <b>4</b>.',
            },
        },
    }), []);

    return {
        drefFormSchema,
        optionsMap,
    };
}

export type OptionsMapping = ReturnType<typeof useImportTemplateSchema>['optionsMap']

export default useImportTemplateSchema;
