import type { paths } from '#generated/types';

type RegionResponse = paths['/api/v2/region/{id}/']['get']['responses']['200']['content']['application/json'];

export interface RegionOutletContext {
    regionResponse: RegionResponse | undefined;
}
