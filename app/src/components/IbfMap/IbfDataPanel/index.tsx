import { CountryData } from '#utils/ibfMap';
import styles from './styles.module.css';

interface IbfDataPanelProps {
    selectedCountry: string;
}

/**
 * Debug component for showing country data. *
 * This will change once we have a design. *
 * @param selectedCountry - ISO_A2 code of the selected country
 * @returns A component that is intended to be nested within a IbfMapContainer.
 */
export function IbfDataPanel({ selectedCountry }: IbfDataPanelProps) {
    const countryInfo = selectedCountry ? CountryData.get(selectedCountry) : null;

    return (
        <div className={styles.dataContainer}>
            { countryInfo ? (
                <div>
                    <p><strong>wwww: {countryInfo.name_en}</strong></p>
                    <p>wwww: IBF Supported: {countryInfo.ibfSupported ? 'Yes' : 'No'}</p>
                </div>
            ) :
                <div>
                    <p><strong>wwww: ---</strong></p>
                    <p>wwww: No country selected</p>
                </div>
            }
        </div>
    );
}
