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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_01.jpg',
                caption: strings.logisticsEmergencyImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_02.jpg',
                caption: strings.logisticsEmergencyImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_03.jpg',
                caption: strings.logisticsEmergencyImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_04.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_05.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_06.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_07.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_08.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_09.jpg',
                caption: strings.logisticsEmergencyImageNineCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_10.jpg',
                caption: strings.logisticsEmergencyImageTenCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/logs_11.jpg',
                caption: strings.logisticsEmergencyImageElevenCaption,
            },
        ]),
        [
            strings.logisticsEmergencyImageOneCaption,
            strings.logisticsEmergencyImageTwoCaption,
            strings.logisticsEmergencyImageThreeCaption,
            strings.logisticsEmergencyImageNineCaption,
            strings.logisticsEmergencyImageTenCaption,
            strings.logisticsEmergencyImageElevenCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.logisticsEruTitle}
            goBackFallbackLink="surgeCatalogueLogistics"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.logisticsEmergencyCapacity}
            >
                <div>{strings.logisticsEmergencyCapacityDescription}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsEmergencyServices}
            >
                <div>{strings.logisticsEmergencyServicesDescription}</div>
                <ul>
                    <li>{strings.logisticsEmergencyServicesItemOne}</li>
                    <li>{strings.logisticsEmergencyServicesItemThree}</li>
                    <li>{strings.logisticsEmergencyServicesItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsPersonnel}
            >
                <TextOutput
                    value={strings.logisticsPersonnelValue}
                    label={strings.logisticsPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsPersonnelCompositionValue}
                    label={strings.logisticsPersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsStandardComposition}
            >
                <div>{strings.logisticsStandardCompositionText}</div>
                <ul>
                    <li>{strings.logisticsStandardCompositionTextListOne}</li>
                    <li>{strings.logisticsStandardCompositionTextListTwo}</li>
                    <li>{strings.logisticsStandardCompositionTextListThree}</li>
                    <li>{strings.logisticsStandardCompositionTextListFour}</li>
                    <li>{strings.logisticsStandardCompositionTextListFive}</li>
                    <li>{strings.logisticsStandardCompositionTextListSix}</li>
                    <li>{strings.logisticsStandardCompositionTextListSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.logisticsSpecifications}
            >
                <TextOutput
                    value={strings.logisticsSpecificationsWeightValue}
                    label={strings.logisticsSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsVolumeValue}
                    label={strings.logisticsSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsCostValue}
                    label={strings.logisticsSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.logisticsSpecificationsNSValue}
                    label={strings.logisticsSpecificationsNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueLogisticsEru';
