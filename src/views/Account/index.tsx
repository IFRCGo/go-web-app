import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';
import accountStrings from '#strings/account';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation('account', accountStrings);

    return (
        <Page
            title={strings.accountInformation}
        >
            Account Page
        </Page>
    );
}

Component.displayName = 'Account';
