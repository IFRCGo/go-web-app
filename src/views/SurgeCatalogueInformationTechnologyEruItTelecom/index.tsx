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
                                    to="https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt%2FITT%20Service%20Catalogue%20January%202023%20Final%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fitt&p=true&ga=1"
                                    external
                                    withUnderline
                                    withExternalLinkIcon
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
