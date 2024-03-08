import React from "react";
import { Result, lambda, printf } from "./std"
import { createRoot, Root } from "react-dom/client";


namespace std_dom {
    export namespace generic {
        export let IS_BROWSER_PROCESS: boolean = false;
        export function is_browser(): boolean {
            try {
                if (document && window) return true;
            }
            catch {
                return false;
            }
            return false;
        }

        /**
         * asdasd
         * @param cb 
         * @returns 
         */
        export function Main(cb: lambda) {
            if (is_browser()) {
                IS_BROWSER_PROCESS = true;

                window.addEventListener("load", cb);
                return;
            }
            printf("!w", "Using Main without an HTML DOM is not recommended.");
            cb();
        }
    }

    export namespace queries {
        export function $<T extends HTMLElement>(selector: string): Result<T, Error> {
            if (!generic.is_browser()) return [null, new Error("Not browser environment!")];

            const r = document.querySelector<T>(selector);
            if (!r) {
                return [null, new Error("Element missing!")];
            }
            return [r, null];
        }

        export function $all<T extends HTMLElement>(selector: string): Result<T[], Error> {
            if (!generic.is_browser()) return [null, new Error("Not browser environment!")];

            const r = document.querySelectorAll<T>(selector);
            return [Array.from(r), null];
        }
    }

    export namespace react {
        let root: HTMLElement;
        export function GetRoot() {
            if (!root) {
                let [rt, err] = queries.$(".root");
                if (err) {
                    const x = document.createElement("div");
                    x.classList.add("root");
                    document.body.appendChild(x);
                    rt = x;
                }
                root = rt!;
            }
            return root;
        }
        
        const toMap: Map<HTMLElement, Root> = new Map<HTMLElement, Root>([]);

        export function Render(tsx: React.ReactNode, to?: HTMLElement) {
            if (!to) to = GetRoot();
        
            if (!toMap.get(to)) toMap.set(to, createRoot(to));

            toMap.get(to)!.render(<React.StrictMode>{tsx}</React.StrictMode>);
        }
    }
}


export const Main = std_dom.generic.Main;
export const $ = std_dom.queries.$;
export const $all = std_dom.queries.$all;
export const Render = std_dom.react.Render;