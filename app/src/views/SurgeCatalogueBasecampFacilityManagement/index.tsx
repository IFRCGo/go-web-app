import { DataDisplay } from '@ifrc-go/ui';
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
            heading={strings.basecampFacilityManagementTitle}
            goBackFallbackLink="surgeCatalogueBasecamp"
        >
            <SurgeContentContainer
                heading={strings.emergencyServices}
            >
                <ul>
                    <li>{strings.basecampEruEmergencyListItemOne}</li>
                    <li>{strings.basecampEruEmergencyListItemTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedFor}
            >
                <ul>
                    <li>{strings.designedForDetailsSectionOne}</li>
                    <li>{strings.designedForDetailsSectionTwo}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.personnel}
            >
                {strings.personnelDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.standardComponents}
            >
                {strings.standardComponentsDetails}
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.specifications}
            >
                <DataDisplay
                    value={strings.specificationsWeightValue}
                    label={strings.specificationsWeightLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationsVolumeValue}
                    label={strings.specificationsVolumeLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationsCostValue}
                    label={strings.specificationsCostLabel}
                    strongLabel
                />
                <DataDisplay
                    value={strings.specificationsNationalSocietyValue}
                    label={strings.specificationsNationalSocietyLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueBasecampFacilityManagement';
