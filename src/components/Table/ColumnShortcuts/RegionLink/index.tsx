import { useContext } from 'react';
import Link from '#components/Link';

import RouteContext from '#contexts/route';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

export interface Props {
    id: number;
    name: string;
}

function RegionLink(props: Props) {
    const { id, name } = props;
    const { region: regionRoute } = useContext(RouteContext);

    return (
        <Link
            to={
                isDefined(id) ? generatePath(
                    regionRoute.absolutePath,
                    { regionId: id },
                ) : undefined
            }
        >
            {name}
        </Link>
    );
}

export default RegionLink;
