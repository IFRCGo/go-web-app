import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { useMemo } from 'react';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_01.jpg',
                caption: strings.healthEruClinicImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_02.jpg',
                caption: strings.healthEruClinicImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_03.jpg',
                caption: strings.healthEruClinicImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_04.jpg',
                caption: strings.healthEruClinicImageFour,
            },
        ]),
        [strings],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.healthEruClinicTitle}
            goBackFallbackLink="catalogueHealth"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnel}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponents}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.variation}
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
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruClinic';
