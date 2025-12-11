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
    EAP_TYPE_FULL,
    EAP_TYPE_SIMPLIFIED,
} from '#utils/constants';

import i18n from './i18n.json';

type EapType = components['schemas']['EapEapTypeEnumKey'];

export interface Props {
    eapId: number;
    eapType: EapType | null | undefined;
}

function EapTableActions(props: Props) {
    const {
        eapId,
        eapType,
    } = props;

    const strings = useTranslation(i18n);
    const [
        showExportModal,
        {
            setTrue: setShowExportModalTrue,
            setFalse: setShowExportModalFalse,
        },
    ] = useBooleanState(false);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to="eapDevelopmentRegistrationForm"
                        urlParams={{ eapId }}
                        // FIXME: we should use the route for read-only view
                        state={{ mode: 'view' }}
                    >
                        {strings.eapViewLabel}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="eapDevelopmentRegistrationForm"
                        urlParams={{ eapId }}
                        // FIXME: we should use separate route for edit view
                        state={{ mode: 'edit' }}
                    >
                        {strings.eapEditLabel}
                    </DropdownMenuItem>
                </>
            )}
        >
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
            {eapType === EAP_TYPE_SIMPLIFIED && (
                <Link
                    to="simplifiedEapForm"
                    urlParams={{ eapId }}
                    styleVariant="outline"
                    colorVariant="primary"
                >
                    {strings.eapEditSimplifiedLink}
                </Link>
            )}
            {eapType === EAP_TYPE_SIMPLIFIED && (
                <Button
                    name={undefined}
                    onClick={setShowExportModalTrue}
                    // FIXME: use strings
                >
                    Export
                </Button>
            )}
            {showExportModal && isDefined(eapType) && (
                <EapExportModal
                    eapId={eapId}
                    eapType={eapType}
                    onClose={setShowExportModalFalse}
                />
            )}
        </TableActions>
    );
}

export default EapTableActions;
