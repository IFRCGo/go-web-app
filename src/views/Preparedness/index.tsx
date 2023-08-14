import { useContext } from 'react';
import { Outlet, generatePath } from 'react-router-dom';

import perApproach from '#assets/content/per_approach_notext.svg';
import Container from '#components/Container';
import Page from '#components/Page';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import NavigationTabList from '#components/NavigationTabList';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

import styles from './styles.module.css';
import { resolveToComponent } from '#utils/translation';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        preparednessGlobalSummary: globalSummaryRoute,
        preparednessGlobalPerformance: globalPerformanceRoute,
        preparednessGlobalCatalogue: globalCatalogueRoute,
        PreparednessGlobalOperational: globalOperationalRoute,
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
            >
                <div className={styles.approachDescription}>
                    <div className={styles.approachText}>
                        {resolveToComponent(
                            strings.approachContent,
                            {
                                link: (

                                    <Link
                                        to="https://www.ifrc.org/our-work/disasters-climate-and-crises/disaster-preparedness"
                                        className={styles.approachLink}
                                    >
                                        {strings.approachContentLink}
                                    </Link>
                                )
                            }
                        )}
                    </div>``
                    <Link
                        className={styles.contactPerTeam}
                        to="mailto:PER.Team@ifrc.org"
                        variant="primary"
                    >
                        {strings.contactPerTeam}
                    </Link>
                </div>
                <img
                    className={styles.approachImage}
                    src={perApproach}
                    alt="Per approach no text"
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
