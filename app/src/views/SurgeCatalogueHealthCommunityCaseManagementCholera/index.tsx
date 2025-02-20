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
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/health-ccmc_01.jpg',
                caption: strings.communityCaseImageCaption,
            },
        ]),
        [
            strings.communityCaseImageCaption,
        ],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.communityCaseTitle}
            goBackFallbackLink="surgeCatalogueHealth"
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.communityCaseCapacity}
            >
                <div>{strings.communityCaseCapacityDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCaseEmergencyServices}
            >
                <div>{strings.communityCaseEmergencyServicesDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCaseDesignedFor}
            >
                <div>{strings.communityCaseDesignedForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCasePersonnel}
            >
                <TextOutput
                    label={strings.communityCasePersonnelLabel}
                    value={strings.communityCasePersonnelValue}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCasePersonnelCompositionValue}
                    label={strings.communityCasePersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCaseStandardComponents}
            >
                <ul>
                    <li>
                        {strings.communityCaseStandardListItemOne}
                    </li>
                    <ul>
                        <li>
                            {strings.communityCaseStandardListItemTwo}
                        </li>
                    </ul>
                    <li>
                        {strings.communityCaseStandardListItemThree}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemFour}
                    </li>
                    <li>
                        {strings.communityCaseStandardListItemFive}
                    </li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCaseSpecifications}
            >
                <TextOutput
                    value={strings.communityCaseSpecificationsWeightValue}
                    label={strings.communityCaseSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCaseSpecificationsVolumeValue}
                    label={strings.communityCaseSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityCaseSpecificationNationalSocietiesValue}
                    label={strings.communityCaseSpecificationNationalSocietiesLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityCaseVariationOnConfiguration}
            >
                <div>{strings.communityCaseVariationOnConfigurationDetail}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthCommunityCaseManagementCholera';
