import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';

export interface Props {
    activityId: number;
}

function AllThreeWActivityTableActions(props: Props) {
    const {
        activityId,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <TableActions
            extraActions={(
                <>
                    <DropdownMenuItem
                        type="link"
                        to="threeWActivityDetail"
                        urlParams={{ activityId }}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.threeWActivityViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="threeWActivityEdit"
                        urlParams={{ activityId }}
                        icons={<PencilFillIcon />}
                    >
                        {strings.threeWActivityEdit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to="newThreeWActivity"
                        urlParams={{ activityId }}
                        icons={<CopyLineIcon />}
                    >
                        {strings.threeWActivityDuplicate}
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default AllThreeWActivityTableActions;
