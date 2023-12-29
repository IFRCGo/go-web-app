import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { TableActions } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DropdownMenuItem from '#components/DropdownMenuItem';

import i18n from './i18n.json';

export type Props = ({
    type: 'project';
    projectId: number;
    activityId?: never;
} | {
    type: 'activity';
    activityId: number;
    projectId?: never;
})

function ThreeWTableActions(props: Props) {
    const {
        type,
        projectId,
        activityId,
    } = props;

    const strings = useTranslation(i18n);

    if (type === 'activity') {
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
                    </>
                )}
            />
        );
    }

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

export default ThreeWTableActions;
