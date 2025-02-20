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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_01.jpg',
                caption: strings.protectionImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_02.jpg',
                caption: strings.protectionImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_05.jpg',
                caption: strings.protectionImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/pgi-pgi_04.jpg',
                caption: strings.protectionImageFourCaption,
            },
        ]),
        [
            strings.protectionImageOneCaption,
            strings.protectionImageTwoCaption,
            strings.protectionImageThreeCaption,
            strings.protectionImageFourCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.protectionGenderTitle}
            goBackFallbackLink="surgeCataloguePgi"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.protectionCapacity}
            >
                <div>{strings.protectionCapacityText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.protectionEmergencyServices}
            >
                <div>{strings.protectionEmergencyServicesTextOne}</div>
                <div>{strings.protectionEmergencyServicesTextTwo}</div>
                <ul>
                    <li>
                        {strings.protectionEmergencyServicesItemOne}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemTwo}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemThree}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemFour}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemFive}
                    </li>
                    <li>
                        {strings.protectionEmergencyServicesItemSix}
                    </li>
                </ul>
                <div>{strings.protectionStandalone}</div>
                <ul>
                    <li>
                        {strings.protectionStandaloneTextOne}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextTwo}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextThree}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextFour}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextFive}
                    </li>
                    <li>
                        {strings.protectionStandaloneTextSix}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.protectionDesignedFor}
            >
                <div>{strings.protectionDesignedForText}</div>
                <ul>
                    <li>
                        {strings.protectionDesignedForTextItemOne}
                    </li>
                    <li>
                        {strings.protectionDesignedForTextItemTwo}
                    </li>
                    <li>
                        {strings.protectionDesignedForTextItemThree}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.protectionPersonnel}
            >
                <TextOutput
                    value={strings.protectionTotalValue}
                    label={strings.protectionTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.protectionCompositionValue}
                    label={strings.protectionCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.protectionStandardComponents}
            >
                <div>{strings.protectionStandardComponentsText}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCataloguePgiServices';
