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
                            // TODO: use routes
                            to={`/emergency-three-w/${threeWId}/`}
                            icon={<ShareBoxLineIcon />}
                            label={strings.threeWViewDetails}
                        />
                        <DropdownMenuItem
                            // TODO: use routes
                            to={`/emergency-three-w/${threeWId}/edit/`}
                            icon={<PencilFillIcon />}
                            label={strings.threeWEdit}
                        />
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
                        // TODO; use routes
                        to={`/three-w/${threeWId}/`}
                        label={strings.threeWViewDetails}
                        icon={<ShareBoxLineIcon />}
                    />
                    <DropdownMenuItem
                        // TODO; use routes
                        to={`/three-w/${threeWId}/edit/`}
                        icon={<PencilFillIcon />}
                        label={strings.threeWEdit}
                    />
                    <DropdownMenuItem
                        // TODO: implement duplication logic
                        // TODO: use routes
                        to="/three-w/new/"
                        icon={<CopyLineIcon />}
                        label={strings.threeWDuplicate}
                    />
                </>
            )}
        />
    );
}

export default ThreeWTableActions;
