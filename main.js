const { app, ipcMain, Menu } = require("electron");
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
		trafficLightPosition: {x: 10, y: 10},

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

ipcMain.handle("get_config", () => {
	let config = JSON.parse(fs.readFileSync("config.json"));
	return config;
});

ipcMain.handle("show_menu", () => {
	const template = [
		{
			label: "Menu Item 1",
			click: () => { console.log("hello") }
		},
		{type: "separator"},
		{ 
			label: "Menu Item 2",
			type: "checkbox",
			checked: true
		}
	];
	const menu = Menu.buildFromTemplate(template);

	menu.popup({window: mb.window, x: 375 - 34, y: 40});
})