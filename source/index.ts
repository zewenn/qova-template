import { Match, Resoult, printf } from "../std/std";
import { $, Main } from "../std/std.dom";

// printf(Match<string>("v", { hello: 10, _: 10, asd: 20 }));

Main(() => {
    console.log("Hello");
})


/**
 *
 * Match(val: any, {
 *      ["_", () => {
 *          printf("Well shit");
 *      }]
 *
 *
 *      _: () => {
 *          printf("Well shit");
 *      }
 * })
 *
 *
 */
