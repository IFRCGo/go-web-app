import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import countryPageStrings from '#strings/country';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('country', countryPageStrings);

    return (
        <Page
            title={strings.countryPageTitle}
        >
            Country Page
        </Page>
    );
}

Component.displayName = 'Country';
