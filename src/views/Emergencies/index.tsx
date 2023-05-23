import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import emergencyStrings from '#strings/emergency';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('emergency', emergencyStrings);

    return (
        <Page
            title={strings.emergenciesTitle}
        >
            Emergencies Page
        </Page>
    );
}

Component.displayName = 'Emergencies';
