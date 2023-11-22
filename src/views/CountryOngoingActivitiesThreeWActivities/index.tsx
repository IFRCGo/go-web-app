import CountryPageEmptyMessage from '#components/domain/CountryPageEmptyMessage';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <CountryPageEmptyMessage
            title={strings.pageTitle}
        />
    );
}

Component.displayName = 'CountryOngoingActivitiesThreeWActivities';
