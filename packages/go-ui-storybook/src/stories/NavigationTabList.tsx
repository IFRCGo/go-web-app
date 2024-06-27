import {
    NavigationTabList as PureNavigationTabList,
    NavigationTabListProps,
} from '@ifrc-go/ui';

function NavigationTabList(props: NavigationTabListProps) {
    return (
        <PureNavigationTabList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NavigationTabList;
