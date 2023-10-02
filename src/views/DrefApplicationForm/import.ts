import {
    docx as docxReader,
    Node,
} from 'docx4js';
import {
    encodeDate,
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
    randomString,
    isFalsyString,
} from '@togglecorp/fujs';

function getChildren(node: Node | undefined, name: string) {
    if (isNotDefined(node) || isNotDefined(node.children)) {
        return undefined;
    }

    if (node.name === name) {
        return [node];
    }

    const nodeList = node.children.reduce(
        (acc, child) => {
            const potentialNode = getChildren(child, name);

            if (potentialNode && potentialNode.length > 0) {
                acc.push(...potentialNode);
            }

            return acc;
        },
        [] as Node[],
    );

    return nodeList;
}

interface KeyValue {
    key: string,
    value: string | undefined,
}

// TODO: this is not used we should remove it
export async function getImportData(file: File) {
    const docx = docxReader.load(file);

    // eslint-disable-next-line no-underscore-dangle
    const body: Node | undefined = docx?.officeDocument?.content
        ?._root?.children?.[1]?.children?.[0];
    const sdtList = body?.children?.map((ch: Node | undefined) => {
        // w:sdt is a standard block
        const potentialNodeList = getChildren(ch, 'w:sdt');

        return potentialNodeList ?? [];
    }).flat();

    const importData = sdtList?.map((sdt): KeyValue | undefined => {
        const alias = getChildren(sdt, 'w:alias');
        const textNode = getChildren(sdt, 'w:t');
        const dateNode = getChildren(sdt, 'w:date');
        const key = alias?.[0]?.attribs?.['w:val'];

        const dateValue = dateNode?.[0]?.attribs?.['w:fullDate'];
        let value;

        if (dateValue) {
            value = dateValue;
        } else {
            value = textNode?.flatMap(
                (t) => t.children?.flatMap(
                    (tc) => tc.data,
                ),
            )?.join('');
        }

        if (key) {
            return { key, value };
        }

        return undefined;
    });

    return importData?.filter(isDefined);
}

function getItemsWithMatchingKeys(items: KeyValue[], key: string, exceptions?: string[]) {
    const filteredItems = items.filter((item) => item.key.startsWith(key));

    if (isNotDefined(exceptions) || exceptions.length <= 0) {
        return filteredItems;
    }

    const exceptionMap = listToMap(
        exceptions,
        (d) => d,
        () => true,
    );
    return filteredItems.filter((item) => !exceptionMap[item.key]);
}

function getNumberSafe(str: string | undefined) {
    if (isNotDefined(str)) {
        return undefined;
    }

    const trimmedStr = str.trim();

    if (trimmedStr === '') {
        return undefined;
    }

    /* This will be automatically handled
    if (trimmedStr === 'Enter number.') {
        return undefined;
    }
    */

    const potentialNumber = +trimmedStr;

    if (Number.isNaN(potentialNumber)) {
        return undefined;
    }

    return potentialNumber;
}

function getBooleanSafe(str: string | undefined) {
    if (isNotDefined(str)) {
        return undefined;
    }

    const trimmedStr = str.trim().toLowerCase();

    if (trimmedStr === 'yes') {
        return true;
    }

    if (trimmedStr === 'no') {
        return false;
    }

    return undefined;
}

function getDateSafe(str: string | undefined) {
    if (isNotDefined(str)) {
        return undefined;
    }

    const date = new Date(str);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    return encodeDate(date);
}

function getStringSafe(str: string | undefined) {
    if (isNotDefined(str)) {
        return undefined;
    }

    const trimmedStr = str.trim();

    if (trimmedStr === '') {
        return undefined;
    }

    const ignoredStrings: Record<string, boolean> = {
        'Click or tap here to enter text.': true,
        'Enter indicator title.': true,
        'Name.': true,
        'Email.': true,
        'Title.': true,
        'Phone number': true,
    };

    if (ignoredStrings[trimmedStr]) {
        return undefined;
    }

    return trimmedStr;
}

