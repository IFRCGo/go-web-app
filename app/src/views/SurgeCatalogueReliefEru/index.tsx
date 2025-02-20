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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_01.jpg',
                caption: strings.eruReliefImageCaptionOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_02.jpg',
                caption: strings.eruReliefImageCaptionTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_03.jpg',
                caption: strings.eruReliefImageCaptionThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_04.jpg',
                caption: strings.eruReliefImageCaptionFour,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_05.jpg',
                caption: strings.eruReliefImageCaptionFive,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_06.jpg',
                caption: strings.eruReliefImageCaptionSix,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_07.jpg',
                caption: strings.eruReliefImageCaptionSeven,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_08.jpg',
                caption: strings.eruReliefImageCaptionEight,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_09.jpg',
                caption: strings.eruReliefImageCaptionNine,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/relief-eru_10.jpg',
                caption: strings.eruReliefImageCaptionTen,
            },
        ]),
        [
            strings.eruReliefImageCaptionOne,
            strings.eruReliefImageCaptionTwo,
            strings.eruReliefImageCaptionThree,
            strings.eruReliefImageCaptionFour,
            strings.eruReliefImageCaptionFive,
            strings.eruReliefImageCaptionSix,
            strings.eruReliefImageCaptionSeven,
            strings.eruReliefImageCaptionEight,
            strings.eruReliefImageCaptionNine,
            strings.eruReliefImageCaptionTen,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.eruReliefTitle}
            goBackFallbackLink="surgeCatalogueRelief"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacityTitle}
            >
                <div>{strings.capacityDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyTitle}
            >
                <div>{strings.emergencyContentOne}</div>
                <ul>
                    <li>{strings.emergencyDetailsOne}</li>
                    <li>{strings.emergencyDetailsTwo}</li>
                    <li>{strings.emergencyDetailsThree}</li>
                    <li>{strings.emergencyDetailsFour}</li>
                </ul>
                <div>{strings.emergencyContentTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedForTitle}
            >
                <div>{strings.designedForDetails}</div>
                <ul>
                    <li>{strings.designedForOne}</li>
                    <li>{strings.designedForTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnelTitle}
            >
                <TextOutput
                    label={strings.personnelTotal}
                    strongLabel
                    value={strings.personnelTotalDetail}
                />
                <TextOutput
                    label={strings.personnelComposition}
                    strongLabel
                    value={strings.personnelCompositionDetail}
                />
                <div>{strings.personnelContent}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponents}
            >
                <ul>
                    <li>{strings.standardComponentsDetailsOne}</li>
                    <li>{strings.standardComponentsDetailsTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specificationsTitle}
            >
                <TextOutput
                    label={strings.specificationsWeightTitle}
                    strongLabel
                    value={strings.specificationsWeightDetails}
                />
                <TextOutput
                    label={strings.specificationsVolumeTitle}
                    strongLabel
                    value={strings.specificationsVolumeDetails}
                />
                <TextOutput
                    label={strings.specificationsNSTitle}
                    strongLabel
                    value={strings.specificationsNSDetails}
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueReliefEru';
