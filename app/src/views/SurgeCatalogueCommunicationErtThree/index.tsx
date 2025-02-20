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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_01.jpg',
                caption: strings.communicationErtThreeImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_02.jpg',
                caption: strings.communicationErtThreeImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_03.jpg',
                caption: strings.communicationErtThreeImageThree,
            },
        ]),
        [
            strings.communicationErtThreeImageOne,
            strings.communicationErtThreeImageThree,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.communicationErtThreeTitle}
            goBackFallbackLink="surgeCatalogueCommunication"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <ul>
                    <li>{strings.certThreeServiceListItemOne}</li>
                    <li>{strings.certThreeServiceListItemTwo}</li>
                    <li>{strings.certThreeServiceListItemThree}</li>
                    <li>{strings.certThreeServiceListItemFour}</li>
                    <li>{strings.certThreeServiceListItemFive}</li>
                    <li>{strings.certThreeServiceListItemSix}</li>
                    <li>{strings.certThreeServiceListItemSeven}</li>
                    <li>{strings.certThreeServiceListItemEight}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyDetailsSectionOne}</div>
                <div>{strings.emergencyDetailsSectionTwo}</div>
                <ul>
                    <li>{strings.certThreeEmergencyListItemOne}</li>
                    <li>{strings.certThreeEmergencyListItemTwo}</li>
                    <li>{strings.certThreeEmergencyListItemThree}</li>
                    <li>{strings.certThreeEmergencyListItemFour}</li>
                    <li>{strings.certThreeEmergencyListItemFive}</li>
                    <li>{strings.certThreeEmergencyListItemSix}</li>
                    <li>{strings.certThreeEmergencyListItemSeven}</li>
                    <li>{strings.certThreeEmergencyListItemEight}</li>
                    <li>{strings.certThreeEmergencyListItemNine}</li>
                    <li>{strings.certThreeEmergencyListItemTen}</li>
                    <li>{strings.certThreeEmergencyListItemEleven}</li>
                    <li>{strings.certThreeEmergencyListItemTwelve}</li>
                    <li>{strings.certThreeEmergencyListItemThirteen}</li>
                    <li>{strings.certThreeEmergencyListItemFourteen}</li>
                    <li>{strings.certThreeEmergencyListItemFifteen}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <li>{strings.certThreeDesignedForListItemOne}</li>
                <li>{strings.certThreeDesignedForListItemTwo}</li>
                <li>{strings.certThreeDesignedForListItemThree}</li>
                <li>{strings.certThreeDesignedForListItemFour}</li>
                <li>{strings.certThreeDesignedForListItemFive}</li>
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
                {strings.standardComponentsDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
            >
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
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCommunicationErtThree';
