import {
    useContext,
    useMemo,
} from 'react';
import {
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import {
    describe,
    expect,
    test,
    vi,
} from 'vitest';

import NrwAdminAreasContext, { type NrwAdminAreasContextProps } from '#views/CountryProfileNationalRiskWatch/NrwAdminAreasProvider/NrwAdminAreasContext';
import {
    type AdminAreaProperties,
    type AdminLevel,
    type PlaceCode,
} from '#views/CountryProfileNationalRiskWatch/types';

import NrwAdminAreaBreadcrumbs, { type NrwAdminAreaBreadcrumbsEvent } from './index';

const event: NrwAdminAreaBreadcrumbsEvent = { eventLabel: 'Kenya' };

const kilifi: AdminAreaProperties = {
    adminLevel: 1 as AdminLevel,
    placeCode: 'KE03' as PlaceCode,
    name: 'Kilifi',
};
const magarini: AdminAreaProperties = {
    adminLevel: 2 as AdminLevel,
    placeCode: 'KE0303' as PlaceCode,
    name: 'Magarini',
};

// The context falls back to its defaults for the props a test leaves out.
function Harness(props: { adminAreas: Partial<NrwAdminAreasContextProps> }) {
    const { adminAreas } = props;

    const defaults = useContext(NrwAdminAreasContext);
    const value = useMemo(
        () => ({ ...defaults, ...adminAreas }),
        [defaults, adminAreas],
    );

    return (
        <NrwAdminAreasContext.Provider value={value}>
            <NrwAdminAreaBreadcrumbs event={event} />
        </NrwAdminAreasContext.Provider>
    );
}

function getCrumbLabels() {
    return Array.from(screen.getByRole('navigation').children)
        .filter((child) => child.tagName === 'DIV')
        .map((crumb) => crumb.textContent);
}

function getButtonLabels() {
    return screen.queryAllByRole('button').map((button) => button.textContent);
}

describe('NrwAdminAreaBreadcrumbs', () => {
    test('shows only the event before drilling down', () => {
        // Act
        render(<Harness adminAreas={{ initialAdminLevel: 1 as AdminLevel, drillPath: [] }} />);

        // Assert
        expect(getCrumbLabels()).toEqual(['Kenya']);
        expect(screen.getByText('Kenya')).toHaveAttribute('aria-current', 'location');
        expect(getButtonLabels()).toEqual([]);
    });

    test('jumps back to the event or an admin area drilled through', () => {
        // Arrange
        const drillUpTo = vi.fn();

        // Act
        render(
            <Harness
                adminAreas={{
                    initialAdminLevel: 1 as AdminLevel,
                    drillPath: [kilifi, magarini],
                    drillUpTo,
                }}
            />,
        );

        // Assert
        expect(getCrumbLabels()).toEqual(['Kenya', 'Kilifi', 'Magarini']);
        expect(screen.getByText('Magarini')).toHaveAttribute('aria-current', 'location');
        expect(getButtonLabels()).toEqual(['Kenya', 'Kilifi']);

        // Act & Assert
        fireEvent.click(screen.getByRole('button', { name: 'Kilifi' }));
        expect(drillUpTo).toHaveBeenLastCalledWith(2, expect.anything());

        fireEvent.click(screen.getByRole('button', { name: 'Kenya' }));
        expect(drillUpTo).toHaveBeenLastCalledWith(1, expect.anything());
    });

    test('opens the first exposed level of the event from the event crumb', () => {
        // Arrange
        const drillUpTo = vi.fn();

        // Act
        render(
            <Harness
                adminAreas={{
                    initialAdminLevel: 2 as AdminLevel,
                    drillPath: [magarini],
                    drillUpTo,
                }}
            />,
        );

        // Assert
        expect(getCrumbLabels()).toEqual(['Kenya', 'Magarini']);

        // Act & Assert
        fireEvent.click(screen.getByRole('button', { name: 'Kenya' }));
        expect(drillUpTo).toHaveBeenLastCalledWith(2, expect.anything());
    });

    test('holds jumps while the next level loads', () => {
        // Act
        render(
            <Harness
                adminAreas={{
                    initialAdminLevel: 1 as AdminLevel,
                    drillPath: [kilifi],
                    pending: true,
                }}
            />,
        );

        // Assert
        expect(screen.getByRole('button', { name: 'Kenya' })).toBeDisabled();
    });
});
