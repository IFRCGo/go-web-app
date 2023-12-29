import {
    useContext,
    useEffect,
} from 'react';

import DomainContext from '#contexts/domain';

function useUserMe() {
    const { userMe, register } = useContext(DomainContext);

    useEffect(
        () => {
            register('user-me');
        },
        [register],
    );

    return userMe;
}

export default useUserMe;
