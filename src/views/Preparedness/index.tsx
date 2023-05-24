import Page from '#components/Page';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <Page
            title={strings.preparednessTitle}
        >
            Preparedness Page
        </Page>
    );
}

Component.displayName = 'Preparedness';
