import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import emergencyString from '#strings/emergency';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('emergency', emergencyString);

    return (
        <Page
            title={strings.emergencyPageTitle}
        >
            Emergency Page
        </Page>
    );
}

Component.displayName = 'Emergency';
