import { useContext } from 'react';
import {
    generatePath,
    useLocation,
    matchPath,
} from 'react-router-dom';
import { _cs, isDefined } from '@togglecorp/fujs';

import DropdownMenu, { Props as DropdownMenuProps } from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route'; import ServerEnumsContext from '#contexts/server-enums';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Props = DropdownMenuProps;

function RegionDropdown(props: Props) {
    const {
        className,
        dropdownContainerClassName,
        variant = 'tertiary',
        ...otherProps
    } = props;

    const location = useLocation();

    const strings = useTranslation(i18n);
    const { region: regionRoute } = useContext(RouteContext);
    const {
        api_region_name: regionOptions,
    } = useContext(ServerEnumsContext);

    const match = matchPath(
        {
            path: regionRoute.absolutePath,
            end: false,
        },
        location.pathname,
    );

    return (
        <DropdownMenu
            className={_cs(
                styles.regionDropdown,
                className,
                isDefined(match) && styles.active,
            )}
            label={strings.menuRegions}
            variant={variant}
            dropdownContainerClassName={_cs(styles.dropdown, dropdownContainerClassName)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {regionOptions?.map(
                (region) => (
                    <DropdownMenuItem
                        type="link"
                        key={region.key}
                        to={generatePath(
                            regionRoute.absolutePath,
                            { regionId: String(region.key) },
                        )}
                        className={_cs(
                            styles.menuItem,
                            match?.params?.regionId === String(region.key) && styles.active,
                        )}
                    >
                        {region.value}
                    </DropdownMenuItem>
                ),
            )}
        </DropdownMenu>
    );
}

export default RegionDropdown;
