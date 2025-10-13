import { useTranslation } from '@ifrc-go/ui/hooks';

import Page from '#components/Page';

import i18n from './i18n.json';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            heading={strings.eapRegistrationHeading}
            description={strings.eapRegistrationDescription}
        >
            {/* TODO: Add the form */}
            Application Details
        </Page>
    );
}
