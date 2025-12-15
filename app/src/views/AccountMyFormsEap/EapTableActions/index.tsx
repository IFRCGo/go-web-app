import {
    useCallback,
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
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';

import { type EapExpandedListItem } from '../utils';

import i18n from './i18n.json';

export interface Props {
    expandedListItem: EapExpandedListItem;
}

function EapTableActions(props: Props) {
    const { expandedListItem } = props;

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

    return (
        <>
            <ListView layout="block">
                {type === 'development' && eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                    <Link
                        to="simplifiedEapExport"
                        urlParams={{ eapId: eap.id }}
                        urlSearch={isDefined(details?.data.version)
                            ? `version=${details.data.version}`
                            : undefined}
                        title="Preview export"
                        before={<DocumentPdfLineIcon fontSize={18} />}
                    >
                        Preview export
                    </Link>
                )}
                {type === 'development' && details?.data.is_locked && isDefined(eap.review_checklist_file) && (
                    <Link
                        external
                        href={eap.review_checklist_file}
                        before={<DownloadTwoLineIcon />}
                    >
                        Review Checklist
                    </Link>
                )}
                {type === 'development' && eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                    <Button
                        name={false}
                        onClick={setShowExportModalTrue}
                        before={<DownloadTwoLineIcon />}
                        styleVariant="action"
                        // FIXME: use strings
                    >
                        Export
                    </Button>
                )}
                {type === 'development'
                    && eap.eap_type === EAP_TYPE_SIMPLIFIED
                    && isDefined(details?.data.version)
                    && details.data.version > 1
                    && (
                        <Button
                            name
                            onClick={setShowExportModalTrue}
                            before={<DownloadTwoLineIcon />}
                            styleVariant="action"
                            // FIXME: use strings
                        >
                            Export with changes
                        </Button>
                    )}
                {type === 'registration' && isNotDefined(eap.eap_type) && isNotDefined(details) && (
                    <ListView>
                        <Link
                            to="simplifiedEapForm"
                            urlParams={{ eapId: eap.id }}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.eapStartSimplifiedLink}
                        </Link>
                        <Link
                            to="fullEapForm"
                            urlParams={{ eapId: eap.id }}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.eapStartFullLink}
                        </Link>
                    </ListView>
                )}
                {type === 'development'
                    && !details?.data.is_locked
                    && eap.eap_type === EAP_TYPE_SIMPLIFIED
                    && (eap.status === EAP_STATUS_UNDER_DEVELOPMENT
                        || (eap.status === EAP_STATUS_NS_ADDRESSING_COMMENTS
                            && eap.latest_simplified_eap === details?.data.id))
                    && (
                        <Link
                            to="simplifiedEapForm"
                            urlParams={{ eapId: eap.id }}
                            styleVariant="outline"
                            colorVariant="primary"
                        >
                            {strings.eapEditSimplifiedLink}
                        </Link>
                    )}
                {type === 'development' && !details?.data.is_locked && eap.eap_type === EAP_TYPE_FULL && (
                    <Link
                        to="fullEapForm"
                        urlParams={{ eapId: eap.id }}
                        styleVariant="outline"
                        colorVariant="primary"
                    >
                        {strings.eapEditFullLink}
                    </Link>
                )}
            </ListView>
            {showExportModal && isDefined(eap.eap_type) && (
                <EapExportModal
                    eapId={eap.id}
                    eapType={eap.eap_type}
                    onClose={setShowExportModalFalse}
                    version={details?.data.version}
                    diff={exportWithDiffView}
                />
            )}
        </>
    );
}

export default EapTableActions;
