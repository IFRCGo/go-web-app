import {
  docx as docxReader,
  Node,
} from 'docx4js';
import {
  isDefined,
  isNotDefined,
  listToGroupList,
  listToMap,
  randomString,
} from '@togglecorp/fujs';

import { dateToDateString } from '#utils/common';
import { NumericValueOption } from '#types';

function getChildren(node: Node | undefined, name: string) {
  if (!node || !node.children) {
    return undefined;
  }

  const accumulator: Node[] = [];

  if (node.name === name) {
    accumulator.push(node);
    return accumulator;
  }

  node.children.forEach(
    (child) => {
      const potentialNode = getChildren(child, name);

      if (potentialNode && potentialNode.length > 0) {
        accumulator.push(...potentialNode);
      }
    }
  );

  return accumulator;
}

export async function getImportData(file: File) {
  const docx = await docxReader.load(file);
  const body: Node | undefined = docx?.officeDocument?.content?._root?.children?.[1]?.children?.[0];
  const sdtList = body?.children?.map((ch: Node | undefined) => {
    const potentialNodeList = getChildren(ch, 'w:sdt');

    return potentialNodeList ?? [];
  }).flat();

  const importData = sdtList?.map((sdt) => {
    const alias = getChildren(sdt, 'w:alias');
    const textNode = getChildren(sdt, 'w:t');
    const key = alias?.[0]?.attribs?.['w:val'];
    const value = textNode?.map(
      t => t.children?.map(
        tc => tc.data
      )
    )?.flat(2)?.join('');

    if (key) {
      return { key, value };
    }

    return undefined;
  });

  return importData?.filter(isDefined);
}

interface KeyValue {
  key: string,
  value: string | undefined,
}

function getItemsWithMatchingKeys(items: KeyValue[], key: string) {
  return items.filter(item => item.key.startsWith(key));
}

function getNumberSafe(str: string | undefined) {
  if (isNotDefined(str)) {
    return undefined;
  }

  if (str === 'Enter number.') {
    return undefined;
  }

  const potentialNumber = +str;

  if (Number.isNaN(potentialNumber)) {
    return undefined;
  }

  return potentialNumber;
}

function getBooleanSafe(str: string | undefined) {
  if (str === 'Yes') {
    return true;
  }

  if (str === 'No') {
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

  return dateToDateString(date);
}

function getStringSafe(str: string | undefined) {
  if (isNotDefined(str)) {
    return undefined;
  }

  const trimmedStr = str.trim();

  if (trimmedStr === '') {
    return undefined;
  }

  if (trimmedStr === 'Click or tap here to enter text.') {
    return undefined;
  }

  if (trimmedStr === 'Enter indicator title.') {
    return undefined;
  }

  if (trimmedStr === 'Name.' || trimmedStr === 'Email.' || trimmedStr === 'Title.' || trimmedStr === 'Phone number.') {
    return undefined;
  }

  return trimmedStr;
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
    d => d.key,
    d => d.value,
  );

  const {
    affect_same_area,
    affect_same_population,
    amount_requested,
    appeal_code,
    boys,
    communication,
    disability_people_per,
    dref_recurrent_text,
    end_date,
    event_description,
    event_scope,
    girls,
    glide_code,
    government_requested_assistance,
    icrc,
    ifrc,
    lessons_learned,
    logistic_capacity_of_ns,
    major_coordination_mechanism,
    men,
    national_authorities,
    ns_request_fund,
    ns_request_text,
    ns_respond,
    num_affected,
    operation_objective,
    operation_timeframe,
    people_assisted,
    people_per_local,
    people_per_urban,
    pmer,
    response_strategy,
    risk_security_concern,
    selection_criteria,
    start_date,
    surge_personnel_deployed,
    title,
    total_targeted_population,
    un_or_other_actor,
    women,

    national_society_contact_name,
    national_society_contact_title,
    national_society_contact_email,
    national_society_contact_phone_number,

    ifrc_appeal_manager_name,
    ifrc_appeal_manager_title,
    ifrc_appeal_manager_email,
    ifrc_appeal_manager_phone_number,

    ifrc_project_manager_name,
    ifrc_project_manager_title,
    ifrc_project_manager_email,
    ifrc_project_manager_phone_number,

    ifrc_emergency_name,
    ifrc_emergency_title,
    ifrc_emergency_email,
    ifrc_emergency_phone_number,

    media_contact_name,
    media_contact_title,
    media_contact_email,
    media_contact_phone_number,
  } = importDataMap;

  const countryLabel = getStringSafe(importDataMap.country);
  const country = countryOptions.find(
    c => c.label.toLocaleLowerCase() === countryLabel?.toLocaleLowerCase(),
  )?.value;
  const disasterCategoryLabel = getStringSafe(importDataMap.disaster_category);
  const disaster_category = disasterCategoryOptions.find(
    d => d.label.toLocaleLowerCase() === disasterCategoryLabel?.toLocaleLowerCase(),
  )?.value;
  const disasterTypeLabel = getStringSafe(importDataMap.disaster_type);
  const disaster_type = disasterTypeOptions.find(
    d => d.label.toLocaleLowerCase() === disasterTypeLabel?.toLocaleLowerCase(),
  )?.value;
  const onsetLabel = getStringSafe(importDataMap.type_of_onset_display);
  const type_of_onset = onsetTypeOptions.find(
    o => o.label.toLocaleLowerCase() === onsetLabel?.toLocaleLowerCase(),
  )?.value;

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
    "shelter_housing_and_settlements",
    "livelihoods_and_basic_needs",
    "health",
    "water_sanitation_and_hygiene",
    "protection_gender_and_inclusion",
    "education",
    "migration",
    "risk_reduction_climate_adaptation_and_recovery_",
    "secretariat_services",
    "national_society_strengthening",
    "multi-purpose_cash",
    "environmental_sustainability",
    "community_engagement_and_accountability"
  ];

  const interventions = Object.values(groupedInterventions).map(
    (keyValueList, index) => {
      const mapping = listToMap(
        keyValueList,
        d => d.key,
      );

      const INDICATOR_KEY = 'indicators_';
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
        }
      );

      const title = interventionKeys[index];
      if (!title) {
        return undefined;
      }

      const indicators = Object.values(groupedIndicators).map(
        (keyValueIndicatorList) => {
          const indicatorMapping = listToMap(
            keyValueIndicatorList,
            d => d.key,
            d => d.value,
          );

          const title = getStringSafe(indicatorMapping.title);
          const target =  getNumberSafe(indicatorMapping.target);

          if (!title && isNotDefined(target)) {
            return undefined;
          }

          return {
            clientId: randomString(),
            title,
            target,
          };
        }
      ).filter(isDefined);

      const budget = getNumberSafe(mapping.budget?.value);
      const person_targeted = getNumberSafe(mapping.person_targeted?.value);
      const progress_towards_outcome = getNumberSafe(mapping.progress_toward_outcome?.value);

      if (
        isNotDefined(budget)
        && isNotDefined(person_targeted)
        && isNotDefined(progress_towards_outcome)
        && indicators.length === 0
      ) {
        return undefined;
      }

      return {
        title,
        clientId: randomString(),
        budget: getNumberSafe(mapping.budget?.value),
        person_targeted: getNumberSafe(mapping.person_targeted?.value),
        progress_towards_outcome: getNumberSafe(mapping.progress_toward_outcome?.value),
        indicators,
      };
    },
  ).filter(isDefined);

  const NS_ACTION_KEY = 'national_society_actions_';
  const nsActionItems = getItemsWithMatchingKeys(importData, NS_ACTION_KEY);
  const nsActionKeys = [
    "national_society_readiness",
    "assessment",
    "coordination",
    "resource_mobilization",
    "activation_of_contingency_plans",
    "national_society_eoc",
    "shelter_housing_and_settlements",
    "livelihoods_and_basic_needs",
    "health",
    "water_sanitation_and_hygiene",
    "protection_gender_and_inclusion",
    "education",
    "migration",
    "risk_reduction_climate_adaptation_and_recovery",
    "community_engagement_and _accountability",
    "environment_sustainability ",
    "multi-purpose_cash",
    "other"
  ];
  const national_society_actions = nsActionItems.map((nsActionItem) => {
    const order = +(nsActionItem.key.substring(
      NS_ACTION_KEY.length,
      nsActionItem.key.length,
    ));

    if (Number.isNaN(order) || isNotDefined(order) || !nsActionItem.value) {
      return undefined;
    }

    const title = nsActionKeys[order];
    if (!title) {
      return undefined;
    }

    const description = getStringSafe(nsActionItem.value);

    if (!description) {
      return undefined;
    }

    return {
      clientId: randomString(),
      title,
      description,
    };
  }).filter(isDefined);

  const NEED_KEY = 'needs_identified_';
  const needItems = getItemsWithMatchingKeys(importData, NEED_KEY);
  const needKeys = [
    "shelter_housing_and_settlements",
    "livelihoods_and_basic_needs",
    "health",
    "water_sanitation_and_hygiene",
    "protection_gender_and_inclusion",
    "education",
    "migration",
    "multi_purpose_cash_grants",
    "risk_reduction_climate_adaptation_and_recovery",
    "community_engagement_and _accountability",
    "environment_sustainability ",
    "shelter_cluster_coordination"
  ];
  const needs_identified = needItems.map((needItem) => {
    const order = +(needItem.key.substring(
      NEED_KEY.length,
      needItem.key.length,
    ));

    if (Number.isNaN(order) || isNotDefined(order) || !needItem.value) {
      return undefined;
    }

    const title = needKeys[order];

    if (!title) {
      return undefined;
    }

    const description = getStringSafe(needItem.value);
    if (!description) {
      return undefined;
    }

    return {
      clientId: randomString(),
      title,
      description,
    };
  }).filter(isDefined);

  const RISK_KEY = 'risk_';
  const riskItems = getItemsWithMatchingKeys(importData, RISK_KEY);
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
        d => d.key,
        d => d.value,
      );

      const risk = getStringSafe(mapping.security);
      const mitigation = getStringSafe(mapping.mitigation);

      if (!risk && !mitigation) {
        return undefined;
      }

      return {
        clientId: randomString(),
        risk,
        mitigation,
      };
    }
  ).filter(isDefined);

  return {
    country,
    disaster_category,
    disaster_type,
    type_of_onset,
    national_society: country,
    date_of_approval: getDateSafe(start_date),
    planned_interventions: interventions,
    national_society_actions,
    needs_identified,
    risk_security,

    affect_same_area: getBooleanSafe(affect_same_area),
    affect_same_population: getBooleanSafe(affect_same_population),
    amount_requested: getNumberSafe(amount_requested),
    appeal_code: getStringSafe(appeal_code),
    boys: getNumberSafe(boys),
    communication: getStringSafe(communication),
    disability_people_per: getNumberSafe(disability_people_per),
    dref_recurrent_text: getStringSafe(dref_recurrent_text),
    end_date: getDateSafe(end_date),
    event_description: getStringSafe(event_description),
    event_scope: getStringSafe(event_scope),
    girls: getNumberSafe(girls),
    glide_code: getStringSafe(glide_code),
    government_requested_assistance: getBooleanSafe(government_requested_assistance),
    icrc: getStringSafe(icrc),
    ifrc: getStringSafe(ifrc),
    lessons_learned: getStringSafe(lessons_learned),
    logistic_capacity_of_ns: getStringSafe(logistic_capacity_of_ns),
    major_coordination_mechanism: getStringSafe(major_coordination_mechanism),
    men: getNumberSafe(men),
    national_authorities: getStringSafe(national_authorities),
    ns_request_fund: getBooleanSafe(ns_request_fund),
    ns_request_text: getStringSafe(ns_request_text),
    ns_respond: getBooleanSafe(ns_respond),
    num_affected: getNumberSafe(num_affected),
    operation_objective: getStringSafe(operation_objective),
    operation_timeframe: getNumberSafe(operation_timeframe),
    people_assisted: getNumberSafe(people_assisted),
    people_per_local: getNumberSafe(people_per_local),
    people_per_urban: getNumberSafe(people_per_urban),
    pmer: getStringSafe(pmer),
    response_strategy: getStringSafe(response_strategy),
    risk_security_concern: getStringSafe(risk_security_concern),
    selection_criteria: getStringSafe(selection_criteria),
    start_date: getDateSafe(start_date),
    surge_personnel_deployed: getBooleanSafe(surge_personnel_deployed),
    title: getStringSafe(title),
    total_targeted_population: getNumberSafe(total_targeted_population),
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
}
