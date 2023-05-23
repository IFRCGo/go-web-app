import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import resourcesStrings from '#strings/resources';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('resources', resourcesStrings);

    return (
        <Page
            title={strings.aboutTitle}
        >
            Resources Page
        </Page>
    );
}

Component.displayName = 'Resources';
