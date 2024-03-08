import React from "react";
import { Option, Result, lambda, printf } from "."
import { createRoot, Root } from "react-dom/client";
import { IS_BROWSER_PROCESS, is_browser } from ".";



export function Main(cb: lambda) {
    if (is_browser()) {
        window.addEventListener("load", cb);
        return;
    }
    printf("!w", "Using Main without an HTML DOM is not recommended.");
    cb();
}

export function $<T extends HTMLElement>(selector: string): Result<T, Error> {
    if (!is_browser()) return [null, new Error("Not browser environment!")];

    const r = document.querySelector<T>(selector);
    if (!r) {
        return [null, new Error("Element missing!")];
    }
    return [r, null];
}

export function $all<T extends HTMLElement>(selector: string): Result<T[], Error> {
    if (!is_browser()) return [null, new Error("Not browser environment!")];

    const r = document.querySelectorAll<T>(selector);
    return [Array.from(r), null];
}

let root: HTMLElement;
export function GetRoot(): Result<HTMLElement, Error> {
    if (!is_browser()) return [null, new Error("Not browser environment!")];
    if (!root) {
        let [rt, err] = $(".root");
        if (err) {
            const x = document.createElement("div");
            x.classList.add("root");
            document.body.appendChild(x);
            rt = x;
        }
        root = rt!;
    }
    return [root, null];
}

const rootMap: Map<HTMLElement, Root> = new Map<HTMLElement, Root>([]);

export function Render(tsx: React.ReactNode, to?: HTMLElement): Option<Error> {
    const [rt, err] = GetRoot();

    if (err instanceof Error) {
        return err;
    }

    if (!to) to = rt!;

    if (!rootMap.get(to)) rootMap.set(to, createRoot(to));

    rootMap.get(to)!.render(<React.StrictMode>{tsx}</React.StrictMode>);
}

