import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';
import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import { isNotDefined } from '@togglecorp/fujs';
import { EAP_TYPE_FULL, EAP_TYPE_SIMPLIFIED } from '#utils/constants';

type EapResponse = GoApiResponse<'/api/v2/eap-registration/{id}/'>;

export interface Props {
    eapId: number;
    eapType: EapResponse['eap_type'];
}

function EapTableActions(props: Props) {
    const {
        eapId,
        eapType,
    } = props;

    const strings = useTranslation(i18n);

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
        </TableActions>
    );
}

export default EapTableActions;
