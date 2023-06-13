import { createContext } from 'react';

export type NavigationTabVariant = 'primary' | 'secondary' | 'tertiary' | 'step';

export interface NavigationTabContextProps {
    variant?: NavigationTabVariant;
}

const NavigationTabContext = createContext<NavigationTabContextProps>({
    variant: 'primary',
});

export default NavigationTabContext;
