import { useContext } from 'react';
import { generatePath } from 'react-router-dom';

import DropdownMenu, { Props as DropdownMenuProps } from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';

import i18n from './i18n.json';

type Props = DropdownMenuProps;

function RegionDropdown(props: Props) {
    const {
        variant = 'tertiary',
        ...otherProps
    } = props;

    const { region: regionRoute } = useContext(RouteContext);

    const strings = useTranslation(i18n);

    return (
        <DropdownMenu
            label={strings.menuRegions}
            variant={variant}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {/* TODO: Fetch these from server */}
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '0' })}
                label={strings.regionNameAfrica}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '1' })}
                label={strings.regionNameAmerica}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '2' })}
                label={strings.regionNameAsia}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '3' })}
                label={strings.regionNameEurope}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '4' })}
                label={strings.regionNameMENA}
            />
        </DropdownMenu>
    );
}

export default RegionDropdown;
