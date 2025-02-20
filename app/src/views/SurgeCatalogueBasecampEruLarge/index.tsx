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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_01.jpg',
                caption: strings.basecampEruLargeImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_02.jpg',
                caption: strings.basecampEruLargeImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_03.jpg',
                caption: strings.basecampEruLargeImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_04.jpg',
                caption: strings.basecampEruLargeImageFour,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/basecamp-basecamp_05.jpg',
                caption: strings.basecampEruLargeImageFive,
            },
        ]),
        [
            strings.basecampEruLargeImageOne,
            strings.basecampEruLargeImageTwo,
            strings.basecampEruLargeImageThree,
            strings.basecampEruLargeImageFour,
            strings.basecampEruLargeImageFive,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.basecampEruLargeTitle}
            goBackFallbackLink="surgeCatalogueBasecamp"
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
                <ul>
                    <li>{strings.basecampEruEmergencyListItemOne}</li>
                    <li>{strings.basecampEruEmergencyListItemTwo}</li>
                    <li>{strings.basecampEruEmergencyListItemThree}</li>
                    <li>{strings.basecampEruEmergencyListItemFour}</li>
                    <li>{strings.basecampEruEmergencyListItemFive}</li>
                    <li>{strings.basecampEruEmergencyListItemSix}</li>
                    <li>{strings.basecampEruEmergencyListItemSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <ul>
                    <li>{strings.designedForDetailsSectionOne}</li>
                    <li>{strings.designedForDetailsSectionTwo}</li>
                    <li>{strings.designedForDetailsSectionThree}</li>
                    <li>{strings.designedForDetailsSectionFour}</li>
                    <li>{strings.designedForDetailsSectionFive}</li>
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
                    value={strings.compositionValue}
                    label={strings.compositionLabel}
                    strongLabel
                />
                <div>{strings.compositionDescription}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponents}
            >
                <ul>
                    <li>{strings.basecampEruComponentListItemOne}</li>
                    <li>{strings.basecampEruComponentListItemTwo}</li>
                    <li>{strings.basecampEruComponentListItemThree}</li>
                    <li>{strings.basecampEruComponentListItemFour}</li>
                    <li>{strings.basecampEruComponentListItemFive}</li>
                    <li>{strings.basecampEruComponentListItemSix}</li>
                    <li>{strings.basecampEruComponentListItemSeven}</li>
                    <li>{strings.basecampEruComponentListItemEight}</li>
                    <li>{strings.basecampEruComponentListItemNine}</li>
                    <li>{strings.basecampEruComponentListItemTen}</li>
                    <li>{strings.basecampEruComponentListItemEleven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
            >
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
                heading={strings.variationTitle}
            >
                {strings.variationDetails}
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueBasecampEruLarge';
