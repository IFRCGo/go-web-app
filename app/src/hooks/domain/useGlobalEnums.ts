import {
    useContext,
    useEffect,
} from 'react';

import DomainContext, { type GlobalEnums } from '#contexts/domain';

const defaultGlobalEnums: GlobalEnums = {};

function useGlobalEnums() {
    const { globalEnums, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('global-enums');
        },
        [register],
    );

    return globalEnums ?? defaultGlobalEnums;
}

export default useGlobalEnums;
