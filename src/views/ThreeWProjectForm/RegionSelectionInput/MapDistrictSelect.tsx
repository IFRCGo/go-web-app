import React from 'react';
import { MapChildContext } from '@togglecorp/re-map';

import {
  highlightLayer,
  DEFAULT_FILL_COLOR,
  HIGHLIGHT_COLOR,
} from './common';

function useMap() {
  const { map } = React.useContext(MapChildContext);
  const [styleLoadedMap, setStyleLoadedMap] = React.useState<mapboxgl.Map>();

  React.useEffect(() => {
    const handleStyleLoad = () => {
      setStyleLoadedMap(map);
    };

    if (map) {
      if (map.isStyleLoaded()) {
        setStyleLoadedMap(map);
      } else {
        map.on('styledata', handleStyleLoad);
      }
    }

    return () => {
      if (map) {
        map.off('styledata', handleStyleLoad);
      }
    };
  }, [map]);
  
  return styleLoadedMap;
}

interface Props {
  countryId: number;
  selectedDistricts: number[] | undefined | null;
  onClick: (districtId: number) => void;
  onDoubleClick?: (districtId: number) => void;
}

function MapDistrictSelect(props: Props) {
  const {
    selectedDistricts,
    onClick,
    onDoubleClick,
    countryId,
  } = props;

  const map = useMap();
  const LAYER_NAME = 'admin-1-highlight';

  React.useEffect(() => {
    if (!map) {
      return;
    }

    map.setLayoutProperty(LAYER_NAME, 'visibility', 'visible');
    map.setPaintProperty(LAYER_NAME, 'fill-color', DEFAULT_FILL_COLOR);
    highlightLayer(map, 'admin-1', 'country_id', countryId);
    highlightLayer(map, 'admin-0', 'country_id', countryId);

    map.doubleClickZoom.disable();
  }, [map, countryId]);

  React.useEffect(() => {
    if (!map) {
      return;
    }

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const selectedFeatures = map.queryRenderedFeatures(e.point);
      const districtId = selectedFeatures?.filter(
        (feature) => feature?.properties?.country_id === countryId && feature?.properties?.district_id
      )[0]?.properties?.district_id as number | undefined;

      if (districtId && onClick) {
        onClick(districtId);
      }
    };

    const handleMapDoubleClick = (e: mapboxgl.MapMouseEvent) => {
      const selectedFeatures = map.queryRenderedFeatures(e.point);
      const districtId = selectedFeatures?.filter(
        (feature) => feature?.properties?.country_id === countryId && feature?.properties?.district_id
      )[0]?.properties?.district_id as number | undefined;

      if (districtId && onDoubleClick) {
        onDoubleClick(districtId);
      }
    };

    map.on('click', handleMapClick);
    if (onDoubleClick) {
      map.on('dblclick', handleMapDoubleClick);
    }

    return () => {
      map.off('click', handleMapClick);
      map.off('dblclick', handleMapDoubleClick);
    };
  }, [map, onClick, onDoubleClick, countryId]);

  React.useEffect(() => {
    if (!map || !selectedDistricts) {
      return;
    }

    if (selectedDistricts.length > 0) {
      const paintProperty = [
        'match',
        ['get', 'district_id'],
        ...selectedDistricts.map((districtId) => [
          districtId,
          HIGHLIGHT_COLOR,
        ]).flat(),
        DEFAULT_FILL_COLOR,
      ];

      map.setPaintProperty(LAYER_NAME, 'fill-color', paintProperty);
    } else {
      map.setPaintProperty(LAYER_NAME, 'fill-color', DEFAULT_FILL_COLOR);
    }
  }, [map, selectedDistricts]);

  return null;
}

export default MapDistrictSelect;
