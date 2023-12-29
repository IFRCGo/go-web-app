import {
    useOutletContext,
    useParams,
} from 'react-router-dom';
import { isFalsyString } from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';

import AppealOperationTable from './AppealOperationTable';
import EmergenciesOperationTable from './EmergenciesOperationTable';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    // FIXME: show proper error message
    if (isFalsyString(countryId)) {
        return null;
    }

    const numericCountryId = Number(countryId);

    return (
        <div className={styles.operationContent}>
            <AppealOperationTable
                countryId={numericCountryId}
                countryName={countryResponse?.name ?? '--'}
            />
            <EmergenciesOperationTable
                countryId={numericCountryId}
                countryName={countryResponse?.name ?? '--'}
            />
        </div>
    );
}

Component.displayName = 'CountryOperations';
