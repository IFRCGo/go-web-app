import { useState } from 'react';
import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import ActiveDrefTable from './ActiveDrefTable';
import CompletedDrefTable from './CompletedDrefTable';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [currentView, setCurrentView] = useState<'active' | 'completed'>('active');
    const strings = useTranslation(i18n);

    return (
        <div className={styles.accountDrefApplications}>
            <div className={styles.drefFeedbackForm}>
                <Link
                    href="https://forms.office.com/pages/responsepage.aspx?id=5Tu1ok5zbE6rDdGE9g_ZFwFnyoRVgjpFtGr2viq4vX9UN0IwQ0NCQkpNSElDRVk1R1U3Q0tJV1I5VS4u"
                    variant="tertiary"
                    external
                    withLinkIcon
                    withUnderline
                >
                    {strings.drefFeedbackForm}
                </Link>
            </div>
            {currentView === 'active' && (
                <ActiveDrefTable
                    actions={(
                        <Button
                            name="completed"
                            onClick={setCurrentView}
                            variant="tertiary"
                            actions={<ChevronRightLineIcon className={styles.icon} />}
                        >
                            {strings.showCompletedButtonLabel}
                        </Button>
                    )}
                />
            )}
            {currentView === 'completed' && (
                <CompletedDrefTable
                    actions={(
                        <Button
                            name="active"
                            onClick={setCurrentView}
                            variant="tertiary"
                            icons={<ChevronLeftLineIcon className={styles.icon} />}
                        >
                            {strings.backToActiveButtonLabel}
                        </Button>
                    )}
                />
            )}
        </div>
    );
}

Component.displayName = 'AccountDREFApplications';
