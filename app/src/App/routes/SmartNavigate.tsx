import {
    Navigate,
    type NavigateProps,
    useLocation,
} from 'react-router-dom';
import {
    isDefined,
    isTruthyString,
} from '@togglecorp/fujs';

type RouteKey = string;

interface Props extends NavigateProps {
    hashToRouteMap: Record<string, RouteKey>;
    forwardUnmatchedHashTo?: string;
}

function SmartNavigate(props: Props) {
    const {
        hashToRouteMap,
        forwardUnmatchedHashTo,
        ...navigateProps
    } = props;

    const location = useLocation();
    const newRoute = isTruthyString(location.hash)
        ? (hashToRouteMap[location.hash] ?? forwardUnmatchedHashTo)
        : undefined;

    if (isDefined(newRoute)) {
        return (
            <Navigate
                to={{
                    pathname: newRoute,
                }}
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
