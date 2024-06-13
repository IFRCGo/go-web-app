import {
    NavigationTabList as PureNavigationTabList,
    NavigationTabListProps as PureNavigationTabListProps,
} from '@ifrc-go/ui';

type NavigationTabListProps = PureNavigationTabListProps;

function NavigationTabList(props: NavigationTabListProps) {
    return (
        <PureNavigationTabList {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NavigationTabList;
