import { DataDisplay } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.logisticsNSTitle}
            goBackFallbackLink="surgeCatalogueLogistics"
        >
            <SurgeContentContainer
                heading={strings.logisticsNSCapacity}
            >
                <div>{strings.logisticsNSCapacityTextOne}</div>
                <div>{strings.logisticsNSCapacityTextTwo}</div>
                <div>{strings.logisticsNSCapacityTextThree}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsEmergencyServices}
            >
                <ul>
                    <li>{strings.logisticsEmergencyServicesItemOne}</li>
                    <li>{strings.logisticsEmergencyServicesItemTwo}</li>
                    <li>{strings.logisticsEmergencyServicesItemThree}</li>
                    <li>{strings.logisticsEmergencyServicesItemFour}</li>
                    <li>{strings.logisticsEmergencyServicesItemFive}</li>
                    <li>{strings.logisticsEmergencyServicesItemSix}</li>
                    <li>{strings.logisticsEmergencyServicesItemSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsDesignedFor}
            >
                <DataDisplay
                    value={strings.logisticsDesignedForMobilizationValue}
                    label={strings.logisticsDesignedForMobilizationLabel}
                    strongLabel
                />
                <DataDisplay
                    value={(
                        <div>
                            <div>{strings.logisticsDesignedForProcurementValueOne}</div>
                            <div>{strings.logisticsDesignedForProcurementValueTwo}</div>
                            <div>{strings.logisticsDesignedForProcurementValueThree}</div>
                        </div>
                    )}
                    label={strings.logisticsDesignedForProcurementLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.logisticsDesignedForQAValue}
                    label={strings.logisticsDesignedForQALabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.logisticsDesignedForFleetValue}
                    label={strings.logisticsDesignedForFleetLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.logisticsDesignedForWarehousingValue}
                    label={strings.logisticsDesignedForWarehousingLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.logisticsDesignedForStockValue}
                    label={strings.logisticsDesignedForStockLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.logisticsDesignedForSupportValue}
                    label={strings.logisticsDesignedForSupportLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsAdditionalResources}
            >
                <ul>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/mobilization-of-goods/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsMobilizationOfReliefItems}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/procurement/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsProcurement}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/our-global-structure/DubaiLPSCM/global-fleet-base/vehicle-rental-programme/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsFleetServices}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/our-global-structure/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsWarehousing}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/contingency-stock/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsContingency}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/logistics/logistics-training-and-workshop/"
                            external
                            styleVariant="action"
                            withLinkIcon
                        >
                            {strings.logisticsSpecialized}
                        </Link>
                    </li>
                </ul>
                <div>
                    {resolveToComponent(
                        strings.logisticsAdditionalResourcesText,
                        {
                            link: (
                                <Link
                                    href="https://fednet.ifrc.org/en/resources/logistics/our-global-structure/"
                                    external
                                    withLinkIcon
                                    withUnderline
                                >
                                    {strings.logisticsAdditionalResourcesContact}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueLogisticsLpscmNs';
