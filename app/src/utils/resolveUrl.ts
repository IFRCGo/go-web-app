// eslint-disable-next-line import/prefer-default-export
export function resolveUrl(from: string, to: string) {
    const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
    if (resolvedUrl.protocol === 'resolve:') {
        const { pathname, search, hash } = resolvedUrl;
        return pathname + search + hash;
    }
    return resolvedUrl.toString();
}
