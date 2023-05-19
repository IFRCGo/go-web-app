import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import homePageStrings from '#strings/home';

export function Component() {
    const strings = useTranslation('home', homePageStrings);

    return (
        <Page
            title={strings.homeTitle}
        >
            Region Page
        </Page>
    );
}

Component.displayName = 'Home';
