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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cea-cea_01.jpg',
                caption: strings.communityEngagementImageOne,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cea-cea_02.jpg',
                caption: strings.communityEngagementImageTwo,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cea-cea_03.jpg',
                caption: strings.communityEngagementImageThree,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cea-cea_04.jpg',
                caption: strings.communityEngagementImageFour,
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/cea-cea_05.jpg',
                caption: strings.communityEngagementImageFive,
            },
        ]),
        [
            strings.communityEngagementImageOne,
            strings.communityEngagementImageTwo,
            strings.communityEngagementImageThree,
            strings.communityEngagementImageFour,
            strings.communityEngagementImageFive,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.communityEngagementTitle}
            goBackFallbackLink="surgeCatalogueCommunityEngagement"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                {strings.capacityDetailsSectionOne}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesSectionOne}</div>
                <div>{strings.emergencyServicesSectionTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <ul>
                    <li>{strings.ceaDesignedForListItemOne}</li>
                    <li>{strings.ceaDesignedForListItemTwo}</li>
                    <li>{strings.ceaDesignedForListItemThree}</li>
                    <li>{strings.ceaDesignedForListItemFour}</li>
                    <li>{strings.ceaDesignedForListItemFive}</li>
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
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCommunityEngagementRapidResponse';
