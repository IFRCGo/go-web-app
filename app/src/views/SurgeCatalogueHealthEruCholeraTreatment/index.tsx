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
            heading={strings.choleraTreatmentHeading}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.choleraCapacityTitle}
            >
                <div>{strings.choleraDescription}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.choleraEmergencyServices}
            >
                <div>{strings.choleraEmergencyServicesDescription}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.choleraDesignedForTitle}
            >
                <div>{strings.choleraDesignedForDescription}</div>
                <ul>
                    <li>{strings.choleraDesignedForListItemOne}</li>
                    <li>{strings.choleraDesignedForListItemTwo}</li>
                    <li>{strings.choleraDesignedForListItemThree}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.choleraDesignedPersonnel}
            >
                <TextOutput
                    value={strings.choleraTotalPersonnelValue}
                    label={strings.choleraTotalPersonnelLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraTotalPersonnelCompositionValue}
                    label={strings.choleraTotalPersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.choleraStandardComponentsLabel}
            >
                <div>{strings.choleraStandardComponentsDescription}</div>
                <TextOutput
                    value={strings.choleraStandardModuleOneValue}
                    label={strings.choleraStandardModuleOneLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleTwoValue}
                    label={strings.choleraStandardModuleTwoLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleThreeValue}
                    label={strings.choleraStandardModuleThreeLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleFourValue}
                    label={strings.choleraStandardModuleFourLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleFiveValue}
                    label={strings.choleraStandardModuleFiveLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleSixValue}
                    label={strings.choleraStandardModuleSixLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleSevenValue}
                    label={strings.choleraStandardModuleSevenLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleEightValue}
                    label={strings.choleraStandardModuleEightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleNineValue}
                    label={strings.choleraStandardModuleNineLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleTenValue}
                    label={strings.choleraStandardModuleTenLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleElevenValue}
                    label={strings.choleraStandardModuleElevenLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.choleraStandardModuleTwelveValue}
                    label={strings.choleraStandardModuleTwelveLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.choleraSpecifications}
            >
                <TextOutput
                    value={strings.choleraSpecificationsValue}
                    label={strings.choleraSpecificationsLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruCholeraTreatment';
