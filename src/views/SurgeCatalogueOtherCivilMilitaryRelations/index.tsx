import SurgeCatalogueContainer from '#components/domain/SurgeCatalogueContainer';
import SurgeContentContainer from '#components/domain/SurgeContentContainer';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <SurgeCatalogueContainer
            heading={strings.civilMilitaryHeading}
            goBackFallbackLink="surgeCatalogueOther"
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
                                    to="https://ifrcorg.sharepoint.com/sites/IFRCSharing/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fother%2FRapid%20Response%20Profile%20Civ%2DMil%20Relations%20Coordinator%2Epdf&parent=%2Fsites%2FIFRCSharing%2FShared%20Documents%2FGLOBAL%20SURGE%2FCatalogue%20of%20Surge%20services%20%28final%29%2Fother&p=true&ga=1"
                                    external
                                    withExternalLinkIcon
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
