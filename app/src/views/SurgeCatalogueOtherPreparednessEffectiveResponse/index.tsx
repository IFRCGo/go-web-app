import { Image } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import perImage from '#assets/images/surge-per.gif';
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
            heading={strings.preparednessHeading}
            description={(
                <>
                    <div>{strings.otherOverviewDetail1}</div>
                    <div>{strings.otherOverviewDetail2}</div>
                    <div>{strings.otherOverviewDetail3}</div>
                    <Image
                        src={perImage}
                        alt={strings.preparednessHeading}
                    />
                </>
            )}
        >
            <SurgeContentContainer
                heading={strings.rapidResponse}
            >
                <div>{strings.rapidResponseDetail}</div>
                <ul>
                    <li>
                        <Link
                            href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/Edaaenk6m4NKs_umF3XKdIQBST4a5xaQxmmYqJk9cNrSiw"
                            external
                        >
                            {strings.otherLinkOne}
                        </Link>
                    </li>
                </ul>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOtherPreparednessEffectiveResponse';
