import {
    Navigate,
    useLocation,
    type NavigateProps,
} from 'react-router-dom';
import { isDefined, isTruthyString } from '@togglecorp/fujs';

type RouteKey = string;

interface Props extends NavigateProps {
    hashToRouteMap: Record<string, RouteKey>;
}

function SmartNavigate(props: Props) {
    const {
        hashToRouteMap,
        ...navigateProps
    } = props;
    const location = useLocation();
    const newRoute = isTruthyString(location.hash)
        ? hashToRouteMap[location.hash]
        : undefined;

    if (isDefined(newRoute)) {
        return (
            <Navigate
                to={newRoute}
                replace
            />
        );
    }

    return (
        <Navigate
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...navigateProps}
        />
    );
}

export default SmartNavigate;
