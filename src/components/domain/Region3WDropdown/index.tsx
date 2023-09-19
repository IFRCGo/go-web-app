import { useContext } from 'react';
import {
    useLocation,
    matchPath,
} from 'react-router-dom';
import { _cs, isDefined, isNotDefined } from '@togglecorp/fujs';

import Message from '#components/Message';
import DropdownMenu, { Props as DropdownMenuProps } from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Props = DropdownMenuProps;

function Region3WDropdown(props: Props) {
    const {
        className,
        popupClassName: dropdownContainerClassName,
        variant = 'primary',
        ...otherProps
    } = props;

    const location = useLocation();

    const strings = useTranslation(i18n);
    const {
        regionsLayout: regionRoute,
    } = useContext(RouteContext);
    const {
        api_region_name: regionOptions,
    } = useGlobalEnums();

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
            label={strings.menu3WRegions}
            variant={variant}
            popupClassName={_cs(styles.dropdown, dropdownContainerClassName)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
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

export default Region3WDropdown;
