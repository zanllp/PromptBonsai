import { contextBridge, ipcRenderer } from 'electron'

const api = {
  fileNew: () => ipcRenderer.invoke('file:new'),
  fileOpen: () => ipcRenderer.invoke('file:open'),
  fileSave: (filePath: string, data: string) =>
    ipcRenderer.invoke('file:save', filePath, data),
  fileSaveAs: (data: string) => ipcRenderer.invoke('file:save-as', data),
  fileOpenPath: (filePath: string) => ipcRenderer.invoke('file:open-path', filePath),
  getAppPath: () => ipcRenderer.invoke('app:get-path'),
  getExamplePath: () => ipcRenderer.invoke('app:get-example-path'),
  aiGenerate: (promptText: string, parentPromptText: string | undefined, baseUrl: string, apiKey: string, model: string, locale: string) =>
    ipcRenderer.invoke('ai:generate', promptText, parentPromptText, baseUrl, apiKey, model, locale),
  onCloseRequested: (callback: () => void) => {
    ipcRenderer.on('app:before-close', callback)
  },
  openDevTools: () => ipcRenderer.send('open-devtools')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.api = api
}
