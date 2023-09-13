import { useMemo } from 'react';
import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_01.jpg',
                caption: strings.healthEruHospitalImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_02.jpg',
                caption: strings.healthEruHospitalImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_03.jpg',
                caption: strings.healthEruHospitalImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_04.jpg',
                caption: strings.healthEruHospitalImageFour,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_05.jpg',
                caption: strings.healthEruHospitalImageFive,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-emt2_06.jpg',
                caption: strings.healthEruHospitalImageSix,
            },
        ]),
        [strings],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.healthEruHospitalTitle}
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
                        {strings.healthEruHospitalEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemSix}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemSeven}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemEight}
                    </li>
                    <li>
                        {strings.healthEruHospitalEmergencyListItemNine}
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
                    value={strings.moduleOneValue}
                    label={strings.moduleOneLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleTwoValue}
                    label={strings.moduleTwoLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleThreeValue}
                    label={strings.moduleThreeLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFourValue}
                    label={strings.moduleFourLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFiveValue}
                    label={strings.moduleFiveLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleSixValue}
                    label={strings.moduleSixLabel}
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
                        {strings.healthEruHospitalVariationListItemOne}
                    </li>
                    <li>
                        {strings.healthEruHospitalVariationListItemTwo}
                    </li>
                    <li>
                        {strings.healthEruHospitalVariationListItemThree}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.additionalResources}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesListItemOne,
                            {
                                link: (
                                    <Link
                                        to="https://rodekors.service-now.com/drm?id=hb_catalog&handbook=e3cabf24db361810d40e16f35b9619c7"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesListItemOneLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesListItemTwo,
                            {
                                link: (
                                    <Link
                                        to="https://www.youtube.com/watch?v=TIW6nf-MPb0"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesListItemTwoLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruHospital';
