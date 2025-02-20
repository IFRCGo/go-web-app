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
                caption: strings.communicationErtOneImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_02.jpg',
                caption: strings.communicationErtOneImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_03.jpg',
                caption: strings.communicationErtOneImageThree,
            },
        ]),
        [
            strings.communicationErtOneImageOne,
            strings.communicationErtOneImageTwo,
            strings.communicationErtOneImageThree,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.communicationErtOneTitle}
            goBackFallbackLink="surgeCatalogueCommunication"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <ul>
                    <li>{strings.certOneServiceListItemOne}</li>
                    <li>{strings.certOneServiceListItemTwo}</li>
                    <li>{strings.certOneServiceListItemThree}</li>
                    <li>{strings.certOneServiceListItemFour}</li>
                    <li>{strings.certOneServiceListItemFive}</li>
                    <li>{strings.certOneServiceListItemSix}</li>
                    <li>{strings.certOneServiceListItemSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyDetailsSectionOne}</div>
                <div>{strings.emergencyDetailsSectionTwo}</div>
                <ul>
                    <li>{strings.certOneEmergencyListItemOne}</li>
                    <li>{strings.certOneEmergencyListItemTwo}</li>
                    <li>{strings.certOneEmergencyListItemThree}</li>
                    <li>{strings.certOneEmergencyListItemFour}</li>
                    <li>{strings.certOneEmergencyListItemFive}</li>
                    <li>{strings.certOneEmergencyListItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <li>{strings.certOneDesignedForListItemOne}</li>
                <li>{strings.certOneDesignedForListItemTwo}</li>
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

Component.displayName = 'SurgeCatalogueCommunicationErtOne';
