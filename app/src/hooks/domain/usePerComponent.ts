import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

export type PerComponent = NonNullable<GoApiResponse<'/api/v2/per-formcomponent/'>['results']>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function usePerComponent(props?: ListProps): [Array<PerComponent> | undefined, boolean]
function usePerComponent(props: PropsForId): [PerComponent | undefined, boolean]
function usePerComponent(
    props?: ListProps | PropsForId,
): [PerComponent | undefined | Array<PerComponent> | undefined, boolean] {
    const {
        pending: perFormComponentResponsePending,
        response: perFormComponentResponse,
    } = useRequest({
        url: '/api/v2/per-formcomponent/',
        preserveResponse: true,
    });

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return perFormComponentResponse
                    ?.results?.find((perComponent) => perComponent.id === id);
            }

            return perFormComponentResponse?.results;
        },
        [perFormComponentResponse, props?.id],
    );

    return [returnValue, perFormComponentResponsePending];
}

export default usePerComponent;
