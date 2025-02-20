import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const imageList = useMemo(
        () => ([
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_01.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_02.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_03.jpg',
            },
            {
                src: 'https://prddsgofilestorage.blob.core.windows.net/api/documents/surge/security-management_04.jpg',
            },
        ]),
        [],
    );

    return (
        <SurgeCatalogueContainer
            heading={strings.securityManagementTitle}
            imageList={imageList}
        >
            <SurgeContentContainer
                heading={strings.capacityTitle}
            >
                <div>{strings.capacityDetails}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.emergencyTitle}
            >
                <div>{strings.emergencyContent}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.designedForTitle}
            >
                <TextOutput
                    label={strings.strategic}
                    strongLabel
                    value={strings.strategicContent}
                />
                <TextOutput
                    label={strings.operational}
                    strongLabel
                    value={strings.operationalContent}
                />
                <TextOutput
                    label={strings.compliance}
                    strongLabel
                    value={strings.complianceContent}
                />
                <TextOutput
                    label={strings.coordination}
                    strongLabel
                    value={strings.coordinationContent}
                />
                <TextOutput
                    label={strings.training}
                    strongLabel
                    value={strings.trainingContent}
                />
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.variationTitle}
            >
                <div>{strings.variationContent}</div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueSecurityManagement';
