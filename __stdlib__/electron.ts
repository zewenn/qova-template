import { app, BrowserWindow, Menu, ipcMain, IpcMainEvent } from "electron";

interface Resolution {
    width: number;
    height: number;
}

interface EventBinds {
    [key: string]: (event?: IpcMainEvent, ...args: any[]) => void;
}

type WindowMode = "windowed" | "windowed-fullscreen" | "fullscreen";

export default class ElectronWindow {
    public resolution: Resolution;
    public ipcEvents: EventBinds;
    public bw_options: Electron.BrowserViewConstructorOptions;
    public mode: WindowMode;
    public icon_path: string;
    public browser_window?: BrowserWindow;

    constructor(
        icon_path: string,
        mode: WindowMode = "windowed",
        resolution?: Resolution
    ) {
        this.icon_path = icon_path;
        this.mode = mode;
        if (!resolution) {
            resolution = {
                width: 1280,
                height: 720,
            };
        }
        this.resolution = resolution;
        this.ipcEvents = {};
        this.bw_options = {};
    }

    public bind(events: EventBinds) {
        for (const key in events) {
            this.ipcEvents[key] = events[key];
        }
    }

    public bind_constructor_options(
        options: Electron.BrowserViewConstructorOptions
    ) {
        for (const key in options) {
            this.bw_options[key] = options[key];
        }
    }

    public init() {
        const new_bw = () => {
            const options: Electron.BrowserWindowConstructorOptions = {
                width: this.resolution.width,
                height: this.resolution.height,
                icon: this.icon_path,
                webPreferences: {
                    backgroundThrottling: false,
                    nodeIntegration: true,
                    contextIsolation: false,
                    offscreen: false,
                },
                frame: this.mode !== "windowed-fullscreen",
                fullscreen: this.mode === "fullscreen",
            };
            for (const key in this.bw_options) {
                options[key] = this.bw_options[key];
            }
            
            const bw = new BrowserWindow(options);
            this.browser_window = bw;

            Menu.setApplicationMenu(null);
            bw.loadFile('index.html');
        };

        app.whenReady().then(() => {
            new_bw();
        });
        
        app.on('window-all-closed', () => {
            app.quit();
            console.log("\r\n");
        })

        for (let key in this.ipcEvents) {
            if (key.startsWith("once:")) {
                ipcMain.once(key, this.ipcEvents[key]);
                continue;
            }
            ipcMain.on(key, this.ipcEvents[key])
        }
    }
}
