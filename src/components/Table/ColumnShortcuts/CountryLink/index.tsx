import { useContext } from 'react';
import Link from '#components/Link';

import RouteContext from '#contexts/route';
import { generatePath } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

export interface Props {
    id: number;
    name: string;
}

function CountryLink(props: Props) {
    const { id, name } = props;
    const { country: countryRoute } = useContext(RouteContext);

    return (
        <Link
            to={
                isDefined(id) ? generatePath(
                    countryRoute.absolutePath,
                    { countryId: id },
                ) : undefined
            }
        >
            {name}
        </Link>
    );
}

export default CountryLink;
