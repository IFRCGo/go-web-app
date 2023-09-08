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
            heading={strings.surgeOperationsServiceTitle}
            goBackFallbackLink="surgeCatalogueOperationsManagement"
        >
            <SurgeContentContainer
                heading={strings.surgeOperationsCapacityTitle}
            >
                <div>{strings.surgeOperationsCapacityTextOne}</div>
                <div>{strings.surgeOperationsCapacityTextTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsEmergencyServices}
            >
                <div>{strings.surgeOperationsEmergencyServicesText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsDesignedFor}
            >
                <ul>
                    <li>{strings.surgeOperationsDesignedForItemOne}</li>
                    <li>{strings.surgeOperationsDesignedForItemTwo}</li>
                    <li>{strings.surgeOperationsDesignedForItemThree}</li>
                    <li>{strings.surgeOperationsDesignedForItemFour}</li>
                    <li>{strings.surgeOperationsDesignedForItemFive}</li>
                    <li>{strings.surgeOperationsDesignedForItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsPersonnelTitle}
            >
                <div>{strings.surgeOperationsPersonnelText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsStandardComponents}
            >
                <div>{strings.surgeOperationsStandardComponentsText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsSpecifications}
            >
                <TextOutput
                    value={strings.surgeOperationsCostValue}
                    label={strings.surgeOperationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.surgeOperationsNSValue}
                    label={strings.surgeOperationsNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsVariations}
            >
                <div>{strings.surgeOperationsVariationsText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.surgeOperationsAdditionalResources}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.surgeOperationsHeOpsOne,
                            {
                                link: (
                                    <Link
                                        to="https://idp.ifrc.org/SSO/SAMLLogin?loginToSp=https://fednet.ifrc.org&returnUrl=https://fednet.ifrc.org/en/resources/disasters/disaster-and-crisis-mangement/disaster-response/surge-capacity/heops/"
                                        external
                                        withExternalLinkIcon
                                    >
                                        {strings.surgeOperationsFedNet}
                                    </Link>
                                ),
                            },
                        )}
                    </li>
                    <li>
                        {resolveToComponent(
                            strings.surgeOperationsHeOpsTwo,
                            {
                                link: (
                                    <Link
                                        to="https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement%2FHeOps%20bios%20%2D%202020%2002%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fopsmanagement&p=true&ga=1"
                                        external
                                        withExternalLinkIcon
                                    >
                                        {strings.surgeOperationsShort}
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

Component.displayName = 'SurgeCatalogueOperationsManagementHeops';
