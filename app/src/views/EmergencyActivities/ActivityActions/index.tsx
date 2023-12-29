import {
    CopyLineIcon,
    MoreFillIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { DropdownMenu } from '@ifrc-go/ui';
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
        <DropdownMenu
            className={className}
            variant="tertiary"
            withoutDropdownIcon
            label={<MoreFillIcon />}
            persistent
        >
            <DropdownMenuItem
                type="link"
                to="threeWActivityDetail"
                urlParams={{ activityId }}
                icons={<ShareBoxLineIcon />}
            >
                {strings.threeWViewDetails}
            </DropdownMenuItem>
            <DropdownMenuItem
                type="link"
                to="threeWActivityEdit"
                urlParams={{ activityId }}
                icons={<PencilFillIcon />}
            >
                {strings.threeWEdit}
            </DropdownMenuItem>
            <DropdownMenuItem
                type="link"
                to="newThreeWActivity"
                state={{ activityId }}
                icons={<CopyLineIcon />}
            >
                {strings.threeWDuplicate}
            </DropdownMenuItem>
        </DropdownMenu>
    );
}

export default ActivityActions;
