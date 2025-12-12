import {
    DocumentPdfLineIcon,
    DownloadTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    TableActions,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
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

    const strings = useTranslation(i18n);
    const [
        showExportModal,
        {
            setTrue: setShowExportModalTrue,
            setFalse: setShowExportModalFalse,
        },
    ] = useBooleanState(false);

    return (
        <TableActions>
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
                    name={undefined}
                    onClick={setShowExportModalTrue}
                    // FIXME: use strings
                >
                    Export
                </Button>
            )}
            {type === 'development' && isNotDefined(eap.eap_type) && isNotDefined(details) && (
                <>
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
                </>
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
            {type === 'development' && eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                <Link
                    to="simplifiedEapExport"
                    urlParams={{ eapId: eap.id }}
                    urlSearch={isDefined(details?.data.version)
                        ? `version=${details.data.version}`
                        : undefined}
                    title="Preview export"
                >
                    <DocumentPdfLineIcon fontSize={18} />
                </Link>
            )}
            {showExportModal && isDefined(eap.eap_type) && (
                <EapExportModal
                    eapId={eap.id}
                    eapType={eap.eap_type}
                    onClose={setShowExportModalFalse}
                    version={details?.data.version}
                />
            )}
        </TableActions>
    );
}

export default EapTableActions;
