import React, { useEffect } from "react";
import { Option, Result, lambda, printf, Silence, ForceCast } from ".";
import { createRoot, Root } from "react-dom/client";
import { IS_BROWSER_PROCESS, is_browser } from ".";
import { act } from "react-dom/test-utils";

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

const HookMap = new Map<string, HTMLElement>([]);
export function $hook(selector: string): Result<() => HTMLElement | null, Error> {
    if (!is_browser()) return [null, new Error("Not browser environment!")];
    const [Root, Root_Err] = GetRoot();

    if (Root_Err) {
        printf("!e", Root_Err);
        return [null, Root_Err];
    }

    return [() => {
        const hg = HookMap.get(selector);

        if (hg) {
            if (IsChildOf(Root, hg)) {
                return hg;
            }
        }

        const El = document.querySelector<HTMLElement>(selector);

        return El;
    }, null]
}

export function $all<T extends HTMLElement>(
    selector: string
): Result<T[], Error> {
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
const toArrMap: Map<Root, React.ReactNode[]> = new Map<Root, React.ReactNode[]>(
    []
);

export function Render(tsx: React.ReactNode, to?: HTMLElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const [rt, err] = GetRoot();

        if (err) {
            printf("!e", err);
            reject(err);
            return;
        }

        if (!to) to = rt;
        if (!rootMap.get(to)) rootMap.set(to, createRoot(to));

        const root = rootMap.get(to)!;

        if (!toArrMap.get(root)) toArrMap.set(root, []);
        const rootArr = toArrMap.get(root)!;
        rootArr.push(tsx);

        function RootObj() {
            useEffect(() => {
                resolve();
            });
            return <>{...rootArr}</>;
        }
        root.render(<RootObj />);
    });

    // Silence(() => act(() => root.render(<></>)));
}

/**
 * $Component helps managing the element's after render
 */
export interface BoundingBox {
    x: number;
    y: number;
    top: number;
    left: number;
    width: number;
    height: number;
}

export function IsChildOf(parent: HTMLElement, child: HTMLElement) {
    return !!(parent.querySelector(child.className));
}

function ProcessClassName(cls: string): string[] {
    return cls.split(" ");
}

export function IsClassName<T extends HTMLElement>(
    element: T,
    cls: string
): boolean {
    const className = ProcessClassName(cls);
    for (let c in className) {
        if (!element.classList.contains(c)) {
            return false;
        }
    }
    return true;
}

export function SetCSS<T extends HTMLElement>(
    element: T,
    property: string,
    value: any
): void {
    element.style.setProperty(property, `${value}`);
}

export function GetProperty<T extends HTMLElement>(
    element: T,
    property: string
): Result<string, Error> {
    const value = element.computedStyleMap().get(property);
    /* istanbul ignore next */
    if (!value) return [null, new Error("Property not found!")];
    /* istanbul ignore next */
    return [value.toString(), null];
}

export function GetScale<T extends HTMLElement>(element: T): number {
    const [scale, err] = GetProperty(element, "scale");
    if (err) {
        return 1;
    }
    return parseFloat(scale!);
}

export function GetBounds<T extends HTMLElement>(element: T): BoundingBox {
    return {
        x: element.offsetLeft,
        y: element.offsetTop,
        left: element.offsetLeft,
        top: element.offsetTop,
        width: element.offsetWidth,
        height: element.offsetHeight,
    };
}
