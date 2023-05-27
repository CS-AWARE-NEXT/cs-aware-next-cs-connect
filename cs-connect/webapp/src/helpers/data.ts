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
    if (!array || array.length < 1 || array.length < index) {
        return undefined;
    }
    return array.splice(index, 1)[0];
};

export const isAnyPropertyMissingFromObject = <T extends {}>(obj: T | undefined) => {
    return !obj || Object.keys(obj).some((key) => !key);
};

export const replaceAt = (
    input: string,
    search: string,
    replace: string,
    start: number,
    end: number,
): string => {
    const startString = input.slice(0, start);
    const middleString = input.slice(start, end).replace(search, replace);
    const endString = input.slice(end);
    return `${startString}${middleString}${endString}`;
};