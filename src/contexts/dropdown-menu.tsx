import { createContext } from 'react';

export interface DropdownMenuContextProps {
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps>({
    setShowDropdown: () => {
        // eslint-disable-next-line no-console
        console.warn('DropdownMenuContext::setShowDropdown called without a provider');
    },
});

export default DropdownMenuContext;
