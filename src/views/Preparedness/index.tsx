import { Outlet } from 'react-router-dom';

import perApproach from '#assets/content/per_approach_notext.svg';
import Container from '#components/Container';
import Page from '#components/Page';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

import styles from './styles.module.css';

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
                actions={(
                    <Link
                        href="mailto:PER.Team@ifrc.org"
                        external
                        variant="primary"
                    >
                        {strings.contactPerTeam}
                    </Link>
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
                    // FIXME: use translations
                    alt="Per approach diagram"
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
                <NavigationTab
                    to="preparednessGlobalOperational"
                >
                    {strings.operationalLearning}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Preparedness';
