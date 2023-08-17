import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const url = 'https://app.powerbi.com/view?r=eyJrIjoiYmQxZjFhMzItYzRlNy00ZTQzLWE5ZTEtZDZhNDliNjY4OWEwIiwidCI6ImEyYjUzYmU1LTczNGUtNGU2Yy1hYjBkLWQxODRmNjBmZDkxNyIsImMiOjh9';

    return (
        <div className={styles.catalogueContainer}>
            <iframe
                title={strings.catalogueResourcesTitle}
                className={styles.catalogueIframe}
                src={url}
            />
        </div>
    );
}

Component.displayName = 'PreparednessCatalogueResources';
