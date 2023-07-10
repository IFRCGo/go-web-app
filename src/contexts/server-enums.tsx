import { createContext } from 'react';
import { paths } from '#generated/types';

type GetGlobalEnums = paths['/api/v2/global-enums/']['get'];
type GlobalEnumsResponse = GetGlobalEnums['responses']['200']['content']['application/json'];

const ServerEnumsContext = createContext<GlobalEnumsResponse>(
    {},
);

export default ServerEnumsContext;
