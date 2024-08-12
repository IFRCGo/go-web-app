import { ArrowDownSmallFillIcon } from '@ifrc-go/icons';
import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

function ByComponent() {
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
            { summariesResponse?.components?.map((result) => (
                <Container
                    className={styles.componentContainer}
                    heading={result.title}
                    headingDescription={resolveToString(
                        strings.byComponentExtracts,
                        { count: summariesResponse.components.length },
                    )}
                    headerDescription={result.content}
                    actions={(
                        <div>
                            {resolveToString(
                                strings.byComponentSourceOperations,
                                { count: summariesResponse.components.length },
                            )}
                        </div>
                    )}
                    footerActions={(
                        <div>
                            {strings.byComponentSeeSource}
                            <ArrowDownSmallFillIcon />
                        </div>
                    )}
                />
            ))}
        </Container>
    );
}

export default ByComponent;
