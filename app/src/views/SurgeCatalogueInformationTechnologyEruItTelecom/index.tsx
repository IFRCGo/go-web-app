import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.surgeITServiceTitle}
            goBackFallbackLink="surgeCatalogueInformationTechnology"
        >
            <SurgeContentContainer
                heading={strings.surgeITCapacityTitle}
            >
                <div>{strings.surgeITCapacityDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITEmergencyServicesTitle}
            >
                <div>{strings.surgeITEmergencyServicesDetailTextOne}</div>
                <div>
                    {resolveToComponent(
                        strings.surgeITEmergencyServicesDetailTextTwo,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed9M59SwliBMvgVU3I7XilwBG7EYMGvXuvResKhy9ut5TA"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.surgeITEmergencyServicesDetailTextTwoLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITEmergencyDesignedForTitle}
            >
                <div>{strings.surgeITEmergencyDesignForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITPersonnelTitle}
            >
                <TextOutput
                    value={strings.surgeITPersonnelTotalValue}
                    label={strings.surgeITPersonnelTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeITPersonnelCompositionValue}
                    label={strings.surgeITPersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITStandardComponents}
            >
                <ul>
                    <li>{strings.surgeITStandardComponentsListOne}</li>
                    <li>{strings.surgeITStandardComponentsListTwo}</li>
                    <li>{strings.surgeITStandardComponentsListThree}</li>
                    <li>{strings.surgeITStandardComponentsListFour}</li>
                    <li>{strings.surgeITStandardComponentsListFive}</li>
                    <li>{strings.surgeITStandardComponentsListSix}</li>
                    <li>{strings.surgeITStandardComponentsListSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITSpecificationsTitle}
            >
                <TextOutput
                    value={strings.surgeITSpecificationsCostValue}
                    label={strings.surgeITSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeITSpecificationsNSValue}
                    label={strings.surgeITSpecificationsNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnologyEruItTelecom';
