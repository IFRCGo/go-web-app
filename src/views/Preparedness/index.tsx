import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import homePageStrings from '#strings/home';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('home', homePageStrings);

    return (
        <Page
            title={strings.homeTitle}
        >
            Page
        </Page>
    );
}

Component.displayName = 'Preparedness';
