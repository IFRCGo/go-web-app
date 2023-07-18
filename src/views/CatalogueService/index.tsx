import Container from '#components/Container';
import Heading from '#components/Heading';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import Link from '#components/Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Container
            headingLevel={2}
            heading={strings.catalogueServiceTitle}
            className={styles.catalogueService}
            childrenContainerClassName={styles.content}
        >
            <Heading className={styles.heading}>
                {strings.rapidResponseAndAssets}
            </Heading>
            <div>{strings.rapidResponseAndAssetsDetailsTop}</div>
            <div>{strings.rapidResponseAndAssetsDetailsBottom}</div>
            <Heading className={styles.heading}>
                {strings.coreCompetencyFramework}
            </Heading>
            <div>
                {resolveToComponent(
                    strings.coreCompetencyFrameworkDetailsTop,
                    {
                        link: (
                            <Link
                                to="https://ifrcorg.sharepoint.com/:b:/s/IFRCSharing/EZgW1LWU_rpOpbe9pT7NnFQBVL8GL9r0JGjlJmleC4ujuA"
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
                                to="https://surgelearning.ifrc.org/resources/minimum-training-required-surge-personnel"
                            >
                                {strings.link}
                            </Link>
                        ),
                    },
                )}
            </div>
        </Container>
    );
}

Component.displayName = 'CatalogueService';
