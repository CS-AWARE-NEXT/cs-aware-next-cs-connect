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

export const getAndRemoveOneFromArray = <T>(array: T[], index: number): T | undefined => {
    if (!array || array.length < index) {
        return undefined;
    }
    return array.splice(index, 1)[0];
};