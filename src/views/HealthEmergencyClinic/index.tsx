import { useCallback, useContext } from 'react';
import { generatePath } from 'react-router-dom';
import { ChevronLeftLineIcon } from '@ifrc-go/icons';

import RouteContext from '#contexts/route';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import IconButton from '#components/IconButton';
import useGoBack from '#hooks/useGoBack';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        catalogueHealth: catalogueHealth,
    } = useContext(RouteContext);
    const goBack = useGoBack();

    const handleBackButtonClick = useCallback(() => {
        goBack(generatePath(catalogueHealth.absolutePath));
    }, [goBack, catalogueHealth.absolutePath]);

    return (
        <Container
            className={styles.healthEmergencyClinic}
            heading={strings.emergencyClinicTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.emergencyClinicGoBack}
                    variant="tertiary"
                    title={strings.emergencyClinicGoBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-mobile-clinic_01.jpg"
                    caption={strings.emergencyClinicMobileDistributing}
                    height="16rem"
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-mobile-clinic_02.jpg"
                    caption={strings.emergencyClinicMobileClinic}
                    height="16rem"
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.emergencyClinicCapacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.emergencyClinicCapacityDetails}</div>
            </Container>
            <Container
                heading={strings.emergencyClinicEmergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyClinicServicesDetails}</div>
                <ul>
                    <li>
                        {strings.emergencyClinicEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.emergencyClinicEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.emergencyClinicEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.emergencyClinicEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.emergencyClinicEmergencyListItemFive}
                    </li>
                </ul>
                <div className={styles.emergencyDescription}>
                    {strings.emergencyClinicSectionDescription}
                </div>
            </Container>
            <Container
                heading={strings.emergencyClinicDesignedForDetails}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyClinicDesignedForDescription}</div>
                <ul>
                    <li>
                        {strings.emergencyClinicDesignedForListOne}
                    </li>
                    <li>
                        {strings.emergencyClinicDesignedForListTwo}
                    </li>
                    <li>
                        {strings.emergencyClinicDesignedForListThree}
                    </li>
                    <li>
                        {strings.emergencyClinicDesignedForListFour}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.emergencyClinicPersonnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.emergencyClinicTotalPersonnelValue}
                    label={strings.emergencyClinicTotalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.emergencyClinicPersonnelCompositionValue}
                    label={strings.emergencyClinicPersonnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.emergencyClinicStandardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyClinicStandardComponentsDetails}</div>
                <ul>
                    <li>
                        <TextOutput
                            value={strings.emergencyClinicModuleOneValue}
                            label={strings.emergencyClinicModuleOneLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.emergencyClinicModuleTwoValue}
                            label={strings.emergencyClinicModuleTwoLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.emergencyClinicModuleThreeValue}
                            label={strings.emergencyClinicModuleThreeLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.emergencyClinicModuleFourValue}
                            label={strings.emergencyClinicModuleFourLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.emergencyClinicModuleFiveValue}
                            label={strings.emergencyClinicModuleFiveLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.emergencyClinicSpecifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.emergencyClinicSpecificationsWeightValue}
                    label={strings.emergencyClinicSpecificationsWeightLabel}
                    strongLabel
                />
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthEmergencyClinic';
