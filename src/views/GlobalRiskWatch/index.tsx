import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import commonStrings from '#strings/common';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('common', commonStrings);

    return (
        <Page
            title={strings.riskPageTitle}
        >
            Global Risk Watch Page
        </Page>
    );
}

Component.displayName = 'GlobalRiskWatch';
