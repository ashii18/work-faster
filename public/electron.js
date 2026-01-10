const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "WorkFaster",
    width: 400,
    height: 400,
    frame: false, // frameless window (Windows-safe)
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Hide default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load React build
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));

  // Open DevTools for debugging (remove later)
  // mainWindow.webContents.openDevTools();

  // Close app from renderer
  ipcMain.on("close-app", () => {
    app.quit();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
