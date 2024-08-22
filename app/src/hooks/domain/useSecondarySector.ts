import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

export type SecondarySector = NonNullable<GoApiResponse<'/api/v2/secondarysector'>>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function useSecondarySector(props?: ListProps): [Array<SecondarySector> | undefined, boolean]
function useSecondarySector(props: PropsForId): [SecondarySector | undefined, boolean]
function useSecondarySector(
    props?: ListProps | PropsForId,
): [SecondarySector | undefined | Array<SecondarySector> | undefined, boolean] {
    const {
        pending: secondaryTagOptionsPending,
        response: secondaryTagOptions,
    } = useRequest({
        url: '/api/v2/secondarysector',
        preserveResponse: true,
    });

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return secondaryTagOptions?.find((secondaryTag) => secondaryTag.key === id);
            }

            return secondaryTagOptions;
        },
        [secondaryTagOptions, props?.id],
    );

    return [returnValue, secondaryTagOptionsPending];
}

export default useSecondarySector;
