import { useCallback } from 'react';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueInformationManagement');
    }, [goBack]);

    return (
        <Container
            className={styles.support}
            heading={strings.logisticsNSTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.logisticsNSGoBack}
                    variant="tertiary"
                    title={strings.logisticsNSGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <Container
                heading={strings.logisticsNSCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.logisticsNSCapacityTextOne}</div>
                <div>{strings.logisticsNSCapacityTextTwo}</div>
                <div>{strings.logisticsNSCapacityTextThree}</div>
            </Container>
            <Container
                heading={strings.logisticsEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.logisticsEmergencyServicesItemOne}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemTwo}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemThree}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemFour}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemFive}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemSix}
                    </li>
                    <li>
                        {strings.logisticsEmergencyServicesItemSeven}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.logisticsDesignedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForMobilizationValue}
                            label={strings.logisticsDesignedForMobilizationLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={(
                                <div className={styles.designedFor}>
                                    <div>{strings.logisticsDesignedForProcurementValueOne}</div>
                                    <div>{strings.logisticsDesignedForProcurementValueTwo}</div>
                                    <div>{strings.logisticsDesignedForProcurementValueThree}</div>
                                </div>
                            )}
                            label={strings.logisticsDesignedForProcurementLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForQAValue}
                            label={strings.logisticsDesignedForQALabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForFleetValue}
                            label={strings.logisticsDesignedForFleetLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForWarehousingValue}
                            label={strings.logisticsDesignedForWarehousingLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForStockValue}
                            label={strings.logisticsDesignedForStockLabel}
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.logisticsDesignedForSupportValue}
                            label={strings.logisticsDesignedForSupportLabel}
                            strongLabel
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.logisticsAdditionalResources}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/mobilization-of-goods/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
                        >
                            {strings.logisticsMobilizationOfReliefItems}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/procurement/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
                        >
                            {strings.logisticsProcurement}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/our-global-structure/DubaiLPSCM/global-fleet-base/vehicle-rental-programme/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
                        >
                            {strings.logisticsFleetServices}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/our-global-structure/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
                        >
                            {strings.logisticsWarehousing}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/contingency-stock/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
                        >
                            {strings.logisticsContingency}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/logistics-training-and-workshop/"
                            external
                            variant="tertiary"
                            withExternalLinkIcon
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
                                    to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/logistics/our-global-structure/"
                                    external
                                >
                                    {strings.logisticsAdditionalResourcesContact}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </Container>
        </Container>
    );
}

Component.displayName = 'LogisticsNationalSocieties';
