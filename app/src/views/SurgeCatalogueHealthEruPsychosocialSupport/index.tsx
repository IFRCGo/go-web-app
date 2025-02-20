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
            heading={strings.healthPSSTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.healthPSSCapacityTitle}
            >
                <div>{strings.healthPSSCapacityDetailOne}</div>
                <div>{strings.healthPSSCapacityDetailTwo}</div>
                <ul>
                    <li>{strings.healthPSSCapacityListOne}</li>
                    <li>{strings.healthPSSCapacityListTwo}</li>
                    <li>{strings.healthPSSCapacityListThree}</li>
                    <li>{strings.healthPSSCapacityListFour}</li>
                    <li>{strings.healthPSSCapacityListFive}</li>
                    <li>{strings.healthPSSCapacityListSix}</li>
                    <li>{strings.healthPSSCapacityListSeven}</li>
                </ul>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSDesignedForTitle}
            >
                <div>{strings.healthPSSDesignedForDetailOne}</div>
                <div>{strings.healthPSSDesignedForDetailTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSPersonnel}
            >
                <TextOutput
                    value={strings.healthPSSPersonnelTotalValue}
                    label={strings.healthPSSPersonnelTotalLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.healthPSSPersonnelCompositionValue}
                    label={strings.healthPSSPersonnelCompositionLabel}
                    strongLabel
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSStandardComponentsLabel}
            >
                <div>{strings.healthPSSStandardComponentsDetailOne}</div>
                <ul>
                    <li>{strings.healthPSSStandardComponentsItemOne}</li>
                    <li>{strings.healthPSSStandardComponentsItemTwo}</li>
                </ul>
                <div>{strings.healthPSSStandardComponentsDetailTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthPSSSpecificationsTitle}
            >
                <TextOutput
                    value={strings.healthPSSSpecificationsNsValue}
                    label={strings.healthPSSSpecificationsNsLabel}
                />
            </SurgeContentContainer>

            <SurgeContentContainer
                heading={strings.healthPSSAdditionalResources}
            >
                {strings.healthPSSAdditionalResourcesLink}
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueHealthEruPsychosocialSupport';
