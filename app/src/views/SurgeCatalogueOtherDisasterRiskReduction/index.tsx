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
            heading={strings.disasterRiskHeading}
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.otherRapidResponse}
            >
                <div>
                    {resolveToComponent(
                        strings.otherRapidResponseDetail,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EbivNvjEqjxLkiJA3xeaLlUBDCyH8Oh4U8Y7gaRA3XROUQ"
                                    external
                                >
                                    {strings.otherLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherDisasterRiskReduction';
