import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emergency-clinic_05.jpg',
                caption: strings.healthEruClinicImageFour,
            },
        ]),
        [
            strings.healthEruClinicImageOne,
            strings.healthEruClinicImageTwo,
            strings.healthEruClinicImageThree,
            strings.healthEruClinicImageFour,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.healthEruClinicTitle}
            goBackFallbackLink="surgeCatalogueHealth"
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
                <ul>
                    <li>
                        <TextOutput
                            value={strings.opdModuleValue}
                            label={strings.opdModuleValueLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.maternalModuleValue}
                            label={strings.maternalModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.pharmaceuticalModuleValue}
                            label={strings.pharmaceuticalModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.pssModuleValue}
                            label={strings.pssModuleValueLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.storeModuleValue}
                            label={strings.storeModuleValueLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.wasteManagementModuleValue}
                            label={strings.wasteManagementModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.waterTreatmentModuleValue}
                            label={strings.waterTreatmentModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.sanitationModuleValue}
                            label={strings.sanitationModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.infrastructureModuleValue}
                            label={strings.infrastructureModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.powerModuleValue}
                            label={strings.powerModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.administrationModuleValue}
                            label={strings.administrationModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.itModuleValue}
                            label={strings.itModuleLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.vehiclesValue}
                            label={strings.vehiclesLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                    <li>
                        <TextOutput
                            value={strings.basecampsValue}
                            label={strings.basecampsLabel}
                            withoutLabelColon
                            strongLabel
                        />
                    </li>
                </ul>
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
