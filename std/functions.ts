import Err from "./errors"

type Constructor<T = {}> = new (...args: any[]) => T;

interface PropertiesWithConstructor<t> {
    [key: string]: any;
    T: Constructor<t>;
}

export type Properties<T> = Pick<
    PropertiesWithConstructor<T>,
    Exclude<keyof PropertiesWithConstructor<T>, "T">
>;

export default function func<t>(K: Constructor<t>) {
    return <y extends PropertiesWithConstructor<t>, z = Properties<t>>(
        cb: (props: y) => t
    ): ((props: z) => t | Err) => {
        return (props: z) => {
            const props_ = props as unknown as y;
            props_.T = K;
            const res = cb(props_);
            if (!(res instanceof K)) {
                return new Err(
                    "Resoult of function did not match the specified type"
                );
            }
            return res;
        };
    };
}
