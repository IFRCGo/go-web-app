import { generatePath } from 'react-router-dom';
import { useContext } from 'react';
import {
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

export interface Props {
    flashUpdateId: number;
}

function FlashUpdatesTableActions(props: Props) {
    const {
        flashUpdateId,
    } = props;
    const strings = useTranslation(i18n);

    const {
        flashUpdateFormEdit: flashUpdateFormEditRoute,
        flashUpdateFormDetails: flashUpdateFormDetailsRoute,
    } = useContext(RouteContext);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to={(
                            generatePath(
                                flashUpdateFormDetailsRoute.absolutePath,
                                { flashUpdateId },
                            )
                        )}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.flashUpdateViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to={(
                            generatePath(
                                flashUpdateFormEditRoute.absolutePath,
                                { flashUpdateId },
                            )
                        )}
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
