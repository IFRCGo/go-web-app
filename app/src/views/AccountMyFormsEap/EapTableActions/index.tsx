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
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import EapExportModal from '#components/domain/EapExportModal';
import Link from '#components/Link';
import {
    EAP_STATUS_NS_ADDRESSING_COMMENTS,
    EAP_STATUS_TECHNICALLY_VALIDATED,
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';

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
    const [showExportModal, setShowExportModal] = useState(false);

    const strings = useTranslation(i18n);

    const setShowExportModalTrue = useCallback((withDiff?: boolean) => {
        setExportWithDiffView(!!withDiff);
        setShowExportModal(true);
    }, []);

    const setShowExportModalFalse = useCallback(() => {
        setExportWithDiffView(false);
        setShowExportModal(false);
    }, []);

    const isLatestVersion = useMemo(() => {
        if (eap.eap_type === EAP_TYPE_SIMPLIFIED) {
            return eap.latest_simplified_eap === details?.data.id;
        }

        if (eap.eap_type === EAP_TYPE_FULL) {
            return eap.latest_full_eap === details?.data.id;
        }

        return false;
    }, [eap, details]);

    const isEditable = details?.data.is_locked === false && (
        eap.status === EAP_STATUS_UNDER_DEVELOPMENT
            || eap.status === EAP_STATUS_NS_ADDRESSING_COMMENTS
    ) && isLatestVersion;

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
                    {eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                        <Link
                            to="simplifiedEapExport"
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
                    {eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                        <Button
                            name={false}
                            onClick={setShowExportModalTrue}
                            before={<DownloadTwoLineIcon />}
                            styleVariant="action"
                        >
                            {strings.exportButtonLabel}
                        </Button>
                    )}
                    {eap.eap_type === EAP_TYPE_SIMPLIFIED
                        && isDefined(details?.data.version)
                        && details.data.version > 1
                        && (
                            <Button
                                name
                                onClick={setShowExportModalTrue}
                                before={<DownloadTwoLineIcon />}
                                styleVariant="action"
                            >
                                {strings.exportWithChangesButtonLabel}
                            </Button>
                        )}
                    {isDefined(details?.data?.review_checklist_file) && (
                        <Link
                            external
                            href={details.data.review_checklist_file}
                            before={<DownloadTwoLineIcon />}
                        >
                            {strings.downloadReviewChecklistLinkLabel}
                        </Link>
                    )}
                    {isDefined(details?.data?.updated_checklist_file_details?.file) && (
                        <Link
                            external
                            href={details.data.updated_checklist_file_details.file}
                            before={<DownloadTwoLineIcon />}
                        >
                            {strings.downloadUpdatedChecklistLinkLabel}
                        </Link>
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
            {showExportModal && isDefined(eap.eap_type) && (
                <EapExportModal
                    eapId={eap.id}
                    eapType={eap.eap_type}
                    onClose={setShowExportModalFalse}
                    version={details?.data.version}
                    diff={exportWithDiffView}
                />
            )}
        </ListView>
    );
}

export default EapTableActions;
