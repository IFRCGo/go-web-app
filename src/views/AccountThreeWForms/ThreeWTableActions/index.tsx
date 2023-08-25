import { useContext } from 'react';
import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';
import { generatePath } from 'react-router-dom';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

export type Props = ({
    type: 'project';
    projectId: number;
    activityId?: undefined;
} | {
    type: 'activity';
    projectId?: undefined;
    activityId: number;
})

function ThreeWTableActions(props: Props) {
    const {
        type,
        projectId,
        activityId,
    } = props;
    const strings = useTranslation(i18n);

    const {
        threeWProjectEdit: threeWProjectEditRoute,
        threeWProjectDetail: threeWProjectDetailRoute,
        newThreeWProject: newThreeWProjectRoute,
        threeWActivityEdit: threeWActivityEditRoute,
    } = useContext(RouteContext);

    if (type === 'activity') {
        return (
            <TableActions
                extraActions={(
                    <>
                        <DropdownMenuItem
                            type="link"
                            // TODO: use routes
                            to={`/emergency-three-w/activity/${activityId}/`}
                            icons={<ShareBoxLineIcon />}
                        >
                            {strings.threeWViewDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            to={generatePath(
                                threeWActivityEditRoute.absolutePath,
                                { activityId },
                            )}
                            icons={<PencilFillIcon />}
                        >
                            {strings.threeWEdit}
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
                        to={generatePath(
                            threeWProjectDetailRoute.absolutePath,
                            { projectId },
                        )}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.threeWViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        to={generatePath(
                            threeWProjectEditRoute.absolutePath,
                            { projectId },
                        )}
                        icons={<PencilFillIcon />}
                    >
                        {strings.threeWEdit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        // TODO: implement duplication logic
                        to={(
                            generatePath(
                                newThreeWProjectRoute.absolutePath,
                                { projectId },
                            )
                        )}
                        icons={<CopyLineIcon />}
                    >
                        {strings.threeWDuplicate}
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default ThreeWTableActions;
