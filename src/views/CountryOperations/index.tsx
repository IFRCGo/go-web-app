import {
    useParams,
} from 'react-router-dom';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import AppealOperationTable from './AppealOperationTable';
import EmergenciesOperationTable from './EmergenciesOperationTable';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);

    return (
        <>
            <AppealOperationTable
                countryId={countryId}
            />
            <EmergenciesOperationTable
                countryId={countryId}
            />
        </>
    );
}

Component.displayName = 'CountryOperations';
