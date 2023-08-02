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
    type: 'project' | 'activity';
    threeWId: number;
}

function ThreeWTableActions(props: Props) {
    const {
        type,
        threeWId,
    } = props;
    const strings = useTranslation(i18n);

    if (type === 'activity') {
        return (
            <TableActions
                extraActions={(
                    <>
                        <DropdownMenuItem
                            type="link"
                            // TODO: use routes
                            to={`/emergency-three-w/${threeWId}/`}
                            icons={<ShareBoxLineIcon />}
                        >
                            {strings.threeWViewDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            type="link"
                            // TODO: use routes
                            to={`/emergency-three-w/${threeWId}/edit/`}
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
                        // TODO; use routes
                        to={`/three-w/${threeWId}/`}
                        icons={<ShareBoxLineIcon />}
                    >
                        {strings.threeWViewDetails}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        // TODO; use routes
                        to={`/three-w/${threeWId}/edit/`}
                        icons={<PencilFillIcon />}
                    >
                        {strings.threeWEdit}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        type="link"
                        // TODO: implement duplication logic
                        // TODO: use routes
                        to="/three-w/new/"
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
