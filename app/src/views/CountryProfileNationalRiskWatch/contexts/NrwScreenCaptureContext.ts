import { createContext } from 'react';

export interface NrwCapturedImage {
    dataUrl: string;
    aspectRatio: number;
}

export type NrwScreenCaptureHandler = () => Promise<NrwCapturedImage>;

export interface NrwScreenCaptureContextProps {
    takeScreenCapture: NrwScreenCaptureHandler | undefined;
}

const NrwScreenCaptureContext = createContext<NrwScreenCaptureContextProps>({
    takeScreenCapture: undefined,
});

export default NrwScreenCaptureContext;
