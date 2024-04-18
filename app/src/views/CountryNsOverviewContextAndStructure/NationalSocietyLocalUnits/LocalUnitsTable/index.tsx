import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

function LocalUnitsTable() {
    const strings = useTranslation(i18n);
    return (
        <div className={styles.table}>
            {strings.localUnitTable}
        </div>
    );
}

export default LocalUnitsTable;
