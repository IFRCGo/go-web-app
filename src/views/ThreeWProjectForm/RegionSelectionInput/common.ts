export const DEFAULT_FILL_COLOR = '#d1d1d1';
export const HIGHLIGHT_COLOR = '#f5333f';
export const TEXT_COLOR = '#313131';
export const TEXT_COLOR_ON_DARK = '#ffffff';
export const LINE_COLOR = '#212121';

export function highlightLayer(
  map: mapboxgl.Map,
  layerKeyBase: string,
  key: string,
  value: string | number,
) {
  const highlightKey = `${layerKeyBase}-highlight`;
  const boundaryKey = `${layerKeyBase}-boundary`;
  const labelKey = `${layerKeyBase}-label`;
  const labelPriority = `${layerKeyBase}-label-priority`;

  const opacityProperty = [
    'match',
    ['get', key],
    value,
    1,
    0,
  ];

  if (map.getLayer(layerKeyBase)) {
    map.setPaintProperty(
      layerKeyBase,
      'fill-opacity',
      opacityProperty,
    );
  }

  map.setPaintProperty(
    boundaryKey,
    'line-opacity',
    opacityProperty,
  );

  map.setPaintProperty(
    labelKey,
    'text-opacity',
    opacityProperty,
  );

  if (map.getLayer(labelPriority)) {
    map.setPaintProperty(
      labelPriority,
      'text-opacity',
      opacityProperty,
    );
  }

  map.setPaintProperty(
    highlightKey,
    'fill-opacity',
    opacityProperty,
  );
}
