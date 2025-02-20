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
            heading={strings.safeAndDignifiedBurialsTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.healthBurialsCapacity}
            >
                <div>{strings.healthBurialsDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthBurialsEmergencyServicesTitle}
            >
                <div>{strings.healthBurialsEmergencyServicesDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthBurialsPersonnel}
            >
                <TextOutput
                    value={strings.healthBurialsTotalValue}
                    label={strings.healthBurialsTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsCompositionValue}
                    label={strings.healthBurialsCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthBurialsStandardComponentsLabel}
            >
                <ul>
                    <li>{strings.healthBurialsStandardComponentsListItemOne}</li>
                    <li>{strings.healthBurialsStandardComponentsListItemTwo}</li>
                    <li>{strings.healthBurialsStandardComponentsListItemThree}</li>
                    <li>{strings.healthBurialsStandardComponentsListItemFour}</li>
                    <li>{strings.healthBurialsStandardComponentsListItemFive}</li>
                    <li>{strings.healthBurialsStandardComponentsListItemSix}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthBurialsSpecificationsLabel}
            >
                <TextOutput
                    value={strings.healthBurialsSpecificationsWeightValue}
                    label={strings.healthBurialsSpecificationsWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsVolumeValue}
                    label={strings.healthBurialsSpecificationsVolumeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsCostValue}
                    label={strings.healthBurialsSpecificationsCostLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthBurialsSpecificationsNsValue}
                    label={strings.healthBurialsSpecificationsNsLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthBurialsVariationLabel}
            >
                <div>{strings.healthBurialsVariationDescription}</div>
            </SurgeContentContainer>

        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthSafeDignifiedBurials';
