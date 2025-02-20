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
                caption: strings.communicationErtTwoImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_02.jpg',
                caption: strings.communicationErtTwoImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/comms-comms_03.jpg',
                caption: strings.communicationErtTwoImageThree,
            },
        ]),
        [
            strings.communicationErtTwoImageOne,
            strings.communicationErtTwoImageTwo,
            strings.communicationErtTwoImageThree,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.communicationErtTwoTitle}
            goBackFallbackLink="surgeCatalogueCommunication"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
                <ul>
                    <li>
                        {strings.certTwoServiceListItemOne}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemTwo}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemThree}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemFour}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemFive}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemSix}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemSeven}
                    </li>
                    <li>
                        {strings.certTwoServiceListItemEight}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyDetailsSectionOne}</div>
                <div>{strings.emergencyDetailsSectionTwo}</div>
                <ul>
                    <li>
                        {strings.certTwoEmergencyListItemOne}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemTwo}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemThree}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemFour}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemFive}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemSix}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemSeven}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemEight}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemNine}
                    </li>
                    <li>
                        {strings.certTwoEmergencyListItemTen}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <li>
                    {strings.certTwoDesignedForListItemOne}
                </li>
                <li>
                    {strings.certTwoDesignedForListItemTwo}
                </li>
                <li>
                    {strings.certTwoDesignedForListItemThree}
                </li>
                <li>
                    {strings.certTwoDesignedForListItemFour}
                </li>
                <li>
                    {strings.certTwoDesignedForListItemFive}
                </li>
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

Component.displayName = 'SurgeCatalogueCommunicationErtTwo';
