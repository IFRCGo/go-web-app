import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.healthSurgicalTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.capacity}
            >
                <div>{strings.capacityDetailsSectionOne}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <div>{strings.emergencyServicesDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <div>{strings.designedForDetailsSectionOne}</div>
                <div>{strings.designedForDetailsSectionTwo}</div>
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
            <SurgeContentContainer
                heading={strings.standardComponents}
            >
                <div>{strings.standardComponentsDetails}</div>
                <TextOutput
                    value={strings.moduleOneValue}
                    label={strings.moduleOneLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleTwoValue}
                    label={strings.moduleTwoLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleThreeValue}
                    label={strings.moduleThreeLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFourValue}
                    label={strings.moduleFourLabel}
                    withoutLabelColon
                    strongLabel
                />
                <TextOutput
                    value={strings.moduleFiveValue}
                    label={strings.moduleFiveLabel}
                    withoutLabelColon
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
            >
                <TextOutput
                    value={strings.specificationsCostValue}
                    label={strings.specificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.specificationsNationalSocietyValue}
                    label={strings.specificationsNationalSocietyLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.variation}
            >
                <ul>
                    <li>
                        {strings.healthSurgicalVariationListItemOne}
                    </li>
                    <li>
                        {strings.healthSurgicalVariationListItemTwo}
                    </li>
                    <li>
                        {strings.healthSurgicalVariationListItemThree}
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruSurgical';
