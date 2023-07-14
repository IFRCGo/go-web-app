import { useParams } from 'react-router-dom';

import Container from '#components/Container';
import Link from '#components/Link';
import useTranslation from '#hooks/useTranslation';
import HistoricalDataChart from './HistoricalDataChart';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryId } = useParams<{ countryId: string }>();
    const strings = useTranslation(i18n);

    return (
        <div className={styles.countryRiskWatch}>
            <Container
                heading={strings.risksByMonthHeading}
                headingLevel={2}
                headerDescription={strings.risksByMonthDescription}
                withHeaderBorder
            >
                Risk Table should be here
            </Container>
            <div className={styles.eapSection}>
                <Container
                    className={styles.eapContainer}
                    heading={strings.eapHeading}
                    actions={(
                        <Link
                            to="https://www.ifrc.org/appeals?date_from=&date_to=&type%5B%5D=30&appeal_code=&text="
                            withExternalLinkIcon
                            variant="primary"
                        >
                            {strings.eapDownloadButtonLabel}
                        </Link>
                    )}
                >
                    {strings.eapDescription}
                </Container>
            </div>
            <HistoricalDataChart countryId={Number(countryId)} />
        </div>
    );
}

Component.displayName = 'CountryRiskWatch';
