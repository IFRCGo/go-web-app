import { LockLineIcon } from '@ifrc-go/icons';
import { isDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface LocalUnitPopupData {
    localBranchName: string;
    englishBranchName?: string;
    addressLoc?: string;
    addressEn?: string;
    modifiedAt?: string;
    status?: string;
    statusDisplay?: string;
    typeName?: string;
    healthFacilityTypeName?: string;
    link?: string;
}

interface LocalUnitPopupContentProps {
    data: LocalUnitPopupData;
    onClose: () => void;
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const isoString = date.toISOString();
        return isoString.split('T')[0] ?? isoString;
    } catch {
        return dateString;
    }
}

/**
 * Content for the map popup panel.
 * May 1 2026: There is no design for this yet, so this is just a proof of concept.
 *    IFRC GO uses the <MapPopup> component, which the style on this was based on.
 *    However, <MapPopup> is highly coupled to MapBox GL, so we can't use it directly.
 *    See https://go.ifrc.org/countries/136/ns-overview/context-and-structure to see that component.
 */
function LocalUnitPopupContent(props: LocalUnitPopupContentProps) {
    const { data, onClose } = props;

    const displayName = data.localBranchName || data.englishBranchName || 'Unknown location';
    const displayAddress = data.addressLoc || data.addressEn || undefined;
    const isExternallyManaged = data.status === 'externally_managed';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.title}>
                        {displayName}
                    </div>
                    {data.statusDisplay && (
                        <div className={styles.statusBadge}>
                            {isExternallyManaged && (
                                <LockLineIcon className={styles.statusIcon} />
                            )}
                            {data.statusDisplay}
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
            <div className={styles.content}>
                {isDefined(data.modifiedAt) && (
                    <div className={styles.field}>
                        <span className={styles.label}>Last updated:</span>
                        {' '}
                        <span className={styles.value}>{formatDate(data.modifiedAt)}</span>
                    </div>
                )}
                {isDefined(displayAddress) && (
                    <div className={styles.field}>
                        <div className={styles.label}>Address:</div>
                        <div className={styles.value}>{displayAddress}</div>
                    </div>
                )}
                {isDefined(data.typeName) && (
                    <div className={styles.field}>
                        <span className={styles.label}>Local unit type:</span>
                        {' '}
                        <span className={styles.value}>{data.typeName}</span>
                    </div>
                )}
                {isDefined(data.healthFacilityTypeName) && (
                    <div className={styles.field}>
                        <span className={styles.label}>Health facility type:</span>
                        {' '}
                        <span className={styles.value}>{data.healthFacilityTypeName}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LocalUnitPopupContent;
