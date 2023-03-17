export type MapEntry<T> = {
    key: string;
    value: T;
};

export const buildMap = <T>(entries: MapEntry<T>[]): Map<string, T> => {
    const map: Map<string, T> = new Map<string, T>();
    entries.forEach(({key, value}) => {
        map.set(key, value);
    });
    return map;
};