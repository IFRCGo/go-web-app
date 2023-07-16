import React from 'react';
import {
  MapChildContext,
  MapSource,
  MapLayer,
} from '@togglecorp/re-map';

import {
  highlightLayer,
  DEFAULT_FILL_COLOR,
  HIGHLIGHT_COLOR,
  TEXT_COLOR,
  TEXT_COLOR_ON_DARK,
  LINE_COLOR,
} from './common';
import styles from './styles.module.scss';

interface Props {
  countryIso: string;
  districtId: number;
  selectedAdmin2s: number[] | undefined | null;
  onClick: (admin2Id: number) => void;
}

function MapAdmin2Select(props: Props) {
  const {
    countryIso,
    districtId,
    selectedAdmin2s,
    onClick,
  } = props;

  const { map } = React.useContext(MapChildContext);
  const [mapError, setMapError] = React.useState<boolean>(false);
  const mapStyleLoaded = map && map.isStyleLoaded;
  const layerName = `go-admin2-${countryIso}-staging`;
  const centroidLayerName = `go-admin2-${countryIso}-centroids`;

  React.useEffect(() => {
    if (!map || !mapStyleLoaded) {
      return;
    }

    map.on('error', () => {
      setMapError(true);
    });

    highlightLayer(map, 'admin-0', 'country_id', 0);
    highlightLayer(map, 'admin-1', 'district_id', 0);
  }, [map, mapStyleLoaded, districtId]);

  React.useEffect(() => {
    if (!map || !mapStyleLoaded) {
      return;
    }

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const selectedFeatures = map.queryRenderedFeatures(e.point);
      const admin2Id = selectedFeatures?.filter(
        (feature) => feature?.properties?.admin1_id === districtId && feature?.properties?.id
      )[0]?.properties?.id as number| undefined;

      if (admin2Id && onClick) {
        onClick(admin2Id);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, mapStyleLoaded, onClick, districtId]);

  const paintProperty = selectedAdmin2s && selectedAdmin2s.length > 0 ? [
    'match',
    ['get', 'id'],
    ...selectedAdmin2s.map((admin2) => [
      admin2,
      HIGHLIGHT_COLOR,
    ]).flat(),
    DEFAULT_FILL_COLOR,
  ] : DEFAULT_FILL_COLOR;

  const textColor = selectedAdmin2s && selectedAdmin2s.length > 0 ? [
    'match',
    ['get', 'id'],
    ...selectedAdmin2s.map((admin2) => [
      admin2,
      TEXT_COLOR_ON_DARK,
    ]).flat(),
    TEXT_COLOR,
  ] : TEXT_COLOR;

  return (
    <>
      {mapError && (
        <div className={styles.emptyMessage}>
          <div className={styles.text}>
            Admin2 not available
          </div>
        </div>
      )}
      {!mapError && (
        <>
          <MapSource
            sourceKey="country-admin-2"
            sourceOptions={{
                type: 'vector',
                url: `mapbox://go-ifrc.go-admin2-${countryIso}-staging`
            }}
          >
            <MapLayer
              layerKey="admin-2-fill"
              layerOptions={{
                type: 'fill',
                'source-layer': layerName,
                paint: {
                  'fill-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    districtId,
                    1,
                    0,
                  ],
                  'fill-color': paintProperty,
                },
              }}
            />
            <MapLayer
              layerKey="admin-2-line"
              layerOptions={{
                type: 'line',
                'source-layer': layerName,
                paint: {
                  'line-color': LINE_COLOR,
                  'line-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    districtId,
                    1,
                    0,
                  ],
                },
              }}
            />
          </MapSource>
          <MapSource
            sourceKey="country-admin-2-labels"
            sourceOptions={{
              type: 'vector',
              url: `mapbox://go-ifrc.go-admin2-${countryIso}-centroids`,
            }}
          >
            <MapLayer
              layerKey="admin-2-label"
              layerOptions={{
                type: 'symbol',
                'source-layer': centroidLayerName,
                paint: {
                  'text-color': textColor,
                  'text-opacity': [
                    'match',
                    ['get', 'admin1_id'],
                    districtId,
                    1,
                    0,
                  ],
                },
                layout: {
                  // FIXME: fix this in remap
                  // @ts-ignore
                  'text-field': ['get', 'name'],
                  'text-anchor': 'center',
                  'text-size': 10,
                },
              }}
            />
          </MapSource>
        </>
      )}
    </>
  );
}

export default MapAdmin2Select;
