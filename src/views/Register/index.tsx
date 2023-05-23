import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import registerPageStrings from '#strings/register';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('register', registerPageStrings);

    return (
        <Page
            title={strings.registerTitle}
        >
            Register Page
        </Page>
    );
}

Component.displayName = 'Register';
