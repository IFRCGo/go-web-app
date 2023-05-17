import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

import { unwrappedRoutes } from './routes';

const router = createBrowserRouter(unwrappedRoutes);

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;
