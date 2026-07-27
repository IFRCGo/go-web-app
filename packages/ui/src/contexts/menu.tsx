import { createContext } from 'react';

export interface MenuContextProps {
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuContext = createContext<MenuContextProps>({
    setShowDropdown: () => {
        // eslint-disable-next-line no-console
        console.warn('MenuContext::setShowDropdown called without a provider');
    },
});

export default MenuContext;
