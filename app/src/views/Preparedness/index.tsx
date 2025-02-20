import { Outlet } from 'react-router-dom';
import {
    Container,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import perApproach from '#assets/content/per_approach_notext.svg';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';
import WikiLink from '#components/WikiLink';

import i18n from './i18n.json';
import styles from './styles.module.css';
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.preparednessTitle}
            heading={strings.preparednessHeading}
            description={strings.preparednessDescription}
            mainSectionClassName={styles.preparednessContent}
        >
            <Container
                heading={strings.preparednessApproachSection}
                withHeaderBorder
                childrenContainerClassName={styles.approachContent}
                actionsContainerClassName={styles.actionsContainer}
                actions={(
                    <>
                        <Link
                            href="mailto:PER.Team@ifrc.org"
                            external
                            variant="primary"
                        >
                            {strings.contactPerTeam}
                        </Link>
                        <WikiLink
                            href="user_guide/Preparedness"
                        />
                    </>
                )}
            >
                <div className={styles.approachDescription}>
                    {resolveToComponent(
                        strings.approachDescription,
                        {
                            link: (
                                <Link
                                    href="https://www.ifrc.org/our-work/disasters-climate-and-crises/disaster-preparedness"
                                    external
                                    className={styles.approachLink}
                                >
                                    {strings.approachDescriptionLinkLabel}
                                </Link>
                            ),
                        },
                    )}
                </div>
                <img
                    className={styles.approachImage}
                    src={perApproach}
                    alt={strings.perApproachDiagramAlt}
                />
            </Container>
            <NavigationTabList>
                <NavigationTab
                    to="preparednessGlobalSummary"
                >
                    {strings.globalSummary}
                </NavigationTab>
                <NavigationTab
                    to="preparednessGlobalPerformance"
                >
                    {strings.globalPerformance}
                </NavigationTab>
                <NavigationTab
                    to="preparednessGlobalCatalogue"
                >
                    {strings.catalogueOfResources}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Preparedness';
