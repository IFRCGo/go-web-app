import {
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';

import i18n from './i18n.json';

export interface Props {
    flashUpdateId: number;
}

function FlashUpdatesTableActions(props: Props) {
    const {
        flashUpdateId,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to="flashUpdateFormDetails"
                        urlParams={{ flashUpdateId }}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.flashUpdateViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="flashUpdateFormEdit"
                        urlParams={{ flashUpdateId }}
                        icons={<PencilFillIcon />}
                    >
                        {strings.flashUpdateEdit}
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default FlashUpdatesTableActions;
