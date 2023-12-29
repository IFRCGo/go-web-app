import { createContext } from 'react';

export type NavigationTabVariant = 'primary' | 'secondary' | 'tertiary' | 'step' | 'vertical';

export interface NavigationTabContextProps {
    variant?: NavigationTabVariant;
    className?: string;
}

const NavigationTabContext = createContext<NavigationTabContextProps>({
    variant: 'primary',
});

export default NavigationTabContext;
