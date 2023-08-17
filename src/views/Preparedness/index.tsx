import { useContext } from 'react';
import { Outlet, generatePath } from 'react-router-dom';

import perApproach from '#assets/content/per_approach_notext.svg';
import Container from '#components/Container';
import Page from '#components/Page';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        preparednessGlobalSummary: globalSummaryRoute,
        preparednessGlobalPerformance: globalPerformanceRoute,
        preparednessGlobalCatalogue: globalCatalogueRoute,
        preparednessGlobalOperational: globalOperationalRoute,
    } = useContext(RouteContext);

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
                        to="mailto:PER.Team@ifrc.org"
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
                                    to="https://www.ifrc.org/our-work/disasters-climate-and-crises/disaster-preparedness"
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
                    to={generatePath(
                        globalSummaryRoute.absolutePath,
                    )}
                >
                    {strings.globalSummary}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        globalPerformanceRoute.absolutePath,
                    )}
                >
                    {strings.globalPerformance}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        globalCatalogueRoute.absolutePath,
                    )}
                >
                    {strings.catalogueOfResources}
                </NavigationTab>
                <NavigationTab
                    to={generatePath(
                        globalOperationalRoute.absolutePath,
                    )}
                >
                    {strings.operationalLearning}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Preparedness';
