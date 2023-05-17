export const defaultMapStyle = 'mapbox://styles/go-ifrc/ckrfe16ru4c8718phmckdfjh0';



export const defaultMapOptions: Omit<mapboxgl.MapboxOptions, 'style' | 'container'> = {
  logoPosition: 'bottom-left' as const,
  zoom: 1.5,
  minZoom: 0,
  maxZoom: 18,
  scrollZoom: false,
  pitchWithRotate: false,
  dragRotate: false,
  renderWorldCopies: true,
  attributionControl: false,
  preserveDrawingBuffer: true,
  // interactive: false,
};

export const ADAM_COLOR_RED = '#c03a2b';
export const ADAM_COLOR_ORANGE = '#f8aa05';
export const ADAM_COLOR_GREEN = '#38a800';
export const ADAM_COLOR_CONES = '#256db6';

export const COLOR_WHITE = '#ffffff';
export const COLOR_TEXT = '#707070';
export const COLOR_LIGHT_GREY = '#e0e0e0';
export const COLOR_BLACK = '#000000';
export const COLOR_LIGHT_YELLOW = '#ffd470';
export const COLOR_YELLOW = '#ff9e00';
export const COLOR_BLUE = '#4c5d9b';
export const COLOR_ORANGE = '#ff6b00';
export const COLOR_RED = '#f5333f';
export const COLOR_DARK_RED = '#730413';

export const OPERATION_TYPE_PROGRAMME = 0;
export const OPERATION_TYPE_EMERGENCY = 1;
export const OPERATION_TYPE_MULTI = -1;

export const pointColorMap: {
  [key: number]: string;
} = {
  [OPERATION_TYPE_EMERGENCY]: COLOR_BLUE,
  [OPERATION_TYPE_PROGRAMME]: COLOR_RED,
  [OPERATION_TYPE_MULTI]: COLOR_ORANGE,
};

const DEFAULT_CIRCLE_SIZE = 'medium';
const DEFAULT_CIRCLE_OPACITY = 'full';

export const CIRCLE_RADIUS_SMALL = 3;
export const CIRCLE_RADIUS_MEDIUM = 5;
export const CIRCLE_RADIUS_LARGE = 8;
export const CIRCLE_RADIUS_EXTRA_LARGE = 12;
export const CIRCLE_RADIUS_SUPER_LARGE = 16;

export function getPointCirclePaint(
  color: string,
  size: 'small' | 'medium' | 'large' | 'extraLarge' = DEFAULT_CIRCLE_SIZE,
  opacity: 'full' | 'light' = DEFAULT_CIRCLE_OPACITY,
): mapboxgl.CirclePaint {
  const sizeMap = {
    small: CIRCLE_RADIUS_SMALL,
    medium: CIRCLE_RADIUS_MEDIUM,
    large: CIRCLE_RADIUS_LARGE,
    extraLarge: CIRCLE_RADIUS_EXTRA_LARGE,
  };

  const opacityMap = {
    full: 1,
    light: 0.7,
  };

  return {
    'circle-color': color,
    'circle-radius': sizeMap[size] ?? DEFAULT_CIRCLE_SIZE,
    'circle-opacity': opacityMap[opacity] ?? DEFAULT_CIRCLE_OPACITY,
    'circle-pitch-alignment': 'map',
  };
}

export function getPointCircleHaloPaint(
  color: string,
  scaleProp: string,
  maxScaleValue: number,
): mapboxgl.CirclePaint  {

  // NOTE: setting this value as 2 because there are already stops of 0
  // and 1
  const maxScale = Math.max(maxScaleValue, 2);

  return {
    ...getPointCirclePaint(color),
    'circle-opacity': 0.4,
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      3, [
        'interpolate',
        ['exponential', 1],
        ['number', ['get', scaleProp]],
        0,
        0,
        1,
        10,
        maxScale,
        15
      ],
      8, [
        'interpolate',
        ['exponential', 1],
        ['number', ['get', scaleProp]],
        0,
        0,
        1,
        20,
        maxScale,
        40,
      ],
    ],
  };
}

export const defaultTooltipOptions: mapboxgl.PopupOptions = {
  closeButton: false,
  offset: 10,
};

export type BBOXType = [number, number, number, number];
export function fixBounds(bounds: number[]) {
  let newBounds = [...bounds] as BBOXType;
  /*
  if (newBounds[0] < -90 || newBounds[2] < -90) {
    if (newBounds[0] < 0) {
      newBounds[0] = 360 + newBounds[0];
    }

    if (newBounds[2] < 0) {
      newBounds[2] = 360 + newBounds[2];
    }
  }
  */

  return newBounds as BBOXType;
}

