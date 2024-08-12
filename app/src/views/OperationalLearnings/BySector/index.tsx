import { ArrowDownSmallFillIcon } from '@ifrc-go/icons';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function BySector() {
    const strings = useTranslation(i18n);
    const {
        response: summariesResponse,
    } = useRequest({
        url: '/api/v2/ops-learning/summary/',
        preserveResponse: true,
    });

    return (
        <Container
            spacing="relaxed"
        >
            { summariesResponse?.sectors.map((result) => (
                <Container
                    className={styles.sectorContainer}
                    heading={result.title}
                    headerDescription={result.content}
                    headingDescription={resolveToString(
                        strings.bySectorsExtracts,
                        { count: summariesResponse.components.length },
                    )}
                    actions={resolveToString(
                        strings.bySectorSourceOperations,
                        { count: summariesResponse.components.length },
                    )}
                    footerActions={(
                        <div>
                            {strings.bySectorSeeSource}
                            <ArrowDownSmallFillIcon />
                        </div>
                    )}
                />
            ))}
        </Container>
    );
}

export default BySector;
