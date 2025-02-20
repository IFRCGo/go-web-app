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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_01.jpg',
                caption: strings.washImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_02.jpg',
                caption: strings.washImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_03.jpg',
                caption: strings.washImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_04.jpg',
                caption: strings.washImageFourCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_05.jpg',
                caption: strings.washImageFiveCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_06.jpg',
                caption: strings.washImageSixCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_07.jpg',
                caption: strings.washImageSevenCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-msm20_08.jpg',
                caption: strings.washImageEightCaption,
            },
        ]),
        [
            strings.washImageOneCaption,
            strings.washImageTwoCaption,
            strings.washImageThreeCaption,
            strings.washImageFourCaption,
            strings.washImageFiveCaption,
            strings.washImageSixCaption,
            strings.washImageSevenCaption,
            strings.washImageEightCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.washM15}
            goBackFallbackLink="surgeCatalogueWash"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.washCapacity}
            >
                <div>{strings.capacityOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesTextOne}</div>
                <ul>
                    <li>
                        <div>{strings.emergencyServicesSectionOne}</div>
                    </li>
                    <li>
                        <div>{strings.emergencyServicesSectionTwo}</div>
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForItemOne}</div>
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
                <div>
                    {strings.personnelDetail}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specification}
            >
                <TextOutput
                    value={strings.specificationWeightValue}
                    label={strings.specificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationVolumeValue}
                    label={strings.specificationVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationCostValue}
                    label={strings.specificationCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationNSValue}
                    label={strings.specificationNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWashKitMsm20Eru';
