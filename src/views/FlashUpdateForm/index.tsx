import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import flashUpdateStrings from '#strings/flashUpdate';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('register', flashUpdateStrings);

    return (
        <Page
            title={strings.flashUpdateFormPageTitle}
        >
            Flash Update Form
        </Page>
    );
}

Component.displayName = 'FlashUpdateForm';
