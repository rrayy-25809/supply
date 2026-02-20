import React, { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import Panel from './components/panel'
import Header from './components/header'
import Chat from './components/chat'

function App(): React.JSX.Element {
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([
    { type: "agent", text: "👋 안녕하세요! Supply AI 에이전트입니다. 프로젝트 파일을 수정하거나 개발을 도와드릴 수 있습니다. API Key를 설정한 후, 폴더를 열어 시작하세요" }
  ]);
  const [url, setUrl] = useState<string>("./preview.html");
  const [_, setProjectFolder] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const send = (text: string): void => {
    const apiKey = localStorage.getItem('apiKey');
    const llmType = localStorage.getItem('llmType');
    // localStorage에서 직접 읽기 (상태 값이 아닌)
    const folder = localStorage.getItem('projectFolder');

    setMessages(prev => [...prev, { type: "user", text }]);

    if (!apiKey || !llmType) {
      setMessages(prev => [...prev, { type: "agent", text: "⚠️ API Key와 LLM을 먼저 설정해주세요 (상단 헤더에서 설정)" }]);
      return;
    }

    if (!folder || folder.trim() === '') {
      setMessages(prev => [...prev, { type: "agent", text: "⚠️ 프로젝트 폴더를 먼저 선택해주세요 (좌측 사이드바에서 'Open Folder' 클릭)" }]);
      return;
    }

    setIsExecuting(true);
    console.log('Executing agent with:', { llmType, projectFolder: folder });
    
    (window as any).api?.executeAgent?.(llmType, apiKey, text, folder);
  }

  useEffect(() => {
    // 저장된 프로젝트 폴더 로드
    const savedFolder = localStorage.getItem('projectFolder');
    if (savedFolder) {
      setProjectFolder(savedFolder);
    }

    // 에이전트 응답 처리
    if ((window as any).api?.onAgentResponse) {
      (window as any).api.onAgentResponse((data: Record<string, unknown>) => {
        setIsExecuting(false);
        if (data.status === 'success') {
          setMessages(prev => [...prev, { type: "agent", text: String(data.message) }]);
        } else {
          setMessages(prev => [...prev, { type: "agent", text: `❌ ${data.message}` }]);
        }
      });
    }

    // 기존 reply 핸들러
    const handleReply = (_, text: string) => {
      setMessages(prev => [...prev, { type: "agent", text }]);
    };
    
    window.electron.ipcRenderer.on('reply', handleReply);
    window.electron.ipcRenderer.on('get_url', (_, url: string) => setUrl(url));
    
    // set_project_folder 핸들러 (프로젝트 폴더 설정)
    window.electron.ipcRenderer.on('set_project_folder', (_, folder: string) => {
      setProjectFolder(folder);
      localStorage.setItem('projectFolder', folder);
    });

    // cleanup
    return () => {
      window.electron.ipcRenderer.removeAllListeners('reply');
      window.electron.ipcRenderer.removeAllListeners('get_url');
      window.electron.ipcRenderer.removeAllListeners('set_project_folder');
      (window as any).api?.removeAgentResponseListener?.();
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar onFolderSelected={(folder) => {
        setProjectFolder(folder);
      }} />
      <div className="main-content">
        <Header onApiConfigSaved={() => {}} />
        <div className='workspace'>
          <Panel title='Live Preview' style={{ width: '70%' }}>
            <iframe src={url}></iframe>
          </Panel>
          <Panel title='Chat' style={{ width: '30%' }}>
            <div className="messages">
              {messages.map((message, index) => (
                <Chat key={index} type={message.type} text={message.text} />
              ))}
            </div>
            <div className="chat-input-area">
              <textarea 
                className="chat-input" 
                placeholder="AI 에이전트에게 요청하세요..." 
                rows={3}
                disabled={isExecuting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isExecuting) {
                    e.preventDefault();
                    send(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button 
                className="send-btn"
                disabled={isExecuting}
                onClick={() => {
                  const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
                  send(textarea.value);
                  textarea.value = '';
                }}
              >
                {isExecuting ? '⏳' : 'Send'}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default App
