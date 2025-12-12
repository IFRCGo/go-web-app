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
import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import { type components } from '#generated/types';
import {
    EAP_STATUS_UNDER_DEVELOPMENT,
    EAP_STATUS_UNDER_REVIEW,
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
            {type === 'development' && eap.eap_type === EAP_TYPE_SIMPLIFIED && (
                <Link
                    to="simplifiedEapExport"
                    urlParams={{ eapId: eap.id }}
                    urlSearch={isDefined(details?.data.version)
                        ? `version=${details.data.version}`
                        : undefined}
                >
                    Preview Export
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
            {type === 'development' && !details?.data.is_locked && eap.eap_type === EAP_TYPE_SIMPLIFIED && (
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
            {/*
            {isNotDefined(eapType) && (
                <Link
                    to="fullEapForm"
                    urlParams={{ eapId }}
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.eapStartFullLink}
                </Link>
            )}
            {isNotDefined(eapType) && (
                <Link
                    to="simplifiedEapForm"
                    urlParams={{ eapId }}
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.eapStartSimplifiedLink}
                </Link>
            )}
            {eapType === EAP_TYPE_FULL && (
                <Link
                    to="fullEapForm"
                    urlParams={{ eapId }}
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.eapEditFullLink}
                </Link>
            )}
            */}
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
