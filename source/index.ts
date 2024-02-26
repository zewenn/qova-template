import func from "../std/functions";
import Err from "../std/errors";
import print from "../std/io";

class u32 {
    private max: number = 4_294_967_295;
    private value_: number;

    public get value(): number {
        return this.value_;
    }

    public set value(v: number) {
        if (v % 1 != 0) v = parseInt(`${v}`);

        if (v > this.max) {
            v = this.max;
        }
        if (v < 0) {
            v = this.max + v;
        }

        this.value_ = v;
    }

    constructor(value: number) {
        this.value = value;
    }
}

const test = func(u32)(({ T, a, b }) => {
    print(T);
    return new u32(a + b);
});

if (!Err.isError(test)) {
    print(test({ a: 2, b: 3.3333 }));
}
