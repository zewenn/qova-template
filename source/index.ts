import { Match, Resoult, printf } from "../std/std";

const m = new Map<any, string>([
    [0, "1"],
    ["_", "1"],
]);

for (let [_, val] of m) {
    printf(val);
}

printf(Match<string>("v", { hello: 10, _: 10, asd: 20 }));
