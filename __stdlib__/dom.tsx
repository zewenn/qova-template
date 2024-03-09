import React from "react";
import { Option, Result, lambda, printf } from "."
import { createRoot, Root } from "react-dom/client";
import { act } from 'react-dom/test-utils';
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

    if (err) {
        return err;
    }

    if (!to) to = rt;

    if (!rootMap.get(to)) rootMap.set(to, createRoot(to));

    const root = rootMap.get(to)!;

    act(() => {
        root.render(<React.StrictMode>{tsx}</React.StrictMode>);
    });
}

/**
 * $Component helps managing the element's after render
 */
export namespace $c {
    interface BoundingBox {
        x: number;
        y: number;
        top: number;
        left: number;
        width: number;
        height: number;
    }

    function process_cls(cls: string): string[] {
        return cls.split(" ");
    }

    export function is<T extends HTMLElement>(element: T, cls: string): boolean {
        const className = process_cls(cls);
        for (let c in className) {
            if (!element.classList.contains(c)) {
                return false;
            }
        }
        return true;
    }

    export function make<T extends HTMLElement>(element: T, cls: string): void {
        const className = process_cls(cls);
        for (let c in className) {
            if (!element.classList.contains(c)) {
                element.classList.add(c);
            }
        }
    }

    export function unmake<T extends HTMLElement>(element: T, cls: string): void {
        const className = process_cls(cls);
        for (let c in className) {
            if (element.classList.contains(c)) {
                element.classList.remove(c);
            }
        }
    }

    export function css<T extends HTMLElement>(element: T, property: string, value: any): void {
        element.style.setProperty(property, `${value}`);
    }

    export function css_get<T extends HTMLElement>(element: T, property: string): Result<string, Error> {
        const value = element.computedStyleMap().get(property);
        /* istanbul ignore next */
        if (!value) return [null, new Error("Property not found!")];
        /* istanbul ignore next */
        return [value.toString(), null];
    }

    export function scale<T extends HTMLElement>(element: T): number {
        const [scale, err] = css_get(element, "scale");
        if (err) {
            return 1;
        }
        return parseFloat(scale!);
    }

    export function bounds<T extends HTMLElement>(element: T): BoundingBox {
        return {
            x: element.offsetLeft,
            y: element.offsetTop,
            left: element.offsetLeft,
            top: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight,
        };
    }
}