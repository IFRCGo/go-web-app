import { useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';

import { useRequest } from '#utils/restRequest';
import { type GoApiResponse } from '#utils/restRequest';

export type PrimarySector = NonNullable<GoApiResponse<'/api/v2/primarysector'>>[number];

type ListProps = {
    id?: never;
}

type PropsForId = {
    id: number;
}

function usePrimarySector(props?: ListProps): [Array<PrimarySector> | undefined, boolean]
function usePrimarySector(props: PropsForId): [PrimarySector | undefined, boolean]
function usePrimarySector(
    props?: ListProps | PropsForId,
): [PrimarySector | undefined | Array<PrimarySector> | undefined, boolean] {
    const {
        pending: primarySectorOptionsPending,
        response: primarySectorOptions,
    } = useRequest({
        url: '/api/v2/primarysector',
        preserveResponse: true,
    });

    const returnValue = useMemo(
        () => {
            const id = props?.id;
            if (isDefined(id)) {
                return primarySectorOptions?.find((primarySector) => primarySector.key === id);
            }

            return primarySectorOptions;
        },
        [primarySectorOptions, props?.id],
    );

    return [returnValue, primarySectorOptionsPending];
}

export default usePrimarySector;
