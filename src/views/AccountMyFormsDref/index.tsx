import { useState } from 'react';
import { ChevronLeftLineIcon, ChevronRightLineIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import useTranslation from '#hooks/useTranslation';

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
