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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-mobile-clinic_01.jpg',
                caption: strings.emergencyClinicMobileDistributing,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-mobile-clinic_02.jpg',
                caption: strings.emergencyClinicMobileClinic,
            },
        ]),
        [
            strings.emergencyClinicMobileDistributing,
            strings.emergencyClinicMobileClinic,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.emergencyClinicTitle}
            goBackFallbackLink="surgeCatalogueHealth"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.emergencyClinicCapacity}
            >
                <div>{strings.emergencyClinicCapacityDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyClinicEmergencyServices}
            >
                <div>{strings.emergencyClinicServicesDetails}</div>
                <ul>
                    <li>{strings.emergencyClinicEmergencyListItemOne}</li>
                    <li>{strings.emergencyClinicEmergencyListItemTwo}</li>
                    <li>{strings.emergencyClinicEmergencyListItemThree}</li>
                    <li>{strings.emergencyClinicEmergencyListItemFour}</li>
                    <li>{strings.emergencyClinicEmergencyListItemFive}</li>
                </ul>
                <div>
                    {strings.emergencyClinicSectionDescription}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyClinicDesignedForDetails}
            >
                <div>{strings.emergencyClinicDesignedForDescription}</div>
                <ul>
                    <li>{strings.emergencyClinicDesignedForListOne}</li>
                    <li>{strings.emergencyClinicDesignedForListTwo}</li>
                    <li>{strings.emergencyClinicDesignedForListThree}</li>
                    <li>{strings.emergencyClinicDesignedForListFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyClinicPersonnel}
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyClinicStandardComponents}
            >
                <div>{strings.emergencyClinicStandardComponentsDetails}</div>
                <TextOutput
                    value={strings.emergencyClinicModuleOneValue}
                    label={strings.emergencyClinicModuleOneLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.emergencyClinicModuleTwoValue}
                    label={strings.emergencyClinicModuleTwoLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.emergencyClinicModuleThreeValue}
                    label={strings.emergencyClinicModuleThreeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.emergencyClinicModuleFourValue}
                    label={strings.emergencyClinicModuleFourLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.emergencyClinicModuleFiveValue}
                    label={strings.emergencyClinicModuleFiveLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyClinicSpecifications}
            >
                <TextOutput
                    value={strings.emergencyClinicSpecificationsWeightValue}
                    label={strings.emergencyClinicSpecificationsWeightLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEmergencyClinic';
