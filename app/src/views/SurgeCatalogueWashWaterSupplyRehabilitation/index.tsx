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
            heading={strings.washM15}
            goBackFallbackLink="surgeCatalogueWash"
        >
            <SurgeContentContainer
                heading={strings.washCapacity}
            >
                <div>{strings.washCapacityTextOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesDetail}</div>
                <ul>
                    <li>{strings.emergencyServicesSectionOne}</li>
                    <li>{strings.emergencyServicesSectionTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForItemOne}</div>
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
                    label={strings.personnelCompositionLabel}
                    value={(
                        <ul>
                            <li>{strings.personnelCompositionValueOneItem}</li>
                            <li>{strings.personnelCompositionValueTwoItem}</li>
                            <li>{strings.personnelCompositionValueThreeItem}</li>
                            <li>{strings.personnelCompositionValueFourItem}</li>
                            <li>{strings.personnelCompositionValueFiveItem}</li>
                        </ul>
                    )}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponent}
            >
                <ul>
                    <li>{strings.standardComponentItemOne}</li>
                    <li>{strings.standardComponentItemTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specification}
            >
                <TextOutput
                    value={strings.specificationWeightValue}
                    label={strings.specificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationVolumeValue}
                    label={strings.specificationVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationCostValue}
                    label={strings.specificationCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationNSValue}
                    label={strings.specificationNSLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.additionalResources}
            >
                <ul>
                    <li>
                        {resolveToComponent(
                            strings.additionalResourcesNorCross,
                            {
                                link: (
                                    <Link
                                        href="https://rodekors.service-now.com/drm?id=hb_catalog&handbook=d1b744c1db45b810f15e3423f39619c4"
                                        external
                                        withLinkIcon
                                    >
                                        {strings.additionalResourcesNorCrossLink}
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

Component.displayName = 'SurgeCatalogueWashWaterSupplyRehabilitation';
