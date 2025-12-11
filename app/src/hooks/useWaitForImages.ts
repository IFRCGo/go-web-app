import {
    useEffect,
    useState,
} from 'react';

function useWaitForImages() {
    const [imagesReady, setImagesReady] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        async function waitForImages() {
            const images = Array.from(document.querySelectorAll('img'));

            if (images.length === 0) {
                if (!isCancelled) {
                    setImagesReady(true);
                }
                return;
            }

            const listeners: Array<{
                img: HTMLImageElement;
                handler: () => void;
            }> = [];

            const promises = images.map((image) => {
                if (image.complete) {
                    // Already loaded, nothing to wait for
                    return undefined;
                }

                return new Promise<void>((resolve) => {
                    const handler = () => {
                        image.removeEventListener('load', handler);
                        image.removeEventListener('error', handler);
                        resolve();
                    };

                    image.addEventListener('load', handler);
                    image.addEventListener('error', handler); // treat error as "done"

                    listeners.push({ img: image, handler });
                });
            }).filter((p): p is Promise<void> => p !== undefined);

            if (promises.length === 0) {
                if (!isCancelled) {
                    setImagesReady(true);
                }
                return;
            }

            await Promise.all(promises);

            if (!isCancelled) {
                setImagesReady(true);
            }
        }

        waitForImages();

        return () => {
            // avoid setting state after unmount
            isCancelled = true;
        };
    }, []);

    return imagesReady;
}

export default useWaitForImages;
