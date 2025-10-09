// eslint-disable-next-line import/prefer-default-export
export function resolveUrl(base: string, endpoint: string) {
    const baseSafe = base.endsWith('/') ? base : `${base}/`;
    const endpointSafe = endpoint.startsWith('.') ? endpoint : `.${endpoint}`;

    const resolvedUrl = new URL(endpointSafe, baseSafe);

    return resolvedUrl.toString();
}
