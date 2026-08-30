// eslint-disable-next-line import/prefer-default-export
export function resolveUrl(base: string, endpoint: string) {
    // If endpoint is already an absolute URL, return it as-is
    if (/^https?:\/\//i.test(endpoint)) {
        return endpoint;
    }

    // Ensure base ends with a slash
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;

    // Remove leading slash from endpoint to avoid URL() resetting the path
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint.slice(1)
        : endpoint;

    return new URL(normalizedEndpoint, normalizedBase).toString();
}
