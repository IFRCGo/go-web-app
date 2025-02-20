import { useTranslation } from '@ifrc-go/ui/hooks';

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
            heading={strings.humanHeading}
        >
            <SurgeContentContainer
                heading={strings.otherOverview}
            >
                <div>{strings.otherOverviewDetail}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>{strings.rapidResponseDetail}</div>
                <ul>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EQ2XIVDyiHFGh8G27WHDgnEBxS_tdNbtzfFw6nV6HXRaag"
                            external
                            withLinkIcon
                        >
                            {strings.otherLinkOneCoord}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/ETtWcMNEWz9LoNsUSQQSyiYBPTLLuZyur7y74Ho8l0ctxA"
                            external
                            withLinkIcon
                        >
                            {strings.otherLinkTwoOffice}
                        </Link>
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherHumanResources';
