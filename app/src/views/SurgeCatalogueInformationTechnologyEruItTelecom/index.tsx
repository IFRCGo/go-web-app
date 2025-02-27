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

    return (
        <SurgeCatalogueContainer
            heading={strings.surgeITServiceTitle}
            goBackFallbackLink="surgeCatalogueInformationTechnology"
        >
            <SurgeContentContainer
                heading={strings.surgeITCapacityTitle}
            >
                <div>
                    <p>
                        {strings.surgeITCapacityDetail}
                        <ul>
                            <li>{strings.surgeITCapacityDetailItemOne}</li>
                            <li>{strings.surgeITCapacityDetailItemTwo}</li>
                            <li>{strings.surgeITCapacityDetailItemThree}</li>
                            <li>{strings.surgeITCapacityDetailItemFour}</li>
                        </ul>
                    </p>
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITEmergencyServicesTitle}
            >
                <ol>
                    <li>{strings.surgeITEmergencyServicesDetailItemOne}</li>
                    <ul>
                        <li>{strings.surgeITEmergencyServicesDetailItemOneA}</li>
                        <li>{strings.surgeITEmergencyServicesDetailItemOneB}</li>
                    </ul>
                    <div>&nbsp;</div>
                    <li>{strings.surgeITEmergencyServicesDetailItemTwo}</li>
                    <ul>
                        <li>{strings.surgeITEmergencyServicesDetailItemTwoA}</li>
                        <li>{strings.surgeITEmergencyServicesDetailItemTwoB}</li>
                    </ul>
                    <div>&nbsp;</div>
                    <li>{strings.surgeITEmergencyServicesDetailItemThree}</li>
                    <ul>
                        <li>{strings.surgeITEmergencyServicesDetailItemThreeA}</li>
                        <li>{strings.surgeITEmergencyServicesDetailItemThreeB}</li>
                    </ul>
                </ol>
                <div>
                    {resolveToComponent(
                        strings.surgeITEmergencyServicesDetailText,
                        {
                            link: (
                                <Link
                                    // old one: "IT&T ERU Service Catalogue are here."
                                    // href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Ed9M59SwliBMvgVU3I7XilwBG7EYMGvXuvResKhy9ut5TA"
                                    // orig new one with narrow permissions:
                                    // href="https://ifrcorg.sharepoint.com/:b:/s/ERUProcess/ETj4oPrM42BFoieFE_ALJIIBIAb3gJSIRleymHgkDL2RIQ"
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EdBlwUOheHxBtxopq5QbmfABq18hovd-xoxxakwjVdsKLA"
                                    external
                                    withUnderline
                                    withLinkIcon
                                >
                                    {strings.surgeITEmergencyServicesDetailTextLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITEmergencyModulesTitle}
            >
                <ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemOne}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemOneA}</li>
                        <li>{strings.surgeITEmergencyModulesItemOneB}</li>
                        <li>{strings.surgeITEmergencyModulesItemOneC}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemTwo}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemTwoA}</li>
                        <li>{strings.surgeITEmergencyModulesItemTwoB}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemThree}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemThreeA}</li>
                        <li>{strings.surgeITEmergencyModulesItemThreeB}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemFour}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemFourA}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemFive}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemFiveA}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemSix}</strong></li>
                    <ul>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixA}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixB}
                        </li>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixC}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixD}
                        </li>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixE}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixF}
                        </li>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixG}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixH}
                        </li>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixI}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixJ}
                        </li>
                        <li>
                            <strong>
                                {strings.surgeITEmergencyModulesItemSixK}
                            </strong>
                            {strings.surgeITEmergencyModulesItemSixL}
                        </li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemSeven}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemSevenA}</li>
                    </ul>
                    <li><strong>{strings.surgeITEmergencyModulesItemEight}</strong></li>
                    <ul>
                        <li>{strings.surgeITEmergencyModulesItemEightA}</li>
                    </ul>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITEmergencyDesignedForTitle}
            >
                <div>{strings.surgeITEmergencyDesignedForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITPersonnelTitle}
            >
                <div>{strings.surgeITPersonnelText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITStandardComponents}
            >
                <div>{strings.surgeITStandardComponentsText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeITOfferingsTitle}
            >
                <div>{strings.surgeITOfferingsText}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueInformationTechnologyEruItTelecom';
