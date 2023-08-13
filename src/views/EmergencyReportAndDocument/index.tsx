import UnderConstructionMessage from '#components/UnderConstructionMessage';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div>
            <UnderConstructionMessage
                title={strings.emergencyReportAndDocumentTempContent}
            />
        </div>
    );
}

Component.displayName = 'EmergencyReportAndDocument';
