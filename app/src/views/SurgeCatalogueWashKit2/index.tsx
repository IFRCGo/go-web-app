import {
    Image,
    TextOutput,
} from '@ifrc-go/ui';
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
            heading={strings.washKitTitle}
            goBackFallbackLink="surgeCatalogueWash"
        >
            <Image
                src="https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/wash-kit2_01.jpg"
                caption={strings.washKitWashKit2}
            />
            <SurgeContentContainer
                heading={strings.washKitCapacity}
            >
                <div>{strings.washKitCapacityText}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.washKitEmergencyServices}
            >
                <div>{strings.washKitEmergencyServicesSectionOne}</div>
                <div>{strings.washKitEmergencyServicesSectionTwo}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.washKit2Specification}
            >
                <TextOutput
                    value={strings.washKit2SpecificationWeightValue}
                    label={strings.washKit2SpecificationWeightLabel}
                    strongLabel
                />
                <TextOutput
                    value={strings.washKit2SpecificationVolumeValue}
                    label={strings.washKit2SpecificationVolumeLabel}
                    strongLabel
                />
                <div>
                    {strings.washKit2SpecificationDetail}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueWashKit2';
