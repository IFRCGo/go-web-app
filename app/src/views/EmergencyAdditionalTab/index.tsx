import { useContext } from 'react';
import {
    generatePath,
    Navigate,
    useLocation,
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { HtmlOutput } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import RouteContext from '#contexts/route';
import { type EmergencyOutletContext } from '#utils/outletContext';

interface Props {
    infoPageId?: number;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const urlParams = useParams<{ tabId: string }>();
    const location = useLocation();
    const routes = useContext(RouteContext);
    const { infoPageId } = props;
    const { emergencyAdditionalTabs } = useOutletContext<EmergencyOutletContext>();

    const additionalTab = emergencyAdditionalTabs?.find(
        (tab) => tab.infoPageId === infoPageId
            || urlParams.tabId === tab.tabId
            || location.hash === `#${tab.tabId}`,
    );

    if (isDefined(additionalTab) && `#${additionalTab.tabId}` === location.hash) {
        const newPath = generatePath(

            routes.emergencyAdditionalInfo.absoluteForwardPath,
            {
                ...urlParams,
                tabId: additionalTab.tabId,
            },
        );

        return (
            <Navigate
                to={newPath}
                replace
            />
        );
    }

    return (
        <TabPage>
            {additionalTab?.snippets?.map((snippet) => (
                <HtmlOutput
                    key={snippet.id}
                    value={snippet.snippet}
                />
            ))}
        </TabPage>
    );
}

Component.displayName = 'EmergencyAdditionalTab';
