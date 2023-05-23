import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import regionPageStrings from '#strings/region';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('region', regionPageStrings);

    return (
        <Page
            title={strings.regionTitle}
        >
            Region Page
        </Page>
    );
}

Component.displayName = 'Region';
