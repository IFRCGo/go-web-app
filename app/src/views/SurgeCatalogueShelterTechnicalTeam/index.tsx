import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_01.jpg',
                caption: strings.shelterImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_06.jpg',
                caption: strings.shelterImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_07.jpg',
                caption: strings.shelterImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_08.jpg',
                caption: strings.shelterImageFourCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_12.jpg',
                caption: strings.shelterImageFiveCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_14.jpg',
                caption: strings.shelterImageSixCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_16.jpg',
                caption: strings.shelterImageSevenCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_17.jpg',
                caption: strings.shelterImageEightCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_23.jpg',
                caption: strings.shelterImageNineCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-stt_24.jpg',
                caption: strings.shelterImageTenCaption,
            },
        ]),
        [
            strings.shelterImageOneCaption,
            strings.shelterImageTwoCaption,
            strings.shelterImageThreeCaption,
            strings.shelterImageFourCaption,
            strings.shelterImageFiveCaption,
            strings.shelterImageSixCaption,
            strings.shelterImageSevenCaption,
            strings.shelterImageEightCaption,
            strings.shelterImageNineCaption,
            strings.shelterImageTenCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.shelterTechnical}
            goBackFallbackLink="surgeCatalogueShelter"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.shelterTechnicalCapacity}
            >
                <div>{strings.shelterCapacityTextOne}</div>
                <div>{strings.shelterCapacityTextTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesSectionOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <ul>
                    <li>{strings.designedForItemOneLabel}</li>
                    <li>{strings.designedForItemTwoLabel}</li>
                    <li>{strings.designedForItemThreeLabel}</li>
                    <li>{strings.designedForItemFourLabel}</li>
                    <li>{strings.designedForItemFiveLabel}</li>
                    <li>{strings.designedForItemSixLabel}</li>
                    <li>{strings.designedForItemSevenLabel}</li>
                    <li>{strings.designedForItemEightLabel}</li>
                    <li>{strings.designedForItemNineLabel}</li>
                    <li>{strings.designedForItemTenLabel}</li>
                    <li>{strings.designedForItemElevenLabel}</li>
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
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specification}
            >
                <TextOutput
                    value={strings.specificationValue}
                    label={strings.specificationLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.additionalResources}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesIFRC,
                            {
                                link: (
                                    <Link
                                        href="https://www.ifrc.org/our-work/disasters-climate-and-crises/shelter-and-settlements"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesGlobal}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        <Link
                            href="https://fednet.ifrc.org/en/resources/disasters/shelter/"
                            external
                            withLinkIcon
                        >
                            {strings.additionalResourcesFednet}
                        </Link>
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesMaster,
                            {
                                link: (
                                    <Link
                                        href="https://itemscatalogue.redcross.int/relief--4/shelter-and-construction-materials--23.aspx"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesHumanitarian}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesSelf,
                            {
                                link: (
                                    <Link
                                        href="https://www.ifrc.org/media/48901"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesProgramming}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesCoordination,
                            {
                                link: (
                                    <Link
                                        href="https://ifrc.csod.com/ui/lms-learning-details/app/course/6bcddb4f-0e33-471c-93fb-281764be8092"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesCoordinationLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueShelterTechnicalTeam';
