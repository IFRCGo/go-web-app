import { render } from '@testing-library/react';
import {
    describe,
    expect,
    test,
    vi,
} from 'vitest';

import createFakeMapboxMap from '#utils/testing/createFakeMapboxMap';
import {
    adminAreaLayerId,
    createAdminAreaFeature,
    createAdminAreaProperties,
} from '#utils/testing/nrwAdminAreaTesting';
import NrwMapTestHost from '#utils/testing/NrwMapTestHost';
import { type PlaceCode } from '#views/CountryProfileNationalRiskWatch/types';

import useAdminAreaHover from './useAdminAreaHover';

function HoverLayer(props: {
    isEnabled: boolean;
    canDrillDown: (placeCode: PlaceCode) => boolean;
    onHoverChange: (placeCode: PlaceCode | undefined) => void;
}) {
    const { isEnabled, canDrillDown, onHoverChange } = props;

    useAdminAreaHover(adminAreaLayerId, isEnabled, undefined, onHoverChange, canDrillDown);

    return null;
}

function setup(options: {
    isEnabled?: boolean;
    canDrillDown: (placeCode: PlaceCode) => boolean;
}) {
    const { isEnabled = true, canDrillDown } = options;

    const fake = createFakeMapboxMap();
    const onHoverChange = vi.fn();
    const { rerender } = render(
        <NrwMapTestHost map={fake.map}>
            <HoverLayer
                isEnabled={isEnabled}
                canDrillDown={canDrillDown}
                onHoverChange={onHoverChange}
            />
        </NrwMapTestHost>,
    );

    function hoverOver(properties: unknown) {
        fake.simulateEvent('mousemove', {
            features: [createAdminAreaFeature(properties)],
            lngLat: { lng: 31.3, lat: 6.8 },
        }, adminAreaLayerId);
    }

    function rerenderHoverLayer(newCanDrillDown: (placeCode: PlaceCode) => boolean) {
        rerender(
            <NrwMapTestHost map={fake.map}>
                <HoverLayer
                    isEnabled={isEnabled}
                    canDrillDown={newCanDrillDown}
                    onHoverChange={onHoverChange}
                />
            </NrwMapTestHost>,
        );
    }

    return {
        fake,
        onHoverChange,
        hoverOver,
        rerenderHoverLayer,
    };
}

describe('useAdminAreaHover', () => {
    test('shows the pointer cursor over an admin area that can be drilled into', () => {
        // Arrange
        const { fake, hoverOver } = setup({ canDrillDown: () => true });

        // Act
        hoverOver(createAdminAreaProperties('SSD.1', 1));

        // Assert
        expect(fake.canvas.style.cursor).toBe('pointer');
    });

    test('keeps the default cursor over an admin area that cannot be drilled into', () => {
        // Arrange
        const { fake, hoverOver } = setup({ canDrillDown: () => false });

        // Act
        hoverOver(createAdminAreaProperties('SSD.1.1', 2));

        // Assert
        expect(fake.canvas.style.cursor).toBe('');
    });

    test('still reports the hover for an admin area that cannot be drilled into', () => {
        // Arrange
        const { onHoverChange, hoverOver } = setup({ canDrillDown: () => false });

        // Act
        hoverOver(createAdminAreaProperties('SSD.1.1', 2));

        // Assert
        expect(onHoverChange).toHaveBeenCalledWith('SSD.1.1');
    });

    test('resets the cursor and the hover when the pointer leaves the layer', () => {
        // Arrange
        const { fake, onHoverChange, hoverOver } = setup({ canDrillDown: () => true });
        hoverOver(createAdminAreaProperties('SSD.1', 1));

        // Act
        fake.simulateEvent('mouseleave', {}, adminAreaLayerId);

        // Assert
        expect(fake.canvas.style.cursor).toBe('');
        expect(onHoverChange).toHaveBeenLastCalledWith(undefined);
    });

    test('does not register listeners when disabled', () => {
        // Arrange
        const { fake, onHoverChange, hoverOver } = setup({
            isEnabled: false,
            canDrillDown: () => true,
        });

        // Act
        hoverOver(createAdminAreaProperties('SSD.1', 1));

        // Assert
        expect(fake.canvas.style.cursor).toBe('');
        expect(onHoverChange).not.toHaveBeenCalled();
    });

    test('reads the latest canDrillDown without re-registering the listener', () => {
        // Arrange
        const { fake, hoverOver, rerenderHoverLayer } = setup({ canDrillDown: () => true });
        const properties = createAdminAreaProperties('SSD.1.1', 2);

        // Act
        hoverOver(properties);

        // Assert
        expect(fake.canvas.style.cursor).toBe('pointer');

        // Act: a new canDrillDown identity with the area no longer drillable.
        rerenderHoverLayer(() => false);
        hoverOver(properties);

        // Assert
        expect(fake.canvas.style.cursor).toBe('');
    });
});
