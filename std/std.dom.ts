import { Resoult, lambda, printf } from "./std"
import { html, render } from "htm/preact";


let IS_BROWSER_PROCESS: boolean = false;

function is_browser(): boolean {
    try {
        if (document && window) return true;
    }
    catch {
        return false;
    }
    return false;
}

export function $<T extends HTMLElement>(selector: string): Resoult<T, Error> {
    if (!is_browser()) return new Error("Not browser environment!");
    
    const r = document.querySelector<T>(selector);
    if (!r) {
        return new Error("Element missing!");
    }
    return r;
}

export function $all<T extends HTMLElement>(selector: string): Resoult<T[], Error> {
    if (!is_browser()) return new Error("Not browser environment!");

    const r = document.querySelectorAll<T>(selector);
    return Array.from(r);
}

export function Main(cb: lambda) {
    if (is_browser()) {
        IS_BROWSER_PROCESS = true;

        render(html``, document.body);

        window.addEventListener("load", cb);
        return;
    }
    printf("!w", "Using Main without an HTML DOM is not recommended.");
    cb();
}