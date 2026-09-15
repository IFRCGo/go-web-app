import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    useParams,
    useSearchParams,
} from 'react-router-dom';
import {
    Label,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { Image } from '@ifrc-go/ui/printable';
import {
    formatNumber,
    resolveToString,
    sumSafe,
} from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import AdminAreaMap from '#components/domain/AdminAreaMap';
import PrintableActivityOutput from '#components/domain/PrintableActivityOutput';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintableLabel from '#components/printable/PrintableLabel';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    getEapAdmin1Areas,
    getEapAdminAreaTitle,
} from '#utils/domain/eapAdminArea';
import { useRequest } from '#utils/restRequest';
import PrintableContactOutput from '#views/EapFullExport/PrintableContactOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const mainRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    const strings = useTranslation(i18n);

    const version = searchParams.get('version') ?? undefined;

    const { eap_sector, eap_approach, eap_timeframe } = useGlobalEnums();

    const { pending: eapRegistrationPending, response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const {
        disaster_type_details,
        country_details,
        national_society_details,
        approved_at,
    } = eapRegistrationResponse ?? {};

    const selectedFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => String(fullEap.version) === String(version),
    );

    const latestFullEapId = eapRegistrationResponse?.latest_full_eap ?? undefined;
    const latestFullEap = eapRegistrationResponse?.full_eap_details?.find(
        (fullEap) => fullEap.id === latestFullEapId,
    );

    const currentFullEap = selectedFullEap ?? latestFullEap;
    const currentFullEapId = currentFullEap?.id;

    const { pending: fullEapPending, response: fullEapResponse } = useRequest({
        skip: isNotDefined(currentFullEapId),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(currentFullEapId)
            ? {
                id: Number(currentFullEapId),
            }
            : undefined,
    });

    const { response: apCodeOptions } = useRequest({
        url: '/api/v2/eap/options/',
    });

    const [mapLoaded, setMapLoaded] = useState(false);

    const handleMapLoad = useCallback(() => {
        setMapLoaded(true);
    }, []);

    const {
        cover_image_file,
        objective,

        partner_contacts,

        admin2_details,
        lead_time,
        lead_timeframe_unit,
        planned_operations,
        enabling_approaches,

        prioritized_impacts,
        early_actions,
        trigger_statement,
        trigger_statement_source_of_information,

        operational_administrative_capacity,

        total_budget,
        readiness_budget,
        pre_positioning_budget,
        early_action_budget,
    } = fullEapResponse ?? {};

    const admin1Areas = useMemo(
        () => getEapAdmin1Areas(fullEapResponse?.districts),
        [fullEapResponse],
    );

    const admin1Ids = useMemo(
        () => admin1Areas.map(({ id }) => id),
        [admin1Areas],
    );

    // NOTE: The map is only shown when there are selected admin areas
    const mapCountryId = (admin2_details?.length ?? 0) > 0 || admin1Ids.length > 0
        ? country_details?.id
        : undefined;

    const previewReady = !eapRegistrationPending
        && !fullEapPending
        && (isNotDefined(mapCountryId) || mapLoaded);

    const eapTitle = [
        country_details?.name,
        getEapAdminAreaTitle(admin2_details, admin1Areas),
        disaster_type_details?.name,
    ]
        .filter(isTruthyString)
        .join(' | ');

    const eapSectorTitleMap = listToMap(
        eap_sector,
        ({ key }) => key,
        ({ value }) => value,
    );

    const eapApproachTitleMap = listToMap(
        eap_approach,
        ({ key }) => key,
        ({ value }) => value,
    );

    const eapTimeframeTitleMap = listToMap(
        eap_timeframe,
        ({ key }) => key,
        ({ value }) => value,
    );

    const drefAllocationDescription = resolveToString(
        strings.drefAllocationDescription,
        {
            totalBudget: formatNumber(total_budget) ?? '--',
            nationalSociety: national_society_details?.society_name ?? '--',
            hazard: disaster_type_details?.name ?? '--',
            readinessAndPrepositioningBudget: formatNumber(
                sumSafe([readiness_budget, pre_positioning_budget]),
            ) ?? '--',
            earlyActionBudget: formatNumber(early_action_budget) ?? '--',
        },
    );

    const leadTimeWithUnit = [
        isDefined(lead_time) ? String(lead_time) : undefined,
        isDefined(lead_timeframe_unit)
            ? eapTimeframeTitleMap?.[lead_timeframe_unit]
            : undefined,
    ]
        .filter(isTruthyString)
        .join(' ');

    return (
        <PrintablePage
            mainRef={mainRef}
            heading={strings.summaryPageTitle}
            description={eapTitle ?? '--'}
            dataReady={previewReady}
        >
            {isDefined(cover_image_file?.file) && (
                <PrintableContainer>
                    <Image
                        src={cover_image_file.file}
                        alt={cover_image_file.caption ?? '--'}
                        caption={cover_image_file.caption}
                    />
                </PrintableContainer>
            )}
            <PrintableContainer>
                <ListView layout="block" spacing="2xs">
                    <ListView layout="grid" spacing="2xs" numPreferredGridColumns={3}>
                        <PrintableDataDisplay
                            label={strings.eapNoLabel}
                            value={null}
                            valueType="number"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                        <PrintableDataDisplay
                            label={strings.eapLeadTimeLabel}
                            value={leadTimeWithUnit}
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                        <PrintableDataDisplay
                            label={strings.operationNumberLabel}
                            // FIXME need to add value TBD
                            value={undefined}
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                    </ListView>
                    <ListView layout="grid" spacing="2xs" numPreferredGridColumns={3}>
                        <PrintableDataDisplay
                            label={strings.eapApprovedLabel}
                            value={approved_at}
                            valueType="date"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                        <PrintableDataDisplay
                            label={strings.eapTimeframeLabel}
                            value="5 years"
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                        <PrintableDataDisplay
                            label={strings.operationTimeframeLabel}
                            // FIXME need to add value TBD
                            value={undefined}
                            valueType="text"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                    </ListView>
                </ListView>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.summaryHeading}
                headingLevel={2}
                breakBefore
            >
                <div
                    className={_cs(
                        styles.summary,
                        isNotDefined(mapCountryId) && styles.withoutMap,
                    )}
                >
                    {isDefined(mapCountryId) && (
                        <AdminAreaMap
                            className={styles.adminAreaMap}
                            countryId={mapCountryId}
                            admin2Details={admin2_details}
                            admin1Ids={admin1Ids}
                            onLoad={handleMapLoad}
                        />
                    )}
                    <PrintableDescription value={drefAllocationDescription} />
                </div>
                <div className={styles.summaryTable}>
                    <PrintableDataDisplay
                        label={strings.hazardLabel}
                        value={disaster_type_details?.name}
                        valueType="text"
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.objectiveLabel}
                        value={<PrintableDescription value={objective} />}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.prioritizedImpactsSummaryLabel}
                        value={(
                            <ol>
                                {prioritized_impacts?.map((impact) => (
                                    <li key={impact.id}>
                                        <PrintableDescription value={impact.impact} />
                                    </li>
                                ))}
                            </ol>
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.earlyActionsSummaryLabel}
                        value={(
                            <ol>
                                {early_actions?.map((action) => (
                                    <li key={action.id}>
                                        <PrintableDescription value={action.action} />
                                    </li>
                                ))}
                            </ol>
                        )}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.houseHoldsSummaryLabel}
                        // FIXME need to add value TBD
                        value={undefined}
                        valueType="text"
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.eapBudgetSummaryLabel}
                        value={total_budget}
                        valueType="number"
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.sourceForecastLabel}
                        value={trigger_statement_source_of_information?.map((source) => (
                            <PrintableLabel
                                key={source.id}
                                value={source.source_name}
                            />
                        ))}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.triggerStatementLabel}
                        value={<PrintableDescription value={trigger_statement} />}
                        strongLabel
                        variant="contents"
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                </div>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.operationalStrategyHeading}
                headingLevel={2}
                breakBefore
            >
                <PrintableContainer
                    heading={strings.nationalSocietyStrategyHeading}
                    headingLevel={3}
                >
                    <PrintableDescription value={operational_administrative_capacity} />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.triggerStrategyHeading}
                    headingLevel={3}
                >
                    <PrintableDescription value={trigger_statement} />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.earlyActionsStrategyHeading}
                    headingLevel={3}
                >
                    <ol>
                        {early_actions?.map((action) => (
                            <li key={action.id}>
                                <PrintableDescription value={action.action} />
                            </li>
                        ))}
                    </ol>
                </PrintableContainer>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.plannedOperationsHeading}
                headingLevel={2}
                breakBefore
            >
                {planned_operations?.map((operation) => {
                    const apCodeSectorValue = apCodeOptions?.sector_ap_codes
                        ?.[operation.sector]?.join(', ');

                    return (
                        <PrintableContainer
                            key={operation.id}
                            heading={eapSectorTitleMap?.[operation.sector]}
                            headingLevel={3}
                        >
                            <PrintableContainer headingLevel={4}>
                                <ListView layout="grid" numPreferredGridColumns={3} spacing="2xs">
                                    <PrintableDataDisplay
                                        label={strings.operationBudgetLabel}
                                        value={operation.budget_per_sector}
                                        valueType="number"
                                        prefix="CHF "
                                        variant="block"
                                        withPadding
                                        withBackground
                                        strongLabel
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.operationPeopleTargetedLabel}
                                        value={operation.people_targeted}
                                        valueType="number"
                                        variant="block"
                                        strongLabel
                                        withPadding
                                        withBackground
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.apCodeLabel}
                                        value={apCodeSectorValue}
                                        variant="block"
                                        strongLabel
                                        withPadding
                                        withBackground
                                        withDiff={false}
                                    />
                                </ListView>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTitleLabel}
                                    </Label>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {operation.indicators.map((indicator) => (
                                        <PrintableDataDisplay
                                            key={indicator.id}
                                            label={indicator.title}
                                            value={indicator.target}
                                            valueType="number"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                            withDiff={false}
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.readinessActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.readiness_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.prepositioning_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                            withActivation
                                            withoutTimeframe
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {operation.early_action_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                            withActivation
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    );
                })}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.enablingApproachesLabel}
                headingLevel={2}
                breakBefore
            >
                {enabling_approaches?.map((approach) => {
                    const apCodeApproachValue = apCodeOptions?.approach_ap_codes
                        ?.[approach.approach]?.join(', ');

                    return (
                        <PrintableContainer
                            key={approach.id}
                            heading={eapApproachTitleMap?.[approach.approach]}
                            headingLevel={3}
                        >
                            <PrintableContainer headingLevel={4}>
                                <ListView layout="grid" spacing="2xs">
                                    <PrintableDataDisplay
                                        label={strings.operationBudgetLabel}
                                        value={approach.budget_per_approach}
                                        valueType="number"
                                        prefix="CHF "
                                        variant="block"
                                        strongLabel
                                        withBackground
                                        withPadding
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.apCodeLabel}
                                        value={apCodeApproachValue}
                                        variant="block"
                                        strongLabel
                                        withBackground
                                        withPadding
                                        withDiff={false}
                                    />
                                </ListView>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={4}
                            >
                                <div className={styles.indicatorItems}>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTitleLabel}
                                    </Label>
                                    <Label textSize="sm" strong>
                                        {strings.indicatorTargetLabel}
                                    </Label>
                                    {approach.indicators.map((indicator) => (
                                        <PrintableDataDisplay
                                            key={indicator.id}
                                            label={indicator.title}
                                            value={indicator.target}
                                            valueType="number"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                            withDiff={false}
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.readinessActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.readiness_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.prepositioning_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                            withActivation
                                            withoutTimeframe
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={4}
                            >
                                <div className={styles.activityItems}>
                                    {approach.early_action_activities.map((activity, index) => (
                                        <PrintableActivityOutput
                                            key={activity.id}
                                            activity={activity}
                                            prevActivity={undefined}
                                            index={index}
                                            withDiff={false}
                                            withActivation
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    );
                })}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.budgetHeading}
                headingLevel={2}
                breakBefore
            >
                <ListView
                    layout="grid"
                    spacing="4xs"
                    numPreferredGridColumns={4}
                    minGridColumnSize="10rem"
                >
                    <PrintableDataDisplay
                        label={strings.totalBudgetLabel}
                        value={total_budget}
                        valueType="number"
                        variant="block"
                        strongLabel
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.totalReadinessLabel}
                        value={readiness_budget}
                        valueType="number"
                        variant="block"
                        strongLabel
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.totalPrepositioningLabel}
                        value={pre_positioning_budget}
                        valueType="number"
                        variant="block"
                        strongLabel
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                    <PrintableDataDisplay
                        label={strings.totalEarlyActionsLabel}
                        value={early_action_budget}
                        valueType="number"
                        variant="block"
                        strongLabel
                        withPadding
                        withBackground
                        withDiff={false}
                    />
                </ListView>
            </PrintableContainer>
            <PrintableContainer
                heading={strings.contactInformationHeading}
                headingLevel={3}
            >
                <PrintableContainer headingLevel={4}>
                    <PrintableDescription value={strings.contactInformationDescription} />
                </PrintableContainer>
                <PrintableContainer heading={strings.nationalLabel} headingLevel={4}>
                    <PrintableContactOutput
                        label={strings.nationalSocietyContactLabel}
                        namePrefix="national_society_contact"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                    <PrintableContainer
                        heading={strings.partnerNationalSocietyContactLabel}
                        headingLevel={6}
                    >
                        {partner_contacts?.map((partner) => (
                            <PrintableDataDisplay
                                valueType="text"
                                withDiff={false}
                                value={[
                                    partner.name,
                                    partner.title,
                                    partner.email,
                                    partner.phone_number,
                                ]
                                    .filter(isTruthyString)
                                    .join(', ')}
                                variant="inline"
                                strongLabel
                            />
                        ))}
                    </PrintableContainer>
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.regionalGlobalLabel}
                    headingLevel={4}
                >
                    <PrintableContactOutput
                        label={strings.drefFocalLabel}
                        namePrefix="dref_focal_point"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                    <PrintableContactOutput
                        label={strings.regionalFocalLabel}
                        namePrefix="ifrc_regional_focal_point"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                    <PrintableContactOutput
                        label={strings.regionalOpsLabel}
                        namePrefix="ifrc_regional_ops_manager"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                    <PrintableContactOutput
                        label={strings.regionalHeadLabel}
                        namePrefix="ifrc_regional_head_dcc"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                </PrintableContainer>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'EapSummaryExport';
