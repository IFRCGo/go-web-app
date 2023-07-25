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
import RouteContext from '#contexts/route';

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
            {/* TODO: Fetch these from server */}
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '0' })}
                label={strings.regionNameAfrica}
                className={_cs(
                    styles.menuItem,
                    match?.params?.regionId === '0' && styles.active,
                )}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '1' })}
                label={strings.regionNameAmerica}
                className={_cs(
                    styles.menuItem,
                    match?.params?.regionId === '1' && styles.active,
                )}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '2' })}
                label={strings.regionNameAsia}
                className={_cs(
                    styles.menuItem,
                    match?.params?.regionId === '2' && styles.active,
                )}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '3' })}
                label={strings.regionNameEurope}
                className={_cs(
                    styles.menuItem,
                    match?.params?.regionId === '3' && styles.active,
                )}
            />
            <DropdownMenuItem
                to={generatePath(regionRoute.absolutePath, { regionId: '4' })}
                label={strings.regionNameMENA}
                className={_cs(
                    styles.menuItem,
                    match?.params?.regionId === '4' && styles.active,
                )}
            />
        </DropdownMenu>
    );
}

export default RegionDropdown;
