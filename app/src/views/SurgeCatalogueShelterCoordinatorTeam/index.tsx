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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_01.jpg',
                caption: strings.shelterImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_02.jpg',
                caption: strings.shelterImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_03.jpg',
                caption: strings.shelterImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/shelter-sct_04.jpg',
                caption: strings.shelterImageFourCaption,
            },
        ]),
        [
            strings.shelterImageOneCaption,
            strings.shelterImageTwoCaption,
            strings.shelterImageThreeCaption,
            strings.shelterImageFourCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.shelterCoordinator}
            goBackFallbackLink="surgeCatalogueShelter"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.shelterCoordinatorCapacity}
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
                <TextOutput
                    label={strings.designedForItemOneLabel}
                    value={strings.designedForItemOneValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemTwoLabel}
                    value={strings.designedForItemTwoValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemThreeLabel}
                    value={strings.designedForItemThreeValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemFourLabel}
                    value={strings.designedForItemFourValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemFiveLabel}
                    value={strings.designedForItemFiveValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemSixLabel}
                    value={strings.designedForItemSixValue}
                    strongLabel
                />
                <TextOutput
                    label={strings.designedForItemSevenLabel}
                    value={strings.designedForItemSevenValue}
                    strongLabel
                />
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
                        <Link
                            href="https://sheltercluster.org/"
                            external
                        >
                            {strings.additionalResourcesGlobal}
                        </Link>
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesShelter,
                            {
                                link: (
                                    <Link
                                        href="https://sheltercluster.org/about-us/pages/shelter-coordination-team"
                                        external
                                    >
                                        {strings.additionalResourcesTeam}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesMaster,
                            {
                                link: (
                                    <Link
                                        href="https://sheltercluster.org/global-shelter-cluster/pages/humanitarian-shelter-coordination-master-level-short-course"
                                        external
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
                                        href="https://sheltercluster.org/resources/pages/more-just-roof"
                                        external
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
                                        href="https://buildingabetterresponse.org/"
                                        external
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

Component.displayName = 'SurgeCatalogueShelterCoordinatorTeam';
