import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import surgePageStrings from '#strings/surge';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('surge', surgePageStrings);

    return (
        <Page
            title={strings.deploymentsTitle}
        >
            Surge Page
        </Page>
    );
}

Component.displayName = 'Surge';
