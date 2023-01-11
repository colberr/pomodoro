const { app, ipcMain } = require("electron");
const { menubar } = require("menubar");
const path = require("path");
const fs = require("fs");

const mb = menubar({
	browserWindow: {
		width: 375,
		height: 250,
		alwaysOnTop: true,
		
		titleBarStyle: "hidden",
		titleBarOverlay: true,

		resizable: false,
		minimizable: false,

		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
	},
	windowPosition: "center",
});

mb.on("ready", () => {
	console.log("Menubar app is ready.");
	
	mb.showWindow();
	mb.window.openDevTools();
});

ipcMain.handle("get_config", (event, obj) => {
	let config = JSON.parse(fs.readFileSync("config.json"));
	return config;
});