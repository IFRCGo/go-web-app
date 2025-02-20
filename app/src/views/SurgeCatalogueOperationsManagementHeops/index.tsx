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
                                        href="https://fednet.ifrc.org/en/resources/disasters/disaster-and-crisis-mangement/disaster-response/surge-capacity/heops/"
                                        external
                                        withLinkIcon
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
                                        href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EcMxBMin_YBLnyvZX9fqapwBo1W4KIVqvDfVH98Y2gy_2A"
                                        external
                                        withLinkIcon
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
