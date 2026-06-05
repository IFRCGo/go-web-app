import { type AdminAreaDetails } from '#utils/nrw/nrwDataFetchHelpers';

import styles from './styles.module.css';

interface NrwDataPanelProps {
    selectedCountry: string;
    adminDetails: AdminAreaDetails | null;
}

/**
 * Debug component for showing country data. *
 * This will change once we have a design. *
 * @param selectedCountry - ISO_A3 code of the selected country
 * @param adminDetails - details of the selected admin area, if any
 * @returns A component that is intended to be nested within a NrwMapContainer.
 */
export default function NrwDataPanel({
    selectedCountry,
    adminDetails,
}: NrwDataPanelProps) {
    const population = adminDetails?.population ?? null;

    return (
        <div className={styles.dataContainer}>
            { selectedCountry ? (
                <div>
                    <p>
                        <strong>
                            wwww:
                            {selectedCountry}

                        </strong>
                    </p>
                    <p>
                        wwww: Some_more_info_here
                    </p>
                    <p>
                        <strong>Population: </strong>
                        {population !== null ? population.toLocaleString() : '---'}
                    </p>
                </div>
            )
                : (
                    <div>
                        <p><strong>wwww: ---</strong></p>
                        <p>wwww: No country selected</p>
                    </div>
                )}
        </div>
    );
}
