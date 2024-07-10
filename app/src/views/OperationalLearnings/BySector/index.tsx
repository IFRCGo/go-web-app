import { Container } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

function BySector() {
    const strings = useTranslation(i18n);
    return (
        <Container
            heading="health"
            headerDescription={strings.opsLearningsSummariesDescription}
            actions={(
                <div>
                    66 source 13 operations
                </div>
            )}
            footerContent={(
                <div>
                    see sources
                </div>
            )}
        />
    );
}

export default BySector;
