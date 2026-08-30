import { useState } from 'react';
import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import Link from '#components/Link';

import ActiveDrefTable from './ActiveDrefTable';
import CompletedDrefTable from './CompletedDrefTable';
import DownloadImportTemplateButton from './DownloadImportTemplateButton';

import i18n from './i18n.json';
import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [currentView, setCurrentView] = useState<'active' | 'completed'>('active');
    const strings = useTranslation(i18n);

    return (
        <div className={styles.accountDrefApplications}>
            <ListView
                layout="block"
                withCenteredContents
            >
                <DownloadImportTemplateButton />
                <Link
                    href="https://forms.office.com/e/wFQsu0V7Zb"
                    styleVariant="action"
                    external
                    withLinkIcon
                    withUnderline
                >
                    {strings.drefFeedbackForm}
                </Link>
            </ListView>
            {currentView === 'active' && (
                <ActiveDrefTable
                    actions={(
                        <Button
                            name="completed"
                            onClick={setCurrentView}
                            styleVariant="action"
                            after={<ChevronRightLineIcon className={styles.icon} />}
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
                            styleVariant="action"
                            before={<ChevronLeftLineIcon className={styles.icon} />}
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
