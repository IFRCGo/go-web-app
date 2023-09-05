import { useOutletContext, useParams } from 'react-router-dom';
import { type EmergencyOutletContext } from '#utils/outletContext';
import HtmlOutput from '#components/HtmlOutput';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { routeName } = useParams<{ routeName: string }>();
    console.log('route', routeName);
    const { emergencyAdditionalTabs } = useOutletContext<EmergencyOutletContext>();
    console.log('tabRepsonse', emergencyAdditionalTabs);

    const snippets = emergencyAdditionalTabs?.filter((tab) => tab.routeName === routeName);
    console.log(snippets);
    return (
        <div>
            {snippets?.map((sanitize) => (
                <HtmlOutput
                    value={sanitize.snippet}
                />
            ))}
        </div>
    );
}

Component.displayName = 'EmergencyAdditionalTab';
