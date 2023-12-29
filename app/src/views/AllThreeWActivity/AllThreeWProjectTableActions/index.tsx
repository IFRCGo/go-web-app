import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';

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
                        state={{ activityId }}
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
