import {
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

export interface Props {
    projectId: number;
}

function AllThreeWProjectTableActions(props: Props) {
    const {
        projectId,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to="threeWProjectDetail"
                        urlParams={{ projectId }}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.threeWViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="threeWProjectEdit"
                        urlParams={{ projectId }}
                        icons={<PencilFillIcon />}
                    >
                        {strings.threeWEdit}
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default AllThreeWProjectTableActions;
