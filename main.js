const app = require("electron")
const { menubar } = require("menubar");
const is_mac = process.platform === "darwin" // Check if OS is mac

const mb = menubar({
	browserWindow: {
		width: 400,
		height: 400,
		alwaysOnTop: true,
		
		titleBarStyle: "hidden",
		titleBarOverlay: true,

		resizable: false,
		minimizable: false,
	},
	// preloadWindow: true,
	// showOnAllWorkspaces: true,
	windowPosition: "center",
	// showDockIcon: false,
});

mb.on("ready", () => {
	console.log("Menubar app is ready.");

	mb.showWindow();
});