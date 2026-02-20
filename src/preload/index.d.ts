import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderDialog: () => Promise<null | string>
      executeAgent: (llmType: string, apiKey: string, message: string, projectFolder: string) => void
      generateSimpleResponse: (llmType: string, apiKey: string, message: string) => void
      onAgentResponse: (callback: (data: Record<string, unknown>) => void) => void
      onAgentProgress: (callback: (data: Record<string, unknown>) => void) => void
      removeAgentResponseListener: () => void
      removeAgentProgressListener: () => void
    }
  }
}
