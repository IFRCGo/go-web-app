import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    DocumentPdfLineIcon,
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import EapExportModal from '#components/domain/EapExportModal';
import Link from '#components/Link';
import { environment } from '#config';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_PENDING_PFA,
    EAP_STATUS_TECHNICALLY_VALIDATED,
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';
import { useLazyRequest } from '#utils/restRequest';

import { type EapExpandedListItem } from '../utils';
import BudgetFileInput from './BudgetFileInput';

import i18n from './i18n.json';

export interface Props {
    expandedListItem: EapExpandedListItem;
    onUpdate?: () => void;
}

function EapTableActions(props: Props) {
    const {
        expandedListItem,
        onUpdate,
    } = props;

    const {
        type,
        eap,
        details,
    } = expandedListItem;

    const [exportWithDiffView, setExportWithDiffView] = useState(false);
    const [summaryExport, setSummaryExport] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const alert = useAlert();
    const { navigate } = useRouting();

    const strings = useTranslation(i18n);

    const setShowExportModalTrue = useCallback((withDiff?: boolean) => {
        if (type === 'pending-pfa') {
            setSummaryExport(true);
        }
        setExportWithDiffView(!!withDiff);
        setShowExportModal(true);
    }, [type]);

    const setShowExportModalFalse = useCallback(() => {
        setSummaryExport(false);
        setExportWithDiffView(false);
        setShowExportModal(false);
    }, []);

    const latestId = useMemo(() => {
        if (eap.eap_type === EAP_TYPE_SIMPLIFIED) {
            return eap.latest_simplified_eap ?? undefined;
        }

        if (eap.eap_type === EAP_TYPE_FULL) {
            return eap.latest_full_eap ?? undefined;
        }

        return undefined;
    }, [eap]);

    const {
        trigger: reviseSEAP,
        pending: reviseSEAPPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/simplified-eap/{id}/revise/',
        pathVariables: isDefined(latestId) ? { id: latestId } : undefined,
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                'title',
                { variant: 'success' },
            );
            navigate(
                'simplifiedEapForm',
                { params: { eapId: eap.id } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                'Failure',
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: reviseFullEAP,
        pending: reviseFullEAPPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/full-eap/{id}/revise/',
        pathVariables: isDefined(latestId) ? { id: latestId } : undefined,
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                'title',
                { variant: 'success' },
            );
            // if (onPublishSuccess) {
            //     onPublishSuccess();
            // }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                'Failure',
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const handleReviseClick = useCallback(
        () => {
            if (eap.eap_type === EAP_TYPE_SIMPLIFIED) {
                reviseSEAP(null);
            }

            if (eap.eap_type === EAP_TYPE_FULL) {
                reviseFullEAP(null);
            }
        },
        [
            eap.eap_type,
            reviseSEAP,
            reviseFullEAP,
        ],
    );

    const latestVersion = useMemo(() => {
        if (eap.eap_type === EAP_TYPE_SIMPLIFIED) {
            return eap.simplified_eap_details.find(({ id }) => latestId === id)?.version;
        }

        if (eap.eap_type === EAP_TYPE_FULL) {
            return eap.full_eap_details.find(({ id }) => latestId === id)?.version;
        }

        return undefined;
    }, [eap, latestId]);

    const isCreated = isDefined(latestId);
    const isLocked = isDefined(details) && !!details.data.is_locked;

    const isLatestVersion = useMemo(() => {
        if (eap.eap_type === EAP_TYPE_SIMPLIFIED) {
            return eap.latest_simplified_eap === details?.data.id;
        }

        if (eap.eap_type === EAP_TYPE_FULL) {
            return eap.latest_full_eap === details?.data.id;
        }

        return false;
    }, [eap, details]);

    const isEditable = useMemo(() => {
        if (isCreated && !isLatestVersion) {
            return false;
        }

        if (isLocked) {
            return false;
        }

        if (eap.status !== EAP_STATUS_UNDER_DEVELOPMENT
            && eap.status !== EAP_STATUS_NS_ADDRESSING_COMMENTS) {
            return false;
        }

        return true;
    }, [isCreated, isLatestVersion, isLocked, eap]);

    const isRevised = useMemo(() => {
        if (!isLatestVersion) {
            return false;
        }
        if (!isLocked) {
            return false;
        }
        if (eap.status !== EAP_STATUS_NS_ADDRESSING_COMMENTS) {
            return false;
        }
        return true;
    }, [eap, isLocked, isLatestVersion]);

    return (
        <ListView layout="block">
            {type === 'registration' && isNotDefined(eap.eap_type) && isNotDefined(details) && (
                <ListView>
                    <Link
                        to="simplifiedEapForm"
                        urlParams={{ eapId: eap.id }}
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.startSimplifiedEapLinkLabel}
                    </Link>
                    <Link
                        to="fullEapForm"
                        urlParams={{ eapId: eap.id }}
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.startFullEapLinkLabel}
                    </Link>
                </ListView>
            )}
            {type === 'development' && (
                <>
                    {environment === 'testing' && eap.eap_type === EAP_TYPE_SIMPLIFIED && isCreated && (
                        <Link
                            to="eapSimplifiedExport"
                            urlParams={{ eapId: eap.id }}
                            urlSearch={isDefined(details?.data.version)
                                ? `version=${details.data.version}`
                                : undefined}
                            title={strings.previewExportLinkLabel}
                            before={<DocumentPdfLineIcon fontSize={18} />}
                        >
                            {strings.previewExportLinkLabel}
                        </Link>
                    )}
                    {environment === 'testing' && eap.eap_type === EAP_TYPE_FULL && isCreated && (
                        <Link
                            to="eapFullExport"
                            urlParams={{ eapId: eap.id }}
                            urlSearch={isDefined(details?.data.version)
                                ? `version=${details.data.version}`
                                : undefined}
                            title={strings.previewExportLinkLabel}
                            before={<DocumentPdfLineIcon fontSize={18} />}
                        >
                            {strings.previewExportLinkLabel}
                        </Link>
                    )}
                    {isDefined(details?.data.version)
                        && details.data.version > 1
                        && (
                            <Button
                                name
                                onClick={setShowExportModalTrue}
                                before={<DownloadTwoLineIcon />}
                                styleVariant="action"
                            >
                                {resolveToString(
                                    strings.exportWithChangesButtonLabel,
                                    {
                                        version: details.data.version,
                                    },
                                )}
                            </Button>
                        )}
                    {isDefined(details?.data?.review_checklist_file) && (
                        <Link
                            external
                            href={details.data.review_checklist_file}
                            before={<DownloadTwoLineIcon />}
                        >
                            {resolveToString(
                                strings.downloadReviewChecklistLinkLabel,
                                {
                                    version: details.data.version,
                                },
                            )}
                        </Link>
                    )}
                    {isDefined(details?.data?.updated_checklist_file_details?.file)
                        && isDefined(details.data.version) && (
                        <Link
                            external
                            href={details.data.updated_checklist_file_details.file}
                            before={<DownloadTwoLineIcon />}
                        >
                            {resolveToString(
                                strings.downloadUpdatedChecklistLinkLabel,
                                {
                                    version: details.data.version - 1,
                                },
                            )}
                        </Link>
                    )}
                    {isRevised && (
                        <ConfirmButton
                            name={undefined}
                            confirmMessage={strings.reviseEapMessage}
                            confirmHeading={strings.reviseEapLabel}
                            onConfirm={handleReviseClick}
                            disabled={reviseFullEAPPending || reviseSEAPPending}
                        >
                            {strings.reviseEapLabel}
                        </ConfirmButton>
                    )}
                    {eap.eap_type === EAP_TYPE_SIMPLIFIED && isEditable && (
                        <Link
                            to="simplifiedEapForm"
                            urlParams={{ eapId: eap.id }}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.editSimplifiedEapLinkLabel}
                        </Link>
                    )}
                    {eap.eap_type === EAP_TYPE_SIMPLIFIED && !isEditable && (
                        <Link
                            to="simplifiedEapForm"
                            urlParams={{ eapId: eap.id }}
                            urlSearch={`version=${details?.data.version}`}
                            styleVariant="outline"
                            colorVariant="primary"
                            state={{ mode: 'view' }}
                        >
                            {strings.viewSimplifiedEapLinkLabel}
                        </Link>
                    )}
                    {eap.eap_type === EAP_TYPE_FULL && isEditable && (
                        <Link
                            to="fullEapForm"
                            urlParams={{ eapId: eap.id }}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.editFullEapLinkLabel}
                        </Link>
                    )}
                    {eap.eap_type === EAP_TYPE_FULL && !isEditable && (
                        <Link
                            to="fullEapForm"
                            urlParams={{ eapId: eap.id }}
                            urlSearch={`version=${details?.data.version}`}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.viewFullEapLinkLabel}
                        </Link>
                    )}
                </>
            )}
            {type === 'validated' && (
                <>
                    {isDefined(eap.validated_budget_file) && (
                        <Link
                            external
                            href={eap.validated_budget_file}
                            before={<DownloadTwoLineIcon />}
                        >
                            {strings.downloadValidatedBudgetLinkLabel}
                        </Link>
                    )}
                    {eap.status === EAP_STATUS_TECHNICALLY_VALIDATED && (
                        <BudgetFileInput
                            eapId={eap.id}
                            hasBudgetFile={isDefined(eap.validated_budget_file)}
                            onBudgetFileUpload={onUpdate}
                        />
                    )}
                </>
            )}
            {type === 'pending-pfa' && eap.status >= EAP_STATUS_PENDING_PFA && (
                <ListView
                    layout="block"
                    spacing="sm"
                >
                    <Button
                        name={false}
                        onClick={setShowExportModalTrue}
                        before={<DownloadTwoLineIcon />}
                        styleVariant="action"
                    >
                        {strings.exportButtonLabel}
                    </Button>
                    {eap.eap_type === EAP_TYPE_FULL && (
                        <>
                            <Link
                                to="eapSummaryExport"
                                urlParams={{ eapId: eap.id }}
                                urlSearch={isDefined(latestVersion)
                                    ? `version=${latestVersion}`
                                    : undefined}
                                title={strings.previewExportLinkLabel}
                                before={<DocumentPdfLineIcon fontSize={18} />}
                            >
                                {strings.previewSummaryExportLinkLabel}
                            </Link>
                            <Button
                                name={false}
                                onClick={setShowExportModalTrue}
                                before={<DownloadTwoLineIcon />}
                                styleVariant="action"
                            >
                                {strings.exportSummaryButtonLabel}
                            </Button>
                        </>
                    )}
                </ListView>
            )}
            {showExportModal && isDefined(eap.eap_type) && (
                <EapExportModal
                    eapId={eap.id}
                    eapType={eap.eap_type}
                    onClose={setShowExportModalFalse}
                    version={type === 'pending-pfa'
                        ? latestVersion
                        : details?.data.version}
                    diff={exportWithDiffView}
                    summary={summaryExport}
                />
            )}
        </ListView>
    );
}

export default EapTableActions;
