import styles from './styles.module.css';

interface NrwDataPanelProps {
    selectedCountry: string;
}

/**
 * Debug component for showing country data. *
 * This will change once we have a design. *
 * @param selectedCountry - ISO_A3 code of the selected country
 * @returns A component that is intended to be nested within a NrwMapContainer.
 */
export default function NrwDataPanel({ selectedCountry }: NrwDataPanelProps) {
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
