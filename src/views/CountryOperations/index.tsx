import {
    useParams,
    useOutletContext,
} from 'react-router-dom';
import { type CountryOutletContext } from '#utils/outletContext';

import AppealOperationTable from './AppealOperationTable';
import EmergenciesOperationTable from './EmergenciesOperationTable';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    return (
        <div className={styles.operationContent}>
            <AppealOperationTable
                countryId={countryId}
                countryName={countryResponse?.name ?? '--'}
            />
            <EmergenciesOperationTable
                countryId={countryId}
                countryName={countryResponse?.name ?? '--'}
            />
        </div>
    );
}

Component.displayName = 'CountryOperations';
