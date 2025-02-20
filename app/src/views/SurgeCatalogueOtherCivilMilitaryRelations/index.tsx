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
            heading={strings.civilMilitaryHeading}
        >
            <SurgeContentContainer
                heading={strings.civilMilitaryOverview}
            >
                <div>{strings.civilMilitaryOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.civilRapidResponse}
            >
                <div>
                    {resolveToComponent(
                        strings.civilRapidResponseDetail,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EViKjU_w21dBpQtGEr9CtgQBvljB_2I52J51BhljrUg8Ow"
                                    external
                                    withLinkIcon
                                >
                                    {strings.civilLink}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherCivilMilitaryRelations';
