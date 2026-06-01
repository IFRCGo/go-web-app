import { useMemo } from 'react';
import {
    ListView,
    RadioInput,
    Switch,
} from '@ifrc-go/ui';

interface OpacityOption {
    key: number;
    label: string;
}

function opacityKeySelector(o: OpacityOption) { return o.key; }
function opacityLabelSelector(o: OpacityOption) { return o.label; }

interface Props {
    show: boolean;
    onShowChange: (value: boolean) => void;
    opacity: number;
    onOpacityChange: (value: number) => void;
}

function RasterOverlayControl(props: Props) {
    const {
        show,
        onShowChange,
        opacity,
        onOpacityChange,
    } = props;

    const opacityOptions = useMemo<OpacityOption[]>(() => ([
        { key: 0.25, label: '25%' },
        { key: 0.5, label: '50%' },
        { key: 0.75, label: '75%' },
        { key: 1, label: '100%' },
    ]), []);

    return (
        <ListView
            layout="block"
            spacing="sm"
            withBackground
            withPadding
        >
            <Switch
                // FIXME: use strings
                label="Show forecast on map"
                name="showRaster"
                value={show}
                onChange={onShowChange}
                withInvertedView
            />
            {show && (
                <RadioInput
                    // FIXME: use strings
                    label="Opacity"
                    name="rasterOpacity"
                    value={opacity}
                    options={opacityOptions}
                    keySelector={opacityKeySelector}
                    labelSelector={opacityLabelSelector}
                    onChange={onOpacityChange}
                    radioListLayout="inline"
                    spacing="xs"
                />
            )}
        </ListView>
    );
}

export default RasterOverlayControl;
