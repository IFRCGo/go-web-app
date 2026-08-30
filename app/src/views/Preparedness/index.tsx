import { Outlet } from 'react-router-dom';
import {
    Container,
    Description,
    Image,
    ListView,
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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
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
                    <>
                        <Link
                            href="mailto:PER.Team@ifrc.org"
                            external
                            colorVariant="primary"
                            styleVariant="filled"
                        >
                            {strings.contactPerTeam}
                        </Link>
                        <WikiLink
                            pathName="user_guide/Preparedness"
                        />
                    </>
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
                                    <Link
                                        href="https://www.ifrc.org/our-work/disasters-climate-and-crises/disaster-preparedness"
                                        external
                                    >
                                        {strings.approachDescriptionLinkLabel}
                                    </Link>
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
