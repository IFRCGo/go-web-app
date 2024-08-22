import { useCallback } from 'react';
import {
    Checkbox,
    ExpandableContainer,
    TextOutput,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

const NODES = 1;
const TRACKS = 2;
const BUFFERS = 3;
const UNCERTAINTY = 4;

type Footprint = GeoJSON.FeatureCollection<GeoJSON.Geometry> | undefined;

interface Option {
    key: number;
    label: string;
}

export interface Props {
    options: Option;
    value: {[key: string]: boolean};
    onChange: (value: boolean, name: number) => void;
    exposure: Footprint;
}

function LayerInput(props: Props) {
    const {
        options,
        value,
        onChange,
        exposure,
    } = props;

    const content = useCallback((key: number) => {
        if (key === NODES) {
            return (
                exposure?.features?.map((eventDetail) => {
                    if (eventDetail?.geometry?.type === 'Point') {
                        const nodeDetails = [`${eventDetail?.properties?.severitydata?.severity} ${eventDetail?.properties?.severitydata?.severityunit}`].join(', ');
                        return nodeDetails;
                    }
                    return null;
                })
            );
        }

        if (key === TRACKS) {
            return (
                <TextOutput value="Not Available" />
            );
        }

        if (key === BUFFERS) {
            return (
                <TextOutput value="Not Available" />
            );
        }

        if (key === UNCERTAINTY) {
            return (
                <TextOutput value="Not Available" />
            );
        }
        return null;
    }, [exposure]);

    return (
        <ExpandableContainer
            className={styles.container}
            headerClassName={styles.heading}
            withHeaderBorder={false}
            withoutWrapInFooter={false}
            heading={options.label}
            headingLevel={4}
            spacing="default"
            icons={(
                <Checkbox
                    key={options.key}
                    name={options.key}
                    value={!!value[options.key]}
                    onChange={onChange}
                />
            )}
        >
            {content(options.key)}
        </ExpandableContainer>
    );
}

export default LayerInput;
