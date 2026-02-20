import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFolderDialog: async () => {
    const folderPath = await ipcRenderer.invoke('dialog:openFolder');
    return folderPath;
  },
  
  // AI 에이전트 관련 API
  executeAgent: (llmType: string, apiKey: string, message: string, projectFolder: string) => {
    ipcRenderer.send('agent:execute', { llmType, apiKey, message, projectFolder });
  },
  
  generateSimpleResponse: (llmType: string, apiKey: string, message: string) => {
    ipcRenderer.send('agent:simple', { llmType, apiKey, message });
  },
  
  onAgentResponse: (callback: (data: Record<string, unknown>) => void) => {
    ipcRenderer.on('agent:response', (event, data) => callback(data));
  },
  
  onAgentProgress: (callback: (data: Record<string, unknown>) => void) => {
    ipcRenderer.on('agent:progress', (event, data) => callback(data));
  },
  
  removeAgentResponseListener: () => {
    ipcRenderer.removeAllListeners('agent:response');
  },
  
  removeAgentProgressListener: () => {
    ipcRenderer.removeAllListeners('agent:progress');
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
