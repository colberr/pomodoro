const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipcRender", {
	invoke: (channel, args) => {
		return ipcRenderer.invoke(channel, args);
	}
});