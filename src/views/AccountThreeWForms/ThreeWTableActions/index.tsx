import {
    CopyLineIcon,
    PencilFillIcon,
    ShareBoxLineIcon,
} from '@ifrc-go/icons';

import TableActions from '#components/Table/TableActions';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';

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

    if (type === 'activity') {
        return (
            <TableActions
                extraActions={(
                    <>
                        <DropdownMenuItem
                            type="link"
                            // FIXME: add link
                            to={null}
                            // to="threeWActivityDetails"
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
                    <DropdownMenuItem
                        type="link"
                        // TODO: implement duplication logic
                        to="newThreeWProject"
                        urlParams={{ projectId }}
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
