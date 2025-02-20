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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m40_01.jpg',
                caption: strings.washImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m40_02.jpg',
                caption: strings.washImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m40_03.jpg',
                caption: strings.washImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m40_04.jpg',
                caption: strings.washImageFourCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-m40_05.jpg',
                caption: strings.washImageFiveCaption,
            },
        ]),
        [
            strings.washImageOneCaption,
            strings.washImageTwoCaption,
            strings.washImageThreeCaption,
            strings.washImageFourCaption,
            strings.washImageFiveCaption,
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
                <ul>
                    <li>{strings.emergencyServicesSectionOne}</li>
                    <li>{strings.emergencyServicesSectionTwo}</li>
                    <li>{strings.emergencyServicesSectionThree}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <ul>
                    <li>{strings.designedForItemOne}</li>
                    <li>{strings.designedForItemTwo}</li>
                    <li>{strings.designedForItemThree}</li>
                    <li>{strings.designedForItemFour}</li>
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

Component.displayName = 'SurgeCatalogueContainerWashKitM40Eru';
