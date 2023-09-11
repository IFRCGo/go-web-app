import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiMTM4Y2ZhZGEtNGZmMS00ODZhLWFjZjQtMTE2ZTIyYTI0ODc4IiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9&pageName=ReportSectionfa0be9512521e929ae4a';

    return (
        <div className={styles.preparednessOperationalLearning}>
            <iframe
                title={strings.operationalLearningTitle}
                className={styles.operationalIframe}
                src={url}
            />
        </div>
    );
}

Component.displayName = 'PreparednessOperationalLearing';
