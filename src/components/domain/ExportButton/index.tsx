import { useMemo } from 'react';
import {
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';

import NumberOutput from '#components/NumberOutput';
import { resolveToComponent } from '#utils/translation';
import useTranslation from '#hooks/useTranslation';
import Button from '#components/Button';

import i18n from './i18n.json';

interface Props {
    onClick: () => void;
    disabled?: boolean;
    progress: number;
    pendingExport: boolean;
    totalCount: number | undefined;
}

function ExportButton(props: Props) {
    const {
        onClick,
        disabled,
        progress,
        pendingExport,
        totalCount = 0,
    } = props;
    const strings = useTranslation(i18n);

    const exportButtonLabel = useMemo(() => {
        if (!pendingExport) {
            return strings.exportTableButtonLabel;
        }
        return resolveToComponent(
            strings.exportTableDownloadingButtonLabel,
            {
                progress: (
                    <NumberOutput
                        value={progress * 100}
                        maximumFractionDigits={0}
                    />
                ),
            },
        );
    }, [
        strings.exportTableButtonLabel,
        strings.exportTableDownloadingButtonLabel,
        progress,
        pendingExport,
    ]);

    return (
        <Button
            name={undefined}
            onClick={onClick}
            icons={<DownloadTwoLineIcon />}
            disabled={totalCount < 1 || pendingExport || disabled}
            variant="secondary"
        >
            {exportButtonLabel}
        </Button>
    );
}

export default ExportButton;
