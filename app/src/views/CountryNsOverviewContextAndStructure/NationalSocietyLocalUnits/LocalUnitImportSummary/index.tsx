import {
    CheckboxCircleLineIcon,
    CloseCircleLineIcon,
    DownloadTwoFillIcon,
} from '@ifrc-go/icons';
import {
    Container,
    ListView,
    NumberOutput,
    ProgressBar,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type BulkUploadResponse = NonNullable<GoApiResponse<'/api/v2/bulk-upload-local-unit/'>['results']>[number];
type BulkUploadEnumsResponse = NonNullable<GoApiResponse<'/api/v2/global-enums/'>['local_units_bulk_upload_status']>[number];
type BulkStatusKey = BulkUploadEnumsResponse['key'];

const BULK_UPLOAD_SUCCESS = 1 satisfies BulkStatusKey;
// const BULK_UPLOAD_FAILED = 2 satisfies BulkStatusKey;
const BULK_UPLOAD_PENDING = 3 satisfies BulkStatusKey;

interface Props {
    value: BulkUploadResponse | undefined;
    withPadding?: boolean;
    withBackground?: boolean;
}

function LocalUnitImportSummary(props: Props) {
    const {
        value,
        withPadding,
        withBackground,
    } = props;
    const strings = useTranslation(i18n);

    const totalCount = isDefined(value)
        ? ((value.success_count ?? 0) + (value.failed_count ?? 0))
        : undefined;

    return (
        <Container
            className={styles.bulkUploadStatus}
            pending={value?.status === BULK_UPLOAD_PENDING}
            pendingMessage={strings.processingMessage}
            withPadding={withPadding}
            withBackground={withBackground}
        >
            <ListView layout="block">
                {isDefined(totalCount) && (
                    <ProgressBar
                        value={value?.success_count}
                        totalValue={totalCount}
                        title={resolveToComponent(
                            strings.rowsSuccessLabel,
                            {
                                numRows: (
                                    <NumberOutput
                                        value={value?.success_count}
                                    />
                                ),
                                total: (
                                    <NumberOutput
                                        value={totalCount}
                                    />
                                ),
                            },
                        )}
                        description={isDefined(value?.failed_count) && resolveToComponent(
                            strings.rowsFailedLabel,
                            {
                                numRows: value?.failed_count,
                            },
                        )}
                    />
                )}
                <div />
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection
                >
                    <TextOutput
                        label={strings.statusLabel}
                        value={value?.status_details}
                        strongValue
                        description={value?.status === BULK_UPLOAD_SUCCESS
                            ? (
                                <CheckboxCircleLineIcon
                                    className={_cs(styles.icon, styles.successIcon)}
                                />
                            ) : (
                                <CloseCircleLineIcon
                                    className={_cs(styles.icon, styles.failureIcon)}
                                />
                            )}
                    />
                    {isDefined(value?.error_file) && (
                        <Link
                            external
                            href={value?.error_file}
                            styleVariant="action"
                            className={styles.downloadLink}
                            before={<DownloadTwoFillIcon className={styles.icon} />}
                            withUnderline
                        >
                            {strings.downloadErrorDetailFileLabel}
                        </Link>
                    )}
                    {isDefined(value?.file) && (
                        <Link
                            external
                            href={value?.file}
                            styleVariant="action"
                            className={styles.downloadLink}
                            withUnderline
                            before={<DownloadTwoFillIcon className={styles.icon} />}
                        >
                            {strings.downloadAttachedFileLabel}
                        </Link>
                    )}
                </ListView>
            </ListView>
        </Container>
    );
}

export default LocalUnitImportSummary;
