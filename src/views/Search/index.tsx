import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import searchPageStrings from '#strings/search';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('search', searchPageStrings);

    return (
        <Page
            title={strings.searchPageTitle}
        >
            Search Page
        </Page>
    );
}

Component.displayName = 'Search';
