import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';

import { RequestContext } from '#utils/restRequest';
import {
  processGoUrls,
  processGoOptions,
  processGoError,
  processGoResponse,
} from '#utils/restRequest/go';

import { unwrappedRoutes } from './routes';

const requestContextValue = {
  transformUrl: processGoUrls,
  transformOptions: processGoOptions,
  transformResponse: processGoResponse,
  transformError: processGoError,
};

const router = createBrowserRouter(unwrappedRoutes);

function App() {
    return (
        <RequestContext.Provider value={requestContextValue}>
            <RouterProvider router={router} />
        </RequestContext.Provider>
    );
}

export default App;
