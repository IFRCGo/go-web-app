import { useRef } from 'react';
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
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/printable/Link';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';
import PrintableContactOutput from '#views/EapFullExport/PrintableContactOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { eapId } = useParams<{ eapId: string }>();

    const mainRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();

    const strings = useTranslation(i18n);

    const version = searchParams.get('version') ?? undefined;

    const { eap_sector, eap_approach } = useGlobalEnums();

    const { pending: eapRegistrationPending, response: eapRegistrationResponse } = useRequest({
        skip: isFalsyString(eapId),
        url: '/api/v2/eap-registration/{id}/',
        pathVariables: isTruthyString(eapId)
            ? {
                id: Number(eapId),
            }
            : undefined,
    });

    const { disaster_type_details, country_details, approved_at } = eapRegistrationResponse ?? {};

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

    const previewReady = !eapRegistrationPending && !fullEapPending;

    const {
        cover_image_file,

        partner_contacts,

        admin2_details,
        lead_time,
        planned_operations,
        enabling_approaches,

        budget_file_details,
    } = fullEapResponse ?? {};

    const eapTitle = [
        country_details?.name,
        admin2_details?.map(({ name }) => name).join(', '),
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
                            value={1234}
                            valueType="number"
                            strongValue
                            variant="block"
                            withPadding
                            withBackground
                            withDiff={false}
                        />
                        <PrintableDataDisplay
                            label={strings.eapLeadTimeLabel}
                            value={lead_time}
                            valueType="number"
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
                            valueType="text"
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
                heading={strings.plannedOperationsHeading}
                headingLevel={2}
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
                                        withPadding
                                        withBackground
                                        strongLabel
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label={strings.operationPeopleTargetedLabel}
                                        value={operation.people_targeted}
                                        valueType="number"
                                        strongLabel
                                        withPadding
                                        withBackground
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label="AP Code"
                                        value={apCodeSectorValue}
                                        valueType="text"
                                        strongLabel
                                        withPadding
                                        withBackground
                                        withDiff={false}
                                    />
                                </ListView>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={3}
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
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {operation.readiness_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
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
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {operation.prepositioning_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
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
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {operation.early_action_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                            withDiff={false}
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
                                        strongLabel
                                        withBackground
                                        withPadding
                                        withDiff={false}
                                    />
                                    <PrintableDataDisplay
                                        label="AP Code"
                                        value={apCodeApproachValue}
                                        valueType="text"
                                        strongLabel
                                        withBackground
                                        withPadding
                                        withDiff={false}
                                    />
                                </ListView>
                            </PrintableContainer>
                            <PrintableContainer
                                heading={strings.indicatorsHeading}
                                headingLevel={3}
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
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {approach.readiness_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
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
                                heading={strings.prepositioningActivitiesHeading}
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {approach.prepositioning_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
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
                                heading={strings.earlyActionActivitiesHeading}
                                headingLevel={3}
                            >
                                <div className={styles.indicatorItems}>
                                    {approach.early_action_activities.map((activity, index) => (
                                        <PrintableDataDisplay
                                            key={activity.id}
                                            label={`${index + 1}. ${activity.activity}`}
                                            value={`${activity.time_value} ${activity.timeframe_display}`}
                                            valueType="text"
                                            variant="contents"
                                            withBackground
                                            withPadding
                                            withoutLabelColon
                                            withDiff={false}
                                        />
                                    ))}
                                </div>
                            </PrintableContainer>
                        </PrintableContainer>
                    );
                })}
            </PrintableContainer>
            <PrintableContainer headingLevel={3}>
                <Link href={budget_file_details?.file}>
                    {strings.downloadBudgetLabel}
                </Link>
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
                <PrintableContainer heading={strings.delegationLabel} headingLevel={4}>
                    <PrintableContactOutput
                        label={strings.delegationFocalLabel}
                        namePrefix="ifrc_delegation_focal_point"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
                    <PrintableContactOutput
                        label={strings.delegationHeadLabel}
                        namePrefix="ifrc_head_of_delegation"
                        data={fullEapResponse}
                        prevData={undefined}
                        withDiff={false}
                    />
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
                    <PrintableContactOutput
                        label={strings.globalOpsLabel}
                        namePrefix="ifrc_global_ops_coordinator"
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
