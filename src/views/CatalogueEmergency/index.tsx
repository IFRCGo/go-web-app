import { Outlet } from 'react-router-dom';
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <div>
            <Outlet />
        </div>
    );
}

Component.displayName = 'CatalogueEmergency';
