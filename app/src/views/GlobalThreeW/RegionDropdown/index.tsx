import {
    DropdownMenu,
    Message,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import i18n from './i18n.json';

function RegionDropdown() {
    const strings = useTranslation(i18n);
    const { api_region_name: regionOptions } = useGlobalEnums();

    return (
        <DropdownMenu
            label={strings.menu3WRegions}
            variant="secondary"
        >
            {(isNotDefined(regionOptions) || regionOptions.length === 0) && (
                <Message
                    description={strings.menu3WRegionNotAvailable}
                    compact
                />
            )}
            {regionOptions?.map(
                (region) => (
                    <DropdownMenuItem
                        type="link"
                        key={region.key}
                        to="regionThreeW"
                        urlParams={{ regionId: region.key }}
                    >
                        {region.value}
                    </DropdownMenuItem>
                ),
            )}
        </DropdownMenu>
    );
}

export default RegionDropdown;