function getFromOptions(options: NumericValueOption[], label: string | undefined) {
    return options.find(
        (c) => c.label.toLocaleLowerCase() === label?.toLocaleLowerCase(),
    )?.value;
}

interface NumericValueOption {
  value: number;
  label: string;
}

export function transformImport(
    importData: KeyValue[],
    countryOptions: NumericValueOption[],
    disasterCategoryOptions: NumericValueOption[],
    disasterTypeOptions: NumericValueOption[],
    onsetTypeOptions: NumericValueOption[],
) {
    const importDataMap = listToMap(
        importData,
        (d) => d.key,
        (d) => d.value,
    );

    // Currently type of dref is identified by
    // number of fields in the import document
    const numFieldsToType: Record<number, string> = {
        219: 'slow-sudden',
        221: 'imminent',
        197: 'assessment',
    };

    const importType = numFieldsToType[importData.length];

    // NOTE: the fields are not exactly same as dref form fields
    const {
        affect_same_area,
        affect_same_population,
        amount_requested,
        anticipatory_actions,
        appeal_code,
        boys,
        communication,
        // country,
        disability_people_per,
        // disaster_category,
        // disaster_type,
        // district_details,
        dref_recurrent_text,
        end_date,
        event_description,
        event_scope,
        event_text,
        event_date,
        girls,
        glide_code,
        government_requested_assistance,
        icrc,
        ifrc,
        ifrc_appeal_manager_email,
        ifrc_appeal_manager_name,
        ifrc_appeal_manager_phone_number,
        ifrc_appeal_manager_title,
        ifrc_emergency_email,
        ifrc_emergency_name,
        ifrc_emergency_phone_number,
        ifrc_emergency_title,
        ifrc_project_manager_email,
        ifrc_project_manager_name,
        ifrc_project_manager_phone_number,
        ifrc_project_manager_title,
        lessons_learned,
        logistic_capacity_of_ns,
        major_coordination_mechanism,
        media_contact_email,
        media_contact_name,
        media_contact_phone_number,
        media_contact_title,
        men,
        national_authorities,
        national_society_contact_email,
        national_society_contact_name,
        national_society_contact_phone_number,
        national_society_contact_title,
        ns_request_fund,
        ns_request_text,
        ns_respond,
        num_affected,
        operation_objective,
        operation_timeframe,
        partner_national_society,
        people_assisted,
        people_per_local,
        people_per_urban,
        people_targeted_with_early_actions,
        pmer,
        response_strategy,
        risk_security_concern,
        selection_criteria,
        start_date,
        surge_personnel_deployed,
        title,
        total_targeted_population,
        // type_of_onset_display,
        un_or_other_actor,
        volunteers,
        women,
    } = importDataMap;

    const countryLabel = getStringSafe(importDataMap.country);
    const disasterCategoryLabel = getStringSafe(importDataMap.disaster_category);
    const disasterTypeLabel = getStringSafe(importDataMap.disaster_type);
    const onsetLabel = getStringSafe(importDataMap.type_of_onset_display);

    const country = getFromOptions(countryOptions, countryLabel);
    const disaster_category = getFromOptions(disasterCategoryOptions, disasterCategoryLabel);
    const disaster_type = getFromOptions(disasterTypeOptions, disasterTypeLabel);
    const type_of_onset = getFromOptions(onsetTypeOptions, onsetLabel);

    const INTERVENTION_KEY = 'intervention.';
    const interventionItems = getItemsWithMatchingKeys(importData, INTERVENTION_KEY);
    const groupedInterventions = listToGroupList(
        interventionItems,
        (d) => {
            const splits = d.key.split('_');
            return splits[splits.length - 1];
        },
        (d) => {
            const lastIndex = d.key.lastIndexOf('_');
            const newKey = d.key.substring(INTERVENTION_KEY.length, lastIndex);

            return {
                ...d,
                key: newKey,
            };
        },
    );

    const interventionKeys = [
        'shelter_housing_and_settlements',
        'livelihoods_and_basic_needs',
        'health',
        'water_sanitation_and_hygiene',
        'protection_gender_and_inclusion',
        'education',
        'migration',
        'risk_reduction_climate_adaptation_and_recovery_',
        'secretariat_services',
        'national_society_strengthening',
        'multi-purpose_cash',
        'environmental_sustainability',
        'community_engagement_and_accountability',
    ];

    const interventions = Object.values(groupedInterventions).map(
        (keyValueList, index) => {
            const mapping = listToMap(
                keyValueList,
                (d) => d.key,
            );

            const INDICATOR_KEY = 'indicators_';
            // Indicators are stored as list of strings with children joined by .
            const indicatorItems = getItemsWithMatchingKeys(keyValueList, INDICATOR_KEY);
            const groupedIndicators = listToGroupList(
                indicatorItems,
                (d) => {
                    const tempKey = d.key.substring(INDICATOR_KEY.length, d.key.length);
                    return tempKey.split('.')[0];
                },
                (d) => {
                    const tempKey = d.key.substring(INDICATOR_KEY.length, d.key.length);
                    const newKey = tempKey.split('.')[1];

                    return {
                        ...d,
                        key: newKey,
                    };
                },
            );

            const interventionTitle = interventionKeys[index];
            if (isFalsyString(interventionTitle)) {
                return undefined;
            }

            const indicators = Object.values(groupedIndicators).map(
                (keyValueIndicatorList) => {
                    const indicatorMapping = listToMap(
                        keyValueIndicatorList,
                        (d) => d.key,
                        (d) => d.value,
                    );

                    const indicatorTitle = getStringSafe(indicatorMapping.title);
                    const target = getNumberSafe(indicatorMapping.target);

                    if (isFalsyString(indicatorTitle) && isNotDefined(target)) {
                        return undefined;
                    }

                    return {
                        client_id: randomString(),
                        title: indicatorTitle,
                        target,
                    };
                },
            ).filter(isDefined);

            const budget = getNumberSafe(mapping.budget?.value);
            const person_targeted = getNumberSafe(mapping.person_targeted?.value);
            const description = getStringSafe(mapping.progress_towards_outcome?.value);

            if (
                isNotDefined(budget)
                && isNotDefined(person_targeted)
                && isNotDefined(description)
                && indicators.length === 0
            ) {
                return undefined;
            }

            return {
                title: interventionTitle,
                client_id: randomString(),
                budget,
                person_targeted,
                description,
                indicators,
            };
        },
    ).filter(isDefined);

    const NS_ACTION_KEY = 'national_society_actions_';
    const nsActionItems = getItemsWithMatchingKeys(importData, NS_ACTION_KEY);
    const nsActionKeys = [
        'national_society_readiness',
        'assessment',
        'coordination',
        'resource_mobilization',
        'activation_of_contingency_plans',
        'national_society_eoc',
        'shelter_housing_and_settlements',
        'livelihoods_and_basic_needs',
        'health',
        'water_sanitation_and_hygiene',
        'protection_gender_and_inclusion',
        'education',
        'migration',
        'risk_reduction_climate_adaptation_and_recovery',
        'community_engagement_and _accountability',
        'environment_sustainability ',
        'multi-purpose_cash',
        'other',
    ];
    const national_society_actions = nsActionItems.map((nsActionItem) => {
        if (isFalsyString(nsActionItem.value)) {
            return undefined;
        }

        const order = getNumberSafe(
            nsActionItem.key.substring(
                NS_ACTION_KEY.length,
                nsActionItem.key.length,
            ),
        );

        if (isNotDefined(order)) {
            return undefined;
        }

        const nsActionTitle = nsActionKeys[order];
        if (isFalsyString(nsActionTitle)) {
            return undefined;
        }

        const description = getStringSafe(nsActionItem.value);

        if (isFalsyString(description)) {
            return undefined;
        }

        return {
            client_id: randomString(),
            title: nsActionTitle,
            description,
        };
    }).filter(isDefined);

    const NEED_KEY = 'needs_identified_';
    const needItems = getItemsWithMatchingKeys(importData, NEED_KEY);
    const needKeys = [
        'shelter_housing_and_settlements',
        'livelihoods_and_basic_needs',
        'health',
        'water_sanitation_and_hygiene',
        'protection_gender_and_inclusion',
        'education',
        'migration',
        'multi_purpose_cash_grants',
        'risk_reduction_climate_adaptation_and_recovery',
        'community_engagement_and _accountability',
        'environment_sustainability ',
        'shelter_cluster_coordination',
    ];
    const needs_identified = needItems.map((needItem) => {
        const order = +(needItem.key.substring(
            NEED_KEY.length,
            needItem.key.length,
        ));

        if (Number.isNaN(order) || isNotDefined(order) || isFalsyString(needItem.value)) {
            return undefined;
        }

        const needTitle = needKeys[order];

        if (isFalsyString(needTitle)) {
            return undefined;
        }

        const description = getStringSafe(needItem.value);
        if (isFalsyString(description)) {
            return undefined;
        }

        return {
            client_id: randomString(),
            title: needTitle,
            description,
        };
    }).filter(isDefined);

    // risks are stored in list of string separated by _
    const RISK_KEY = 'risk_';
    const riskItems = getItemsWithMatchingKeys(importData, RISK_KEY, ['risk_security_concern']);
    const groupedRisks = listToGroupList(
        riskItems,
        (d) => {
            const splits = d.key.split('_');
            return splits[splits.length - 1];
        },
        (d) => {
            const lastIndex = d.key.lastIndexOf('_');
            const newKey = d.key.substring(RISK_KEY.length, lastIndex);

            return {
                ...d,
                key: newKey,
            };
        },
    );

    const risk_security = Object.values(groupedRisks).map(
        (keyValueList) => {
            const mapping = listToMap(
                keyValueList,
                (d) => d.key,
                (d) => d.value,
            );

            const risk = getStringSafe(mapping.security);
            const mitigation = getStringSafe(mapping.mitigation);

            if (isFalsyString(risk) && isFalsyString(mitigation)) {
                return undefined;
            }

            return {
                client_id: randomString(),
                risk,
                mitigation,
            };
        },
    ).filter(isDefined);

    const commonFields = {
        amount_requested: getNumberSafe(amount_requested),
        appeal_code: getStringSafe(appeal_code),
        boys: getNumberSafe(boys),
        country,
        // date_of_approval: getDateSafe(start_date),
        disability_people_per: getNumberSafe(disability_people_per),
        disaster_category,
        disaster_type,
        end_date: getDateSafe(end_date),
        event_description: getStringSafe(event_description),
        event_date: getDateSafe(event_date),
        girls: getNumberSafe(girls),
        glide_code: getStringSafe(glide_code),
        government_requested_assistance: getBooleanSafe(government_requested_assistance),
        human_resource: getStringSafe(volunteers),
        icrc: getStringSafe(icrc),
        ifrc: getStringSafe(ifrc),
        is_there_major_coordination_mechanism: isDefined(
            getStringSafe(major_coordination_mechanism),
        ) ? true : undefined,
        major_coordination_mechanism: getStringSafe(major_coordination_mechanism),
        men: getNumberSafe(men),
        national_authorities: getStringSafe(national_authorities),
        national_society: country,
        national_society_actions,
        num_affected: getNumberSafe(num_affected),
        num_assisted: getNumberSafe(total_targeted_population),
        operation_objective: getStringSafe(operation_objective),
        operation_timeframe: getNumberSafe(operation_timeframe),
        partner_national_society: getStringSafe(partner_national_society),
        people_assisted: getStringSafe(people_assisted),
        people_per_local: getNumberSafe(people_per_local),
        people_per_urban: getNumberSafe(people_per_urban),
        planned_interventions: interventions,
        response_strategy: getStringSafe(response_strategy),
        risk_security,
        risk_security_concern: getStringSafe(risk_security_concern),
        selection_criteria: getStringSafe(selection_criteria),
        start_date: getDateSafe(start_date),
        is_surge_personnel_deployed: isDefined(
            getStringSafe(surge_personnel_deployed),
        ) ? true : undefined,
        surge_personnel_deployed: getStringSafe(surge_personnel_deployed),
        title: getStringSafe(title),
        // total_targeted_population: getNumberSafe(total_targeted_population),
        type_of_onset,
        un_or_other_actor: getStringSafe(un_or_other_actor),
        women: getNumberSafe(women),
        national_society_contact_name: getStringSafe(national_society_contact_name),
        national_society_contact_title: getStringSafe(national_society_contact_title),
        national_society_contact_email: getStringSafe(national_society_contact_email),
        national_society_contact_phone_number: getStringSafe(national_society_contact_phone_number),
        ifrc_appeal_manager_name: getStringSafe(ifrc_appeal_manager_name),
        ifrc_appeal_manager_title: getStringSafe(ifrc_appeal_manager_title),
        ifrc_appeal_manager_email: getStringSafe(ifrc_appeal_manager_email),
        ifrc_appeal_manager_phone_number: getStringSafe(ifrc_appeal_manager_phone_number),
        ifrc_project_manager_name: getStringSafe(ifrc_project_manager_name),
        ifrc_project_manager_title: getStringSafe(ifrc_project_manager_title),
        ifrc_project_manager_email: getStringSafe(ifrc_project_manager_email),
        ifrc_project_manager_phone_number: getStringSafe(ifrc_project_manager_phone_number),
        ifrc_emergency_name: getStringSafe(ifrc_emergency_name),
        ifrc_emergency_title: getStringSafe(ifrc_emergency_title),
        ifrc_emergency_email: getStringSafe(ifrc_emergency_email),
        ifrc_emergency_phone_number: getStringSafe(ifrc_emergency_phone_number),
        media_contact_name: getStringSafe(media_contact_name),
        media_contact_title: getStringSafe(media_contact_title),
        media_contact_email: getStringSafe(media_contact_email),
        media_contact_phone_number: getStringSafe(media_contact_phone_number),
    };

    if (importType === 'assessment') {
        return {
            ...commonFields,
            is_assessment_report: true,
        };
    }

    const commonInSlowSuddenAndImminnent = {
        affect_same_area: getBooleanSafe(affect_same_area),
        affect_same_population: getBooleanSafe(affect_same_population),
        communication: getStringSafe(communication),
        dref_recurrent_text: getStringSafe(dref_recurrent_text),
        event_scope: getStringSafe(event_scope),
        lessons_learned: getStringSafe(lessons_learned),
        logistic_capacity_of_ns: getStringSafe(logistic_capacity_of_ns),
        needs_identified,
        ns_request_fund: getBooleanSafe(ns_request_fund),
        ns_request_text: getStringSafe(ns_request_text),
        ns_respond: getBooleanSafe(ns_respond),
        pmer: getStringSafe(pmer),
    };

    if (importType === 'slow-sudden') {
        return {
            ...commonFields,
            ...commonInSlowSuddenAndImminnent,
        };
    }

    const imminentFields = {
        anticipatory_actions: getStringSafe(anticipatory_actions),
        event_text: getStringSafe(event_text),
        people_targeted_with_early_actions: getNumberSafe(people_targeted_with_early_actions),
    };

    return {
        ...commonFields,
        ...commonInSlowSuddenAndImminnent,
        ...imminentFields,
    };
}
