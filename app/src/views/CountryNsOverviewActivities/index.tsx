import TabPage from '#components/TabPage';

import NationalSocietyDevelopmentInitiatives from './NationalSocietyDevelopmentInitiatives';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <TabPage
            wikiLinkPathName="user_guide/Country_Pages#ns-activities"
        >
            <NationalSocietyDevelopmentInitiatives />
        </TabPage>
    );
}

Component.displayName = 'CountryNsOverviewActivities';
