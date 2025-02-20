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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_01.jpg',
                caption: strings.livelihoodImageOneCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_02.jpg',
                caption: strings.livelihoodImageTwoCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_03.jpg',
                caption: strings.livelihoodImageThreeCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_04.jpg',
                caption: strings.livelihoodImageFourCaption,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/livelihoods-basic-needs_05.jpg',
                caption: strings.livelihoodImageFiveCaption,
            },
        ]),
        [
            strings.livelihoodImageOneCaption,
            strings.livelihoodImageTwoCaption,
            strings.livelihoodImageThreeCaption,
            strings.livelihoodImageFourCaption,
            strings.livelihoodImageFiveCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.livelihoodServicesTitle}
            goBackFallbackLink="surgeCatalogueLivelihoodServices"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.livelihoodCapacity}
            >
                <div>{strings.livelihoodCapacityTextOne}</div>
                <div>
                    {resolveToComponent(
                        strings.livelihoodCapacityTextTwo,
                        {
                            link: (
                                <Link
                                    href="https://www.livelihoodscentre.org/"
                                    external
                                    withUnderline
                                >
                                    {strings.livelihoodLink}
                                </Link>
                            ),
                            livelihoodLink: (
                                <Link
                                    href="https://www.livelihoodscentre.org/-/inundaciones-en-la-region-sur-de-paragu-1"
                                    external
                                    withUnderline
                                >
                                    {strings.livelihoodWhatLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <div>{strings.livelihoodCapacityTextThree}</div>
                <div>
                    {resolveToComponent(
                        strings.livelihoodCapacityTextFour,
                        {
                            link: (
                                <Link
                                    href="mailto: livelihoods@cruzroja.es"
                                    external
                                    withUnderline
                                >
                                    {strings.livelihoodEmailLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.livelihoodEmergencyServicesTitle}
            >
                <div>{strings.livelihoodEmergencyServicesTextOne}</div>
                <div>{strings.livelihoodEmergencyServicesTextTwo}</div>
                <div>{strings.livelihoodEmergencyServicesTextThree}</div>
                <div>{strings.livelihoodEmergencyServicesTextFour}</div>
                <div>{strings.livelihoodEmergencyServicesTextFive}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.livelihoodDesignedFor}
            >
                <div>{strings.livelihoodDesignedForTextOne}</div>
                <ul>
                    <li>{strings.livelihoodDesignedForTextOneItemOne}</li>
                    <li>{strings.livelihoodDesignedForTextOneItemTwo}</li>
                    <li>{strings.livelihoodDesignedForTextOneItemThree}</li>
                    <li>{strings.livelihoodDesignedForTextOneItemFour}</li>
                </ul>
                <div>{strings.livelihoodDesignedForTextTwo}</div>
                <div>{strings.livelihoodDesignedForTextThree}</div>
                <div>{strings.livelihoodDesignedForTextFour}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.livelihoodPersonnel}
            >
                <div>{strings.livelihoodPersonnelTextOne}</div>
                <ul>
                    <li>{strings.livelihoodPersonnelTextOneListOne}</li>
                    <li>{strings.livelihoodPersonnelTextOneListTwo}</li>
                </ul>
                <div>{strings.livelihoodPersonnelTextTwo}</div>
                <div>{strings.livelihoodPersonnelTextThree}</div>
                <div>{strings.livelihoodPersonnelTextFour}</div>
                <ul>
                    <li>{strings.livelihoodPersonnelTextFourItemOne}</li>
                    <li>{strings.livelihoodPersonnelTextFourItemTwo}</li>
                    <li>{strings.livelihoodPersonnelTextFourItemThree}</li>
                    <li>{strings.livelihoodPersonnelTextFourItemFour}</li>
                    <li>{strings.livelihoodPersonnelTextFourItemFive}</li>
                    <li>{strings.livelihoodPersonnelTextFourItemSix}</li>
                </ul>
                <div>{strings.livelihoodPersonnelTextFive}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.livelihoodSpecificationTitle}
            >
                <TextOutput
                    value={strings.livelihoodSpecificationValue}
                    label={strings.livelihoodSpecificationLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueLivelihoodServices';
