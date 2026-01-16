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

import Link from '#components/Link';
import PrintableContainer from '#components/printable/PrintableContainer';
import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableDescription from '#components/printable/PrintableDescription';
import PrintablePage from '#components/printable/PrintablePage';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { useRequest } from '#utils/restRequest';

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

    const { pending: fullEapPending, response: fullEapResponse } = useRequest({
        skip: isNotDefined(selectedFullEap?.id),
        url: '/api/v2/full-eap/{id}/',
        pathVariables: isDefined(selectedFullEap?.id)
            ? {
                id: Number(selectedFullEap?.id),
            }
            : undefined,
    });

    const previewReady = !eapRegistrationPending && !fullEapPending;

    const {
        cover_image_file,

        national_society_contact_name,
        national_society_contact_email,
        national_society_contact_title,
        national_society_contact_phone_number,

        partner_contacts,

        ifrc_delegation_focal_point_name,
        ifrc_delegation_focal_point_email,
        ifrc_delegation_focal_point_title,
        ifrc_delegation_focal_point_phone_number,

        ifrc_head_of_delegation_name,
        ifrc_head_of_delegation_email,
        ifrc_head_of_delegation_title,
        ifrc_head_of_delegation_phone_number,

        dref_focal_point_name,
        dref_focal_point_email,
        dref_focal_point_title,
        dref_focal_point_phone_number,

        ifrc_regional_focal_point_name,
        ifrc_regional_focal_point_email,
        ifrc_regional_focal_point_title,
        ifrc_regional_focal_point_phone_number,

        ifrc_regional_ops_manager_name,
        ifrc_regional_ops_manager_email,
        ifrc_regional_ops_manager_title,
        ifrc_regional_ops_manager_phone_number,

        ifrc_regional_head_dcc_name,
        ifrc_regional_head_dcc_email,
        ifrc_regional_head_dcc_title,
        ifrc_regional_head_dcc_phone_number,

        ifrc_global_ops_coordinator_name,
        ifrc_global_ops_coordinator_email,
        ifrc_global_ops_coordinator_title,
        ifrc_global_ops_coordinator_phone_number,

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
                {planned_operations?.map((operation) => (
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
                                    value={operation.ap_code}
                                    valueType="number"
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
                ))}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.enablingApproachesLabel}
                headingLevel={2}
            >
                {enabling_approaches?.map((approach) => (
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
                                    value={approach.ap_code}
                                    valueType="number"
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
                ))}
            </PrintableContainer>
            <PrintableContainer
                heading={strings.operationBudgetLabel}
                headingLevel={3}
            >
                <Link
                    href={budget_file_details?.file}
                    withLinkIcon
                    external
                    withUnderline
                >
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
                    <PrintableDataDisplay
                        label={strings.nationalSocietyContactLabel}
                        valueType="text"
                        value={[
                            national_society_contact_name,
                            national_society_contact_title,
                            national_society_contact_email,
                            national_society_contact_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                        withDiff={false}
                    />
                    <PrintableContainer
                        heading={strings.partnerNationalSocietyContactLabel}
                        headingLevel={5}
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
                    <PrintableDataDisplay
                        label={strings.delegationFocalLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_delegation_focal_point_name,
                            ifrc_delegation_focal_point_email,
                            ifrc_delegation_focal_point_title,
                            ifrc_delegation_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.delegationHeadLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_head_of_delegation_name,
                            ifrc_head_of_delegation_title,
                            ifrc_head_of_delegation_email,
                            ifrc_head_of_delegation_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
                <PrintableContainer
                    heading={strings.regionalGlobalLabel}
                    headingLevel={4}
                >
                    <PrintableDataDisplay
                        label={strings.drefFocalLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            dref_focal_point_name,
                            dref_focal_point_email,
                            dref_focal_point_title,
                            dref_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalFocalLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_regional_focal_point_name,
                            ifrc_regional_focal_point_email,
                            ifrc_regional_focal_point_title,
                            ifrc_regional_focal_point_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalOpsLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_regional_ops_manager_name,
                            ifrc_regional_ops_manager_email,
                            ifrc_regional_ops_manager_title,
                            ifrc_regional_ops_manager_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.regionalHeadLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_regional_head_dcc_name,
                            ifrc_regional_head_dcc_email,
                            ifrc_regional_head_dcc_title,
                            ifrc_regional_head_dcc_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                    <PrintableDataDisplay
                        label={strings.globalOpsLabel}
                        valueType="text"
                        withDiff={false}
                        value={[
                            ifrc_global_ops_coordinator_name,
                            ifrc_global_ops_coordinator_email,
                            ifrc_global_ops_coordinator_title,
                            ifrc_global_ops_coordinator_phone_number,
                        ]
                            .filter(isTruthyString)
                            .join(', ')}
                        variant="inline"
                        strongLabel
                    />
                </PrintableContainer>
            </PrintableContainer>
        </PrintablePage>
    );
}

Component.displayName = 'EapSummaryExport';
