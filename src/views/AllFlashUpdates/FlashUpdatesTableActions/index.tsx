import {
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';

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
