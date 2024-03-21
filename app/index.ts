import ElectronWindow, { IpcMainEventFn } from "../__stdlib__/electron";
import Ipc_Singals from "../ipc.config";

const Window = new ElectronWindow("../assets/icon.ico", "windowed", {
    width: 1600,
    height: 900,
});

Window.Bind(
    new Map<string, IpcMainEventFn>([
        [
            Ipc_Singals.Exit_App,
            () => {
                if (!Window.browser_window) return;
                Window.browser_window.close();
            },
        ],
        [
            Ipc_Singals.Toggle_Developer_Tools,
            () => {
                if (!Window.browser_window) return;
                if (Window.browser_window.webContents.isDevToolsOpened()) {
                    Window.browser_window.webContents.closeDevTools();
                    return;
                }
                Window.browser_window.webContents.openDevTools();
            },
        ],
        [
            Ipc_Singals.Reload,
            () => {
                if (!Window.browser_window) return;
                Window.browser_window.reload();
            },
        ],
    ])
);

Window.Init();
