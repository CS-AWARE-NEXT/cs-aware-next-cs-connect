export const getCachedResponse = async <CachedResponse = any>(
    cacheName: string,
    key: string,
): Promise<CachedResponse | null> => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(key);
    if (!cachedResponse) {
        return null;
    }
    const response = await cachedResponse.json();
    return response as CachedResponse;
};

export const putCacheResponse = async (
    cacheName: string,
    key: string,
    value: any,
): Promise<void> => {
    const cache = await caches.open(cacheName);
    if (!value) {
        return;
    }
    await cache.put(key, new Response(JSON.stringify(value)));
};