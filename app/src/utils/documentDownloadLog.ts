import { api } from '#config';
import { KEY_USER_STORAGE } from '#utils/constants';
import { getFromStorage } from '#utils/localStorage';
import { resolveUrl } from '#utils/resolveUrl';

type UserWithToken = {
    token?: string;
};

interface DocumentDownloadLogInput {
    documentType?: string | null;
    objectId?: string | number | null;
    source?: string | null;
    url: string;
}

interface DocumentDownloadLogPayload {
    document_type: string;
    object_id?: number;
    source?: string;
    url: string;
}

const DOCUMENT_DOWNLOAD_LOG_ENDPOINT = resolveUrl(api, '/api/v2/document-download-log/');
const IFRC_SHAREPOINT_HOSTNAME = 'ifrcorg.sharepoint.com';
const DOWNLOAD_FILE_EXTENSION_PATTERN = /\.(pdf|doc|docx|xls|xlsx|csv|ppt|pptx|zip|rar|7z|txt|rtf|jpg|jpeg|png|gif|webp|svg)$/i;
const DOWNLOAD_PATH_PATTERN = /(^|\/)(download|downloads|export|exports|file|files|document|documents)(\/|$)/i;

function normalizeObjectId(value: string | number | null | undefined) {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        return value;
    }

    if (typeof value === 'string') {
        const parsedValue = Number.parseInt(value, 10);

        if (Number.isInteger(parsedValue) && parsedValue > 0) {
            return parsedValue;
        }
    }

    return undefined;
}

function inferDocumentType(url: URL) {
    const lastSegment = url.pathname.split('/').filter(Boolean).at(-1);
    const extension = lastSegment?.split('.').at(-1)?.trim().toLowerCase();

    if (!extension || extension === lastSegment?.toLowerCase()) {
        return 'unknown';
    }

    return extension;
}

function createPayload(input: DocumentDownloadLogInput): DocumentDownloadLogPayload {
    const normalizedUrl = input.url.trim();
    const parsedUrl = new URL(normalizedUrl, window.location.href);
    const documentType = input.documentType?.trim() || inferDocumentType(parsedUrl);
    const source = input.source?.trim() || window.location.pathname;
    const objectId = normalizeObjectId(input.objectId);

    return {
        document_type: documentType,
        object_id: objectId,
        source,
        url: parsedUrl.toString(),
    };
}

export function logDocumentDownload(input: DocumentDownloadLogInput) {
    let payload: DocumentDownloadLogPayload;

    try {
        payload = createPayload(input);
    } catch {
        return;
    }

    const body = JSON.stringify(payload);

    try {
        if (navigator.sendBeacon) {
            const beaconBody = new Blob([body], { type: 'application/json' });
            const sent = navigator.sendBeacon(DOCUMENT_DOWNLOAD_LOG_ENDPOINT, beaconBody);

            if (sent) {
                return;
            }
        }
    } catch {
        // NOTE: sendBeacon should never interrupt the download flow.
    }

    try {
        const token = getFromStorage<UserWithToken | undefined>(KEY_USER_STORAGE)?.token;
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Token ${token}`;
        }

        fetch(DOCUMENT_DOWNLOAD_LOG_ENDPOINT, {
            body,
            headers,
            keepalive: true,
            method: 'POST',
        }).catch(() => {
            // NOTE: Logging is best-effort and should not affect user downloads.
        });
    } catch {
        // NOTE: Swallow all logging errors to keep download actions non-blocking.
    }
}

function isDownloadUrl(url: URL) {
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
        return false;
    }

    if (url.hostname.toLowerCase() === IFRC_SHAREPOINT_HOSTNAME) {
        return true;
    }

    const normalizedPath = url.pathname.toLowerCase();

    return DOWNLOAD_FILE_EXTENSION_PATTERN.test(normalizedPath)
        || DOWNLOAD_PATH_PATTERN.test(normalizedPath)
        || url.searchParams.has('download');
}

function shouldLogAnchor(anchor: HTMLAnchorElement, url: URL) {
    if (anchor.hasAttribute('download')) {
        return true;
    }

    if (anchor.dataset.documentType || anchor.dataset.objectId) {
        return true;
    }

    return isDownloadUrl(url);
}

function handleDocumentClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) {
        return;
    }

    const { target } = event;
    if (!(target instanceof Element)) {
        return;
    }

    const anchor = target.closest('a[href]');

    if (!(anchor instanceof HTMLAnchorElement)) {
        return;
    }

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
    }

    let resolvedUrl: URL;

    try {
        resolvedUrl = new URL(href.trim(), window.location.href);
    } catch {
        return;
    }

    if (!shouldLogAnchor(anchor, resolvedUrl)) {
        return;
    }

    logDocumentDownload({
        documentType: anchor.dataset.documentType,
        objectId: anchor.dataset.objectId,
        source: anchor.dataset.source,
        url: resolvedUrl.toString(),
    });
}

export function attachDownloadClickLogger() {
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
        document.removeEventListener('click', handleDocumentClick, true);
    };
}
