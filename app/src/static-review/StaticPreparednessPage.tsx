import {
    NavLink,
    Outlet,
} from 'react-router-dom';
import {
    ButtonLayout,
    Container,
    Description,
    Image,
    ListView,
    NavigationTabList,
    TabLayout,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import perApproach from '#assets/content/per_approach_notext.svg';
import linkStyles from '#components/Link/styles.module.css';
import navigationTabStyles from '#components/NavigationTab/styles.module.css';
import Page from '#components/Page';
import i18n from '#views/Preparedness/i18n.json';

interface StaticNavigationTabProps {
    to: string;
    children: React.ReactNode;
}

function ExternalButtonLink(props: {
    href: string;
    children: React.ReactNode;
    colorVariant?: 'primary' | 'text';
    styleVariant?: 'filled' | 'action';
}) {
    const {
        href,
        children,
        colorVariant = 'text',
        styleVariant = 'action',
    } = props;

    return (
        <a
            className={linkStyles.link}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <ButtonLayout
                className={linkStyles.layout}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                spacingOffset={styleVariant === 'action' ? -5 : -3}
            >
                {children}
            </ButtonLayout>
        </a>
    );
}

function StaticNavigationTab(props: StaticNavigationTabProps) {
    const { to, children } = props;

    return (
        <NavLink
            className={navigationTabStyles.navigationTab}
            to={to}
        >
            {({ isActive }) => (
                <TabLayout active={isActive}>
                    {children}
                </TabLayout>
            )}
        </NavLink>
    );
}

function StaticPreparednessPage() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.preparednessTitle}
            heading={strings.preparednessHeading}
            description={strings.preparednessDescription}
        >
            <Container
                heading={strings.preparednessApproachSection}
                withHeaderBorder
                headerActions={(
                    <ExternalButtonLink
                        href="mailto:PER.Team@ifrc.org"
                        colorVariant="primary"
                        styleVariant="filled"
                    >
                        {strings.contactPerTeam}
                    </ExternalButtonLink>
                )}
            >
                <ListView
                    layout="grid"
                    withSidebar
                >
                    <Description textSize="lg">
                        {resolveToComponent(
                            strings.approachDescription,
                            {
                                link: (
                                    <ExternalButtonLink href="https://www.ifrc.org/our-work/disasters-climate-and-crises/disaster-preparedness">
                                        {strings.approachDescriptionLinkLabel}
                                    </ExternalButtonLink>
                                ),
                            },
                        )}
                    </Description>
                    <Image
                        src={perApproach}
                        alt={strings.perApproachDiagramAlt}
                        size="lg"
                        withoutBackground
                        withContainedFit
                    />
                </ListView>
            </Container>
            <NavigationTabList>
                <StaticNavigationTab to="/preparedness/global-summary">
                    {strings.globalSummary}
                </StaticNavigationTab>
                <StaticNavigationTab to="/preparedness/global-performance">
                    {strings.globalPerformance}
                </StaticNavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

export default StaticPreparednessPage;
