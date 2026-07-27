import {
    Menu as PureMenu,
    MenuProps,
} from '@ifrc-go/ui';

function Menu(props: MenuProps) {
    return (
        <PureMenu {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Menu;
