"use strict";
import { app, protocol, BrowserWindow, Menu, globalShortcut, screen } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    frame: false,
    width: 1292,
    height: 636,
    minWidth: 483,
    icon: `${__dirname}src/assets/icons/win/icon.ico`,
    minHeight: 200,
    backgroundColor: "#151515",
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  });
  console.log(`${__dirname}\\icons\\win\\icon.ico`)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  Menu.setApplicationMenu(null);
  win.on('ready-to-show', () => {
    win.show();
    win.focus();
  });
  win.on("closed", () => {
    win = null;
  });

  globalShortcut.register('CommandOrControl+i', () => {
    win.webContents.openDevTools();
  })
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

app.on("ready", async () => {
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
