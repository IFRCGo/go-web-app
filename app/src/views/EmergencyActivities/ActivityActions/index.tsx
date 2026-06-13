import {
    CopyLineIcon,
    MoreFillIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { Menu } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';

import i18n from './i18n.json';

export interface Props {
    className?: string;
    activityId: number;
}

function ActivityActions(props: Props) {
    const {
        className,
        activityId,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Menu
            className={className}
            labelVariant="tertiary"
            withoutDropdownIcon
            label={<MoreFillIcon />}
            ariaLabel="Actions"
            persistent
        >
            <DropdownMenuItem
                type="link"
                to="threeWActivityDetail"
                urlParams={{ activityId }}
                before={<ShareBoxLineIcon />}
            >
                {strings.threeWViewDetails}
            </DropdownMenuItem>
            <DropdownMenuItem
                type="link"
                to="threeWActivityEdit"
                urlParams={{ activityId }}
                before={<PencilFillIcon />}
            >
                {strings.threeWEdit}
            </DropdownMenuItem>
            <DropdownMenuItem
                type="link"
                to="newThreeWActivity"
                state={{ activityId }}
                before={<CopyLineIcon />}
            >
                {strings.threeWDuplicate}
            </DropdownMenuItem>
        </Menu>
    );
}

export default ActivityActions;
