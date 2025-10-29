import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';
import Link from '#components/Link';

import i18n from './i18n.json';

export interface Props {
    eapId: number;
}

function EapTableActions(props: Props) {
    const { eapId } = props;

    const strings = useTranslation(i18n);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to="eapDevelopmentRegistrationForm"
                        urlParams={{ eapId }}
                        state={{ mode: 'view' }}
                    >
                        {strings.eapViewLabel}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="eapDevelopmentRegistrationForm"
                        urlParams={{ eapId }}
                        state={{ mode: 'edit' }}
                    >
                        {strings.eapEditLabel}
                    </DropdownMenuItem>
                </>
            )}
        >
            <Link
                to="eapFullForm"
                urlParams={{ eapId }}
                variant="secondary"
            >
                {strings.eapFormLink}
            </Link>
            <Link
                to="eapSimplifiedForm"
                urlParams={{ eapId }}
                variant="secondary"
            >
                {strings.simplifiedEapLink}
            </Link>
        </TableActions>
    );
}

export default EapTableActions;
