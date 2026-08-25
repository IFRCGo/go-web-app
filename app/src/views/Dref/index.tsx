import {
    useEffect,
    useState,
} from 'react';
import {
    Outlet,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import {
    Breadcrumbs,
    ListView,
    NavigationTabList,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import DrefDecisionTreeButton from '#components/domain/DrefDecisionTreeButton';
import Link from '#components/Link';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';

import i18n from './i18n.json';

interface DrefLocationState {
    // Set by the Respond > DREF Decision Tree menu item to open the wizard on arrival.
    openDecisionTree?: boolean;
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const location = useLocation();
    const navigate = useNavigate();

    const [treeRequestKey, setTreeRequestKey] = useState<string | undefined>();

    useEffect(() => {
        if ((location.state as DrefLocationState | null)?.openDecisionTree) {
            // Consume the request then clear the router state so
            // Back/reload does not reopen the decision tree.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTreeRequestKey(location.key);
            navigate(
                {
                    pathname: location.pathname,
                    search: location.search,
                    hash: location.hash,
                },
                {
                    replace: true,
                    state: null,
                    preventScrollReset: true,
                },
            );
        }
    }, [location, navigate]);

    return (
        <Page
            heading={strings.drefHeading}
            breadCrumbs={(
                <Breadcrumbs>
                    <Link to="home">
                        {strings.home}
                    </Link>
                    {strings.respond}
                    {/* Not a self-link: the dref layout route forwards to the
                        response pillar, which would switch tabs. */}
                    {strings.drefHeading}
                </Breadcrumbs>
            )}
            description={(
                <ListView
                    layout="block"
                    withCenteredContents
                >
                    {strings.drefDescription}
                    <DrefDecisionTreeButton
                        // Remount on each navbar request so the modal reopens.
                        key={treeRequestKey}
                        buttonStyleVariant="outline"
                        initiallyOpen={isDefined(treeRequestKey)}
                    />
                </ListView>
            )}
        >
            <NavigationTabList>
                <NavigationTab to="drefAnticipatoryPillar">
                    {strings.drefAnticipatoryPillarTab}
                </NavigationTab>
                <NavigationTab to="drefResponsePillar">
                    {strings.drefResponsePillarTab}
                </NavigationTab>
            </NavigationTabList>
            <Outlet />
        </Page>
    );
}

Component.displayName = 'Dref';
