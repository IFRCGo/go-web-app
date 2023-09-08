import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import TextOutput from '#components/TextOutput';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.healthCCMMTitle}
            goBackFallbackLink="surgeCatalogueHealth"
        >
            <SurgeContentContainer
                heading={strings.healthCCMMCapacityTitle}
            >
                <div>{strings.healthCCMMCapacityDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthCCMMEmergencyServices}
            >
                <div>{strings.healthCCMMEmergencyServicesDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthCCMMDesignedFor}
            >
                <div>{strings.healthCCMMDesignedForDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.healthCCMMDesignedSpecification}
            >
                <TextOutput
                    value={strings.healthCCMMNsValue}
                    label={strings.healthCCMMNsLabel}
                    strongLabel
                />
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueCommunityManagementMalnutrition';
