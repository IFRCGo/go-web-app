import { useCallback } from 'react';

import { ChevronLeftLineIcon } from '@ifrc-go/icons';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import Image from '#components/Image';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import useRouting from '#hooks/useRouting';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();

    const handleBackButtonClick = useCallback(() => {
        goBack('catalogueHealth');
    }, [goBack]);

    return (
        <Container
            className={styles.healthEruClinic}
            heading={strings.healthEruClinicTitle}
            childrenContainerClassName={styles.content}
            icons={(
                <IconButton
                    name={undefined}
                    onClick={handleBackButtonClick}
                    ariaLabel={strings.goBack}
                    variant="tertiary"
                    title={strings.goBack}
                >
                    <ChevronLeftLineIcon />
                </IconButton>

            )}
            headingLevel={2}
        >
            <div className={styles.imageList}>
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_01.jpg"
                    caption={strings.healthEruClinicImageOne}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_02.jpg"
                    caption={strings.healthEruClinicImageTwo}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_03.jpg"
                    caption={strings.healthEruClinicImageThree}
                    imageClassName={styles.image}
                />
                <Image
                    src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_04.jpg"
                    caption={strings.healthEruClinicImageFour}
                    imageClassName={styles.image}
                />
            </div>
            <Container
                heading={strings.capacity}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.content}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
            </Container>
            <Container
                heading={strings.emergencyServices}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.emergencyServicesDetails}</div>
                <ul>
                    <li>
                        {strings.healthEruClinicEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.healthEruClinicEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruClinicEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.healthEruClinicEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.healthEruClinicEmergencyListItemFive}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.designedFor}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <ul>
                    <li>
                        {strings.designedForListItemOne}
                    </li>
                    <li>
                        {strings.designedForListItemTwo}
                    </li>
                    <li>
                        {strings.designedForListItemThree}
                    </li>
                </ul>
            </Container>
            <Container
                heading={strings.personnel}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.totalPersonnelValue}
                    label={strings.totalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.personnelCompositionValue}
                    label={strings.personnelCompositionLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.standardComponents}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <div>{strings.standardComponentsDetails}</div>
                <TextOutput
                    value={strings.opdModuleValue}
                    label={strings.opdModuleValueLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.maternalModuleValue}
                    label={strings.maternalModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.pharmaceuticalModuleValue}
                    label={strings.pharmaceuticalModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.pssModuleValue}
                    label={strings.pssModuleValueLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.storeModuleValue}
                    label={strings.storeModuleValueLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.wasteManagementModuleValue}
                    label={strings.wasteManagementModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.waterTreatmentModuleValue}
                    label={strings.waterTreatmentModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.sanitationModuleValue}
                    label={strings.sanitationModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.infrastructureModuleValue}
                    label={strings.infrastructureModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.powerModuleValue}
                    label={strings.powerModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.adminstrationModuleValue}
                    label={strings.adminstrationModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.itModuleValue}
                    label={strings.itModuleLabel}
                    withoutLabelColon
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.specifications}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <TextOutput
                    value={strings.specificationsWeightValue}
                    label={strings.specificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsVolumeValue}
                    label={strings.specificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsCostValue}
                    label={strings.specificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsNationalSocietyValue}
                    label={strings.specificationsNationalSocietyLabel}
                    strongLabel
                />
            </Container>
            <Container
                heading={strings.variation}
                headingLevel={3}
                withHeaderBorder
                childrenContainerClassName={styles.innerContent}
            >
                <ul>
                    <li>
                        {strings.healthEruClinicVariationListItemOne}
                    </li>
                    <li>
                        {strings.healthEruClinicVariationListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruClinicVariationListItemThree}
                    </li>
                    <li>
                        {strings.healthEruClinicVariationListItemFour}
                    </li>
                </ul>
            </Container>
        </Container>
    );
}

Component.displayName = 'HealthEruClinic';
