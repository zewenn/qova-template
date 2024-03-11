import ElectronWindow from "../__stdlib__/electron";

const Window = new ElectronWindow("../assets/icon.ico", "windowed", {
    width: 1600,
    height: 900,
});


Window.bind({
    "exit" : () => {
        if (!Window.browser_window) return;
        Window.browser_window.close();
    },
    "toggle-dev-tools" : () => {
        if (!Window.browser_window) return;
        if (Window.browser_window.webContents.isDevToolsOpened()) {
            Window.browser_window.webContents.closeDevTools();
            return;
        }
        Window.browser_window.webContents.openDevTools();
    }
})

Window.init()