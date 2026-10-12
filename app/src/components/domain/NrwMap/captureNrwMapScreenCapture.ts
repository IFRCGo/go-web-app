import { toPng } from 'html-to-image';
import { type Map as MapboxMap } from 'mapbox-gl-v3';

const screenCapturePixelRatio = 2;

// Capture an individual HTML element as an image
export function captureElement(element: HTMLElement) {
    const { width, height } = element.getBoundingClientRect();
    if (width <= 0 || height <= 0) {
        throw new Error('Element to capture has no size');
    }

    return toPng(element, {
        cacheBust: true,
        pixelRatio: screenCapturePixelRatio,
    }).then((dataUrl) => ({ dataUrl, aspectRatio: width / height }));
}

// Capture handler to fetch a filtered view of the NRW map
function captureNrwMap(map: MapboxMap) {
    return () => {
        const container = map.getContainer();
        const controls = container.querySelector('.mapboxgl-control-container');

        const { width, height } = container.getBoundingClientRect();
        if (width <= 0 || height <= 0) {
            throw new Error('Map container has no size');
        }

        return toPng(container, {
            cacheBust: true,
            pixelRatio: screenCapturePixelRatio,
            filter: (node) => node !== controls,
        }).then((dataUrl) => ({ dataUrl, aspectRatio: width / height }));
    };
}

export default captureNrwMap;
