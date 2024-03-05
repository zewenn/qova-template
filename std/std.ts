export type Resoult<T, Err extends Error> = T | Err;
export type Ref<T extends Object> = T & { __phantom__: "Reference" };
export type Val<T> = T & { __phantom__: "Value" };
export type Matcher<T extends string | number | symbol> = {
    [key in T]: any;
} & {
    _: any;
};

type MissingKeys<T extends K, K> = Pick<T, Exclude<keyof T, keyof K>>;

/**
 * A binding to `console.log`
 */
export const printf = console.log;

/**
 * ### **DO NOT USE UNLESS YOU ARE 200% SURE ABOUT THIS**
 * This will cast the **`value`** as **`unknown`** and then to **`T`**.
 * @param value
 * @returns
 */
export function ForceCast<T>(value: any): T {
    return value as unknown as T;
}

/**
 * Converts from a type (**F**) to another type (**T**), but only if **T** extends **F**
 * ### Note:
 * This will only Cast the type, **it won't change to object**.
 * @param value
 * @returns
 */
export function Cast<F, T extends F>(value: F): T {
    return value as T;
}

/**
 * Converts from a type (**F**) to another type (**T**), but only if **T** extends **F**
 * ### Note:
 * This will extend the original object!
 * @param obj The object you wish to convert cast
 * @param missing The missing keys of the new object type
 * @returns 
 */
export function ConvertCast<F, T extends F>(obj: F, missing?: MissingKeys<T, F>) {
    const res: T = Cast<F, T>(obj);
    if (missing) {
        for (const key in missing) {
            res[key] = missing[key];
        }
    }
    return res;
}

/**
 * Marks a value as a `Ref` to explicitly state that it will change somewhere else.
 * @param value 
 * @returns 
 */
export function useRef<T extends Object | Function>(
    value: T
): Resoult<Ref<T>, Error> {
    if (
        (typeof value === "object" || typeof value === "function") &&
        value !== null
    )
        return Cast<T, Ref<T>>(value);
    return new Error(`Cannot reference type ${typeof value}`);
}

/**
 * Creates a `stricturedClone` of the object and cast it as `Val` to explicitly state that 
 * this variable is only a value and won't change anywhere else.
 * @param value 
 * @returns 
 */
export function useVal<T>(value: T): Val<T> {
    return Cast<T, Val<T>>(structuredClone(value));
}

/**
 * Match a value to an object's keys. If no key is valid the function returns the default one (`_`).
 * @param val 
 * @param to 
 * @returns 
 */
export function Match<T extends string | number | symbol>(
    val: T,
    to: Matcher<T>
) {
    if (!to[val]) {
        return to["_"];
    }
    return to[val];
}
