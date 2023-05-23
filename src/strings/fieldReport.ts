const fieldReport = {
    fieldReportResourceNotFound: 'Resource Not Found.',
    fieldReportResourceNotFoundDescr: 'The resource doesn\'t exist – mistyped URL or removed content.',
    fieldReportResourceNotPublic: 'This page is not public.',
    fieldReportResourceNotPublicDescr: 'Please log in to access this page!',
    fieldReportResourceNotAuthrzd: 'Access not authorized.',
    fieldReportResourceNotAuthrzdDescr: 'You are not authorized to access this page, due to its visibility restrictions.',
    fieldReportGoToLogin: 'Go to login page',
    fieldReportSummaryTitle: 'IFRC GO - {reportName}',
    fieldReportEdit: 'Edit Report',
    fieldReportRiskAnalyisis: 'Risk Analysis',
    fieldReportDescription: 'Description',
    fieldReportDateOfData: 'Date of Data',
    fieldReportForecastedDate: 'Forecasted Date of Impact',
    fieldReportStartDate: 'Start Date',
    fieldReportCovidReport: 'COVID-19 Field Report',
    fieldReportRequest: 'Requests for Assistance',
    fieldReportGovernmentRequest: 'Government Requests International Assistance: ',
    fieldReportInternationalRequest: 'NS Requests International Assistance:',
    fieldReportInformationBulletin: 'Information Bulletin Published',
    fieldReportActionTaken: 'Actions taken by others',
    fieldReportActionTakenBy: 'Actions taken by {orgDisplayName}',
    fieldReportSources: 'Sources',
    fieldReportContacts: 'Contacts',
    fieldReportCases: 'Cases: ',
    fieldReportSuspectedCases: 'Suspected Cases: ',
    fieldReportProbableCases: 'Probable Cases: ',
    fieldReportConfirmedCases: 'Confirmed Cases: ',
    fieldReportDeadCases: 'Dead: ',
    fieldReportCasesSince: 'Number of new cases since last Field Report',
    fieldReportDeathsSince: 'Number of new deaths since last Field Report',
    fieldReportSource: 'Source',
    fieldReportLocalStaff: 'Local Staff: ',
    fieldReportVolunteers: 'Volunteers: ',
    fieldReportDelegates: 'Delegates: ',
    fieldReportInjured: 'Injured (RC): ',
    fieldReportMissing: 'Missing (RC): ',
    fieldReportDead: 'Dead (RC): ',
    fieldReportDisplaced: 'Displaced (RC): ',
    fieldReportAffected: 'Affected (RC):',
    fieldReportInjuredGov: 'Injured (Government): ',
    fieldReportMissingGov: 'Missing (Government): ',
    fieldReportDeadGov: 'Dead (Government):',
    fieldReportDisplacedGov: 'Displaced (Government): ',
    fieldReportAffectedGov: 'Affected (Government): ',
    fieldReportInjuredOther: 'Injured (Other): ',
    fieldReportMissingOther: 'Missing (Other): ',
    fieldReportDeadOther: 'Dead (Other): ',
    fieldReportDisplacedOther: 'Displaced (Other): ',
    fieldReportAffectedOther: 'Affected (Other): ',
    fieldReportAsstdByRCRC: 'Assisted (RC):',
    fieldReportAsstdByGov: 'Assisted (Government):',
    fieldReportAsstdByOther: 'Assisted (Other):',
    fieldReportIfrcStaff: 'IFRC Staff:',
    fieldReportPotentiallyAffected: 'Potentially Affected (RC): ',
    fieldReportHighestRisk: 'People at Highest Risk (RC): ',
    fieldReportAffectedPop: 'Affected Pop Centres (RC):',
    fieldReportPotentiallyAffectedGov: 'Potentially Affected (Government): ',
    fieldReportHighestRiskGov: 'People at Highest Risk (Government): ',
    fieldReportPotentiallyAffectedOther: 'Potentially Affected (Other): ',
    fieldReportHighestRiskOther: 'People at Highest Risk (Other): ',
    fieldReportAffectedPopOther: 'Affected Pop Centres (Other): ',
    fieldReportNumericTitle: 'Numeric details',
    fieldReportSourcesOther: 'Sources for data marked as Other',
    fieldReportNationalSocietyLabel: 'National Society',
    fieldReportIFRCLabel: 'IFRC',
    fieldReportPNSLabel: 'any other RCRC Movement actors',
    fieldReportDistricts: 'Districts',
    fieldReportRegions: 'Regions',
    fieldReportNumIFRCstaff: 'IFRC Staff',
    fieldReportReportDate: 'Report Date',
    fieldReportVisibility: 'Visibility',
    fieldsStep1SummaryLabel: 'Title *',
    fieldsStep1SummaryDescription: 'The title is automatically populated based on your selection above with the date of this report. You may edit it with any required details. The report number will be automatically generated and added to the end of the title.',
    fieldsStep1DisasterTypeLabel: 'Disaster Type *',
    fieldsStep1DisasterTypeDescription: 'If Covid-19 select “Epidemic” as the disaster type',
    fieldsStep1StartDateLabelStartDate: 'Start Date *',
    fieldsStep1StartDateLabelEPI: 'Start Date of emergency/outbreak *',
    fieldsStep1StartDateDescriptionEVT: 'Start date is when some significant effects are felt or when the first significant impact is felt.',
    fieldsStep1StartDateDescriptionEPI: 'The date when the first case is confirmed.',
    fieldsStep1StartDateLabelEW: 'Forecasted Date of Impact *',
    fieldsStep1StartDateDescriptionEW: 'Date at which significant impacts are forecasted to occur.',
    fieldsStep1CountryLabelAffected: 'Affected Country and Province / Region *',
    fieldsStep1CountryLabelEW: 'Potentially Affected Country and Province / Region *',
    fieldsStep1CountryDescriptionEW: 'Anticipated Affected Country and Province / Region',
    fieldsStep1AssistanceLabel: 'Government requests international assistance?',
    fieldsStep1AssistanceDescription: 'Indicate if the government requested international assistance.',
    fieldsStep1NSAssistanceLabel: 'National Society requests international assistance?',
    fieldsStep1NSAssistanceDescription: 'Indicate if the National Society requested international assistance.',
    fieldsStep2HeaderDescription: 'Note that it is not required to put case numbers into your Field Report, but you can input them if you choose to. WHO or your national Government authoritative figures should be used.',
    fieldsStep2OrganizationsEVTEWLabelRC: 'Red Cross / Red Crescent',
    fieldsStep2OrganizationsEVTEWLabelGovernment: 'Government',
    fieldsStep2OrganizationsLabelOther: 'Other',
    // not used -   fieldsStep2OrganizationsEPILabelHealthMinistry: 'Ministry of Health',
    // not used -   fieldsStep2OrganizationsEPILabelWHO: 'World Health Organization',
    fieldsStep2SituationFieldsEVTInjuredLabel: 'Injured',
    fieldsStep2SituationFieldsEVTInjuredDescription: 'Number of people suffering from physical injuries, trauma or an illness requiring immediate medical treatment as a direct result of a disaster.',
    fieldsStep2SituationFieldsEVTDeadLabel: 'Dead',
    fieldsStep2SituationFieldsEVTDeadDescription: 'Number of people confirmed dead.',
    fieldsStep2SituationFieldsEVTMissingLabel: 'Missing',
    fieldsStep2SituationFieldsEVTMissingDescription: 'Number of people missing.',
    fieldsStep2SituationFieldsEVTAffectedLabel: 'Affected',
    fieldsStep2SituationFieldsEVTAffectedDescription: 'Number of people requiring immediate assistance during a period of emergency; this may include displaced or evacuated people.',
    fieldsStep2SituationFieldsEVTDisplacedLabel: 'Displaced',
    fieldsStep2SituationFieldsEVTDisplacedDescription: 'Number of people displaced.',
    fieldsStep2SituationFieldsEPICasesLabel: 'Cumulative Cases',
    fieldsStep2SituationFieldsEPICasesDescription: 'Number of registered cases since the start of the outbreak.',
    fieldsStep2SituationFieldsEPISuspectedCasesLabel: 'Suspected Cases',
    fieldsStep2SituationFieldsEPISuspectedCasesDescription: 'Number of suspected cases.',
    fieldsStep2SituationFieldsEPIProbableCasesLabel: 'Probable Cases',
    fieldsStep2SituationFieldsEPIProbableCasesDescription: 'Probable Cases.',
    fieldsStep2SituationFieldsEPIConfirmedCasesLabel: 'Confirmed Cases',
    fieldsStep2SituationFieldsEPIConfirmedCasesDescription: 'Confirmed Cases.',
    fieldsStep2SituationFieldsEPIDeadLabel: 'Cumulative Dead',
    fieldsStep2SituationFieldsEPIDeadDescription: 'Number of people confirmed dead since the start of the outbreak.',
    fieldsStep2SituationFieldsEWPotentiallyAffectedLabel: 'Potentially Affected',
    fieldsStep2SituationFieldsEWPotentiallyAffectedDescription: 'Number of people that are located in the geographic area where the hazard is likely to impact',
    fieldsStep2SituationFieldsEWHighestRiskLabel: 'People at Highest Risk',
    fieldsStep2SituationFieldsEWHighestRiskDescription: 'Number of people that are located in the geographic area where the hazard\'s impact is likely to be the highest',
    fieldsStep2SituationFieldsEWAffectedPopCenteresLabel: 'Largest Population Centres Likely to be Affected',
    fieldsStep2SituationFieldsEWAffectedPopCenteresDescription: 'Names of large cities or towns which are most at risk',
    fieldsStep2SituationFieldsDateEPILabel: 'Date of Data',
    // not used -   fieldsStep2SituationFieldsDateEPIEstimationLabel: 'The key figures
    // above are reported as of this date',
    fieldsStep2SituationFieldsDateEPIDescription: 'Date of figures reported.',
    fieldsStep2SituationFieldsEPICasesSinceDesciption: 'Number of registered cases since the last field report',
    fieldsStep2SituationFieldsEPIDeathsSinceDescription: 'Number of confirmed dead since the last field report',
    fieldsStep2NotesLabel: 'Notes',
    fieldsStep2SourceOfFiguresLabel: 'Source (of figures)',
    fieldsStep2DescriptionEVTLabel: 'Situational Overview',
    fieldsStep2DescriptionEVTDescription: 'Describe the effects of the hazard, the current context, the affected population and how they have been affected.',
    fieldsStep2DescriptionEVTPlaceholder: 'Example: According to the local government, the overflow of the Zimbizi river has caused extensive flood water damage to low income housing along the river bank. The majority of the affected households do not have sufficient insurance coverage for their assets. The local branch of the National Society is currently assessing how to best support the most vulnerable families affected by the disaster.',
    fieldsStep2DescriptionEPILabel: 'Situational Overview',
    fieldsStep2DescriptionEPIDescription: 'Describe the primary and secondary effects on the health system and affected population.',
    fieldsStep2DescriptionEPICOVDescription: `These questions are meant to function as a guide only:
  Since the last Field Report:
  - How has the situation evolved?
  - How is the situation affecting your National Society and activities?
  - Has this situation resulted in changes to the way your NS operates?
  - How has the population been affected?
  - Are particular groups or geographic locations being impacted more than others and why?`,
    fieldsStep2DescriptionEPIPlaceholder: 'Description of the epidemic',
    fieldsStep2DescriptionCOVIDPlaceholder: 'Describe succinctly (bullet points, short statements) the primary and secondary effects. Please outline how the situation is evolving and what has changed since the last field report. Below are some guiding questions to help complete this section.',
    fieldsStep2DescriptionEWLabel: 'Risk Analysis',
    fieldsStep2DescriptionEWDescription: 'Brief overview of the potential disaster and projected impacts',
    fieldsStep2DescriptionEWPlaceholder: 'Hurricane Sirius is expected to hit the Whinging region early Tuesday morning. The system currently has sustained core wind speeds of 140km/h and gusts up to 170 km/h. The local government has started evacuating thousands of people. The Red Cross branch in Whinging has deployed staff and volunteers to communities at risk to support evacuation and to assist the population in protecting themselves and their livelihoods from the impacts of Sirius.',
    fieldsStep2SituationFieldsEstimation: 'Estimation',
    fieldsStep2EPINotes: 'Notes: Please provide any additional details since the last field report about new geographic locations that are being affected, details on if certain population groups are being affected, and general perspective on if the situation is improving or deteriorating.',
    fieldsStep3Section1FieldsAssistedGovEVTEPILabel: 'Assisted by Government',
    fieldsStep3Section1FieldsAssistedGovEWLabel: 'Number of People Assisted by Government - Early Action',
    fieldsStep3Section1FieldsAssistedRCRCEVTEPILabel: 'Assisted by RCRC Movement',
    fieldsStep3Section1FieldsAssistedRCRCEWLabel: 'Number of People Assisted by RCRC Movement - Early Action',
    fieldsStep3Section1FieldsLocalStaffEVTEPILabel: 'Number of NS Staff Involved',
    fieldsStep3Section1FieldsVolunteersEVTEPILabel: 'Number of NS Volunteers Involved',
    fieldsStep3Section1FieldsExpatsEVTEPILabel: 'Number of RCRC Partner Personnel Involved',
    fieldsStep3Section1FieldsExpatsEVTEPIDescription: 'Personnel from IFRC, ICRC & PNS',
    fieldsStep3CheckboxSectionsNSActionsEVTEPILabel: 'Actions Taken by National Society Red Cross (if any)',
    fieldsStep3CheckboxSectionsNSActionsEWLabel: 'Early Actions Taken by NS',
    fieldsStep3CheckboxSectionsNSActionsEVTEPIDescription: 'Since the beginning of the response, what activities has your NS undertaken? A short description is available for each activity and if your NS has been active in this area during this response, please select it by checking the box. There is a section to provide a description of the activities supported, in this section please focus on what is new since the last field report.',
    fieldsStep3CheckboxSectionsNSActionsEWDescription: 'Select the early action activities undertaken by the National Society and give a brief description',
    fieldsStep3CheckboxSectionsNSActionsEVTPlaceholder: 'Example: The two local branches of the National Society in the affected districts have provided first aid, psychosocial support and basic relief items to the affected families. An evacuation centre has been set up in a local school to accommodate those unable to return to their homes. Groups of Red Cross volunteers are helping the local search and rescue personnel in cleaning storm debris from houses and streets.',
    fieldsStep3CheckboxSectionsNSActionsEPIEWPlaceholder: 'Brief description of the action',
    fieldsStep3CheckboxSectionsFederationActionsEVTEPILabel: 'Actions taken by the IFRC',
    fieldsStep3CheckboxSectionsFederationActionsEWLabel: 'Early Actions Taken by IFRC',
    fieldsStep3CheckboxSectionsFederationActionsEVTEPIDescription: 'Select the activities taken by the IFRC (could be the Regional office, cluster office or country office) and briefly describe.',
    fieldsStep3CheckboxSectionsFederationActionsEPICOVDescription: `In this section you can provide details as to how you have been working with the IFRC in this operation. To help in completing this section some prompting questions are below which are meant to function as a guide only:
  - What role has the IFRC been playing in this operation?
  - What actions has the IFRC taken to support this operation?
  - What are the recent changes in the actions taken by the IFRC since the last field report?
  - Are there any areas where you hope IFRC can support with?`,
    fieldsStep3CheckboxSectionsFederationActionsEWDescription: 'Select the early action activities undertaken by the IFRC and give a brief description',
    fieldsStep3CheckboxSectionsFederationActionsEVTEPIEWPlaceholder: 'Brief description of the action',
    fieldsStep3CheckboxSectionsPNSActionsEVTLabel: 'Actions taken by any other RCRC Movement actors',
    // not used -   fieldsStep3CheckboxSectionsPNSActionsEPILabel: 'Actions
    // taken by other RCRC Movement',
    fieldsStep3CheckboxSectionsPNSActionsEWLabel: 'Early Action Taken by other RCRC Movement',
    fieldsStep3CheckboxSectionsPNSActionsEVTEPIDescription: 'Select the activities undertaken by any other RCRC Movement actor(s) and briefly describe.',
    fieldsStep3CheckboxSectionsPNSActionsEPICOVDescription: `We understand multiple partners may be present so please highlight the main partners you have worked with since the last field report. Below are some guiding questions to help complete this section. These questions are meant to function as a guide only:
  - Since the last Field Report who has your NS been working with and in what areas of support?
  - Are there any interesting details about these RCRC partners that are not covered in the 3W?
  - Are there any new partnerships that your NS may be working with looking forward?`,
    fieldsStep3CheckboxSectionsPNSActionsEWDescription: 'Select the early action activities undertaken by the RCRC Movement and give a brief description.',
    fieldsStep3CheckboxSectionsPNSActionsEVTEPIEWPlaceholder: 'Brief description of the action',
    fieldsStep3ActionsOthersEVTEPILabel: 'Actions Taken by Others (Governments, UN)',
    // not used -   fieldsStep3ActionsOthersEWLabel: 'Early
    // Actions Taken by Others (Governments, UN)',
    fieldsStep3ActionsOthersEVTEPIDescription: 'Who else was involved? UN agencies? NGOs? Government? Describe what other actors did. Also mention who the other actors are.',
    fieldsStep3ActionsOthersEPICOVDescription: 'Who else is your National Society working with? UN agencies? NGOs? Government? Since the last field report, outline the main actors your NS has been engaged with. We understand there may be many partners so please just highlight the main ones since the last field report.',
    // not used -   fieldsStep3ActionsOthersEWDescription: 'List the early action activities
    // undertaken by other actors, mention who the other actors are, and give a brief description.',
    fieldsStep3ActionsNotesPlaceholder: 'If selected any of the activities above, please provide brief details as to how individuals were reached by the activities listed above. We encourage you to consult the previous field report and to note any changes in actions (have new activities started or concluded?). Please highlight any key successes or challenges or unique learnings.',
    // not used -   fieldsStep3ExternalPartnersLabel: 'External partners',
    // not used -   fieldsStep3SupportedActivitiesLabel: 'Supported/partnered activities',
    fieldsStep3CombinedLabelExternalSupported: 'External partners / Supported activities',
    fieldsStep3TooltipDescriptionRCRC: 'Number of people who have received RCRC services to prevent COVID-19 transmission or provide healthcare, social, or economic services to reduce the impact of COVID-19. Note one person may receive multiple services.',
    fieldsStep3TooltipDescriptionNS: 'Number of people currently involved in the response (mobilized for this specific response).',
    fieldsStep3TooltipDescriptionVolunteers: 'Number of people currently involved in the response (mobilized for this specific response).',
    fieldsStep4PlannedResponseRowsDREFValueFieldLabel: 'Amount CHF',
    fieldsStep4PlannedResponseRowsDREFEVTEPILabel: 'DREF Requested',
    // not used -   fieldsStep4PlannedResponseRowsDREFEWLabel: 'DREF',
    fieldsStep4PlannedResponseRowsEmergencyAppealValueFieldLabel: 'Amount CHF',
    fieldsStep4PlannedResponseRowsEmergencyAppealEVTEPIEWLabel: 'Emergency Appeal',
    fieldsStep4PlannedResponseRowsFactValueFieldLabel: 'Number of people',
    fieldsStep4PlannedResponseRowsFactEVTEPIEWLabel: 'Rapid Response Personnel',
    // not used -   fieldsStep4PlannedResponseRowsFactDescription: 'This is the new
    // name for FACT/RDRT/RIT',
    fieldsStep4PlannedResponseRowsIFRCStaffValueFieldLabel: 'Units',
    fieldsStep4PlannedResponseRowsIFRCStaffEVTEPIEWLabel: 'Emergency Response Units',
    fieldsStep4PlannedResponseRowsForecastBasedActionValueFieldLabel: 'Amount CHF',
    fieldsStep4PlannedResponseRowsForecastBasedActionEWLabel: 'Forecast Based Action',
    fieldsStep4ContactRowsOriginatorLabel: 'Originator',
    fieldsStep4ContactRowsOriginatorEVTEPIEWDesc: 'NS or IFRC Staff completing the Field Report.',
    fieldsStep4ContactRowsNSContactLabel: 'National Society Contact',
    fieldsStep4ContactRowsNSContactEVTEPIDesc: 'The most senior staff in the National Society responsible and knowledgeable about the disaster event.',
    // not used -   fieldsStep4ContactRowsNSContactEWDesc: 'The most senior staff
    // in the NS responsible and knowledgeable about the risk.',
    fieldsStep4ContactRowsFederationContactLabel: 'IFRC Focal Point for the Emergency',
    fieldsStep4ContactRowsFederationContactEVTEPIDesc: 'IFRC staff who is overall responsible for supporting the NS in its response to the disaster event.',
    // not used -   fieldsStep4ContactRowsFederationContactEWDesc: 'IFRC staff who is overall
    // responsible for supporting the NS in its response to the anticipated disaster event',
    fieldsStep4ContactRowsMediaContactLabel: 'Media Contact',
    fieldsStep4ContactRowsMediaContactEVTEPIEWDesc: 'An IFRC secretariat media contact in Geneva/Region or Country.',

    fieldReportConstantStatusEarlyWarningLabel: 'Early Warning / Early Action',
    fieldReportConstantStatusEarlyWarningDescription: 'First report for this hazard.',
    fieldReportConstantStatusEventLabel: 'Event',
    fieldReportConstantStatusEventDescription: 'First report for this disaster.',

    fieldReportConstantVisibility: 'Visibility',
    fieldReportConstantVisibilityPublicLabel: 'Public',
    fieldReportConstantVisibilityRCRCMovementLabel: 'RCRC Movement',
    fieldReportConstantVisibilityIFRCSecretariatLabel: 'IFRC Secretariat',
    fieldReportConstantVisibilityIFRCandNSLabel: 'IFRC and NS',
    fieldReportConstantVisibilityPublicTooltipTitle: 'Available to all stakeholders on the GO platform',
    fieldReportConstantVisibilityRCRCMovementTooltipTitle: 'Available to those who have an IFRC GO login across the RCRC Movement',
    fieldReportConstantVisibilityIFRCSecretariatTooltipTitle: 'Available to only those with an active IFRC account',
    fieldReportConstantVisibilityIFRCandNSTooltipTitle: 'Available to only those with an active IFRC account or NS assignment',

    // not used -   fieldReportEWEPIError: 'Early Warning / Early action
    // cannot be selected when disaster type is Epidemic or vice-versa',
    fieldReportFormNonFieldError: 'Please fill in required fields first!',
    // not used -   fieldReportFormSubmitError: 'Could not submit field report',
    fieldReportFormErrorLabel: 'Error:',
    // not used -   fieldReportFormLoadDataErrorMessage: 'Failed to load Form Data',
    // not used -   fieldReportFormErrorInFormMessage: 'There are errors in the form',
    fieldReportFormRedirectMessage: 'Field report updated, redirecting...',
    fieldReportFormItemContextLabel: 'Context',
    fieldReportFormItemSituationLabel: 'Situation',
    fieldReportFormItemRiskAnalysisLabel: 'Risk Analysis',
    fieldReportFormItemActionsLabel: 'Actions',
    fieldReportFormItemEarlyActionsLabel: 'Early Actions',
    fieldReportFormItemResponseLabel: 'Response',

    fieldReportFormStatusLabel: 'Status *',
    fieldReportFormCovidLabel: 'COVID-19 Related Event *',

    fieldReportFormOptionYesLabel: 'Yes',
    fieldReportFormOptionNoLabel: 'No',
    fieldReportFormOptionPlannedLabel: 'Planned',
    fieldReportFormOptionPublishedLabel: 'Yes/Published',

    fieldReportFormTitleSecondaryLabel: 'Add Title',
    fieldReportFormTitleSelectLabel: 'Please check for, and link to an existing emergency if available',
    fieldReportFormTitleInputPlaceholder: 'Example: Cyclone Cody',
    fieldReportFormTitleSelectPlaceholder: 'Click here to link to an existing hazard alert (if one exists)',

    fieldReportFormCountryLabel: 'Country',
    fieldReportFormStartDateLabel: 'Start date',
    fieldReportFormDisasterTypeLabel: 'Disaster type',

    // not used -   fieldReportFormCountrySelectPlaceholder: 'Select a country',
    // not used -   fieldReportFormRegionSelectPlaceholder: 'Select Provinces / Regions',

    // not used -   fieldReportFormEPISourceOfFiguresLabel: 'Source (of figures)',

    fieldReportFormSourceDetailsLabel: 'Source Details',
    fieldReportFormSourceDetailsPlaceholder: 'Add details for data with sources marked as Other above.',
    fieldReportFormSourceDetailsEPIPlaceholder: 'Add resource url for situation report',
    fieldReportFormSourceDetailsDescription: 'Add details for sources above (if applicable)',

    // not used -   fieldReportFormActionDataLoadingMessage: 'Loading Actions Data...',
    fieldReportFormActionTakenTitle: 'Actions taken',

    fieldReportFormInformationBulletinLabel: 'Information Bulletin',
    fieldReportFormInformationBulletinDescription: 'Indicate if an Information Bulletin was published, is planned or if no Information Bulletin will be issued for this operation/disaster/hazard.',

    fieldReportFormOthersActionsPlaceholder: 'Brief description of the action',
    fieldReportFormResponseTitle: 'Planned Interventions',
    // not used -   fieldReportFormResponseTitleEVT: 'Planned Response',
    fieldReportFormResponseLabel: 'Planned International Response',
    fieldReportFormResponseDescription: 'Indicate status of global and regional tools.',
    fieldReportFormContactsTitle: 'Contacts',

    fieldReportFormVisibilityLabel: 'This field report is visible to',
    fieldReportFormPageTitle: 'IFRC GO - New Field Report',
    fieldReportUpdateFormPageTitle: 'IFRC GO - Update Field Report',

    fieldReportCOVID19: 'COVID-19',
    fieldReportUpdateNo: 'Update #',
};

export type FieldReportStrings = typeof fieldReport;

export default fieldReport;
