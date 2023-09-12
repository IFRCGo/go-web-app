import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import TextOutput from '#components/TextOutput';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.communityBasedTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.communityBasedCapacity}
            >
                <div>{strings.communityBasedDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedEmergencyServices}
            >
                <div>{strings.communityBasedEmergencyDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedDesignedFor}
            >
                <div>{strings.communityBasedDesignedForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedPersonnel}
            >
                <TextOutput
                    value={strings.communityBasedPersonnelValue}
                    label={strings.communityBasedPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={(
                        <ul>
                            <li>{strings.communityBasedPersonnelCompositionListItemOne}</li>
                            <li>{strings.communityBasedPersonnelCompositionListItemTwo}</li>
                        </ul>
                    )}
                    label={strings.communityBasedPersonnelCompositionLabel}
                    strongLabel
                />
                <div>
                    {strings.communityBasedPersonnelCompositionDescription}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedStandardComponentsLabel}
            >
                <ul>
                    <li>{strings.communityBasedStandardComponentsListItemOne}</li>
                    <li>{strings.communityBasedStandardComponentsListItemTwo}</li>
                    <li>{strings.communityBasedStandardComponentsListItemThree}</li>
                    <li>{strings.communityBasedStandardComponentsListItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedSpecificationsLabel}
            >
                <TextOutput
                    value={strings.communityBasedSpecificationsWeightValue}
                    label={strings.communityBasedSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsVolumeValue}
                    label={strings.communityBasedSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsCostValue}
                    label={strings.communityBasedSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.communityBasedSpecificationsNationValue}
                    label={strings.communityBasedSpecificationsNationLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedStandardComponentsLabel}
            >
                <ul>
                    <li>{strings.communityBasedStandardComponentsListItemOne}</li>
                    <li>{strings.communityBasedStandardComponentsListItemTwo}</li>
                    <li>{strings.communityBasedStandardComponentsListItemThree}</li>
                    <li>{strings.communityBasedStandardComponentsListItemFour}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.communityBasedAdditionalResources}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.communityBasedAdditionalResourcesListItemOne,
                            {
                                link: (
                                    <Link
                                        to="https://www.cbsrc.org/"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.communityBasedAdditionalResourcesListItemOneLink}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.communityBasedAdditionalResourcesListItemTwo,
                            {
                                link: (
                                    <Link
                                        to="https://rodekors.service-now.com/drm?id=hb_catalog&handbook=09f973a8db15f4103408d7b2f39619ee"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.communityBasedAdditionalResourcesListItemTwoLink}
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

Component.displayName = 'SurgeCatalogueHealthCommunityBasedSurveillance';
