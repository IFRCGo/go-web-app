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
            heading={strings.catalogueServiceTitle}
        >
            <SurgeContentContainer
                heading={strings.rapidResponseAndAssets}
            >
                <div>{strings.rapidResponseAndAssetsDetailsTop}</div>
                <div>{strings.rapidResponseAndAssetsDetailsBottom}</div>
            </SurgeContentContainer>
            <SurgeContentContainer
                heading={strings.coreCompetencyFramework}
            >
                <div>
                    {resolveToComponent(
                        strings.coreCompetencyFrameworkDetailsTop,
                        {
                            link: (
                                <Link
                                    href="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZgW1LWU_rpOpbe9pT7NnFQBVL8GL9r0JGjlJmleC4ujuA"
                                    external
                                    withUnderline
                                >
                                    {strings.coreCompetencyFrameworkLabel}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <div>
                    {resolveToComponent(
                        strings.coreCompetencyFrameworkDetailsBottom,
                        {
                            link: (
                                <Link
                                    href="https://surgelearning.ifrc.org/resources/minimum-training-required-surge-personnel"
                                    external
                                    withUnderline
                                >
                                    {strings.link}
                                </Link>
                            ),
                        },
                    )}
                </div>
            </SurgeContentContainer>
        </SurgeCatalogueContainer>
    );
}

Component.displayName = 'SurgeCatalogueOverview';
