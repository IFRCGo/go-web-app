import {
    useRouteError,
} from 'react-router-dom';

function PageError() {
    const error = useRouteError() as unknown as any;
    return (
        <h1>
            {error.statusText || error.message}
        </h1>
    );
}

export default PageError;
