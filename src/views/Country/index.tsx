import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';

import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';

import CountryPlan from './CountryPlan';

import i18n from './i18n.json';

const noOp = () => {
    // eslint-disable-next-line no-console
    console.info('no operation');
};

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.countryPageTitle}
            heading="Country Page"
            description="This is description of the Country Page"
        >
            <Tabs
                value="country-plan"
                onChange={noOp}
            >
                <TabList>
                    <Tab name="country-plan">
                        Country Plan
                    </Tab>
                    <Tab name="three-w">
                        3W
                    </Tab>
                    <Tab name="risk">
                        Risk
                    </Tab>
                </TabList>
                <CountryPlan />
            </Tabs>
        </Page>
    );
}

Component.displayName = 'Country';
