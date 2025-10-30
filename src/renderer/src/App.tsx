import React, { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import Panel from './components/panel'
import Header from './components/header'
import Chat from './components/chat'

function App(): React.JSX.Element {
  const [messages, setMessages] = useState<Array<{ type: string; text: string }>>([
    { type: "agent", text: "👋 안녕하세요! Supply AI 에이전트입니다. 프로젝트 파일을 수정하거나 개발을 도와드릴 수 있습니다. API Key를 설정한 후, 폴더를 열어 시작하세요" }
  ]);

  const send = (text:string): void => {
    window.electron.ipcRenderer.send('send', text);
    setMessages(prev => [...prev, { type: "user", text }]);
  }

  useEffect(() => {
    const handleReply = (_, text:string) => {
      setMessages(prev => [...prev, { type: "agent", text }]);
    };
    
    window.electron.ipcRenderer.on('reply', handleReply);
    
    // cleanup 함수로 리스너 제거
    return () => {
      window.electron.ipcRenderer.removeAllListeners('reply');
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className='workspace'>
          <Panel title='Live Preview' style={{ width: '70%' }}>
            <iframe style={{ border: "None", width: "100%"}}></iframe>
          </Panel>
          <Panel title='Chat' style={{ width: '30%' }}>
            <div className="messages">
              {messages.map((message, index) => (
                <Chat key={index} type={message.type} text={message.text} />
              ))}
            </div>
            <div className="chat-input-area" style={{ marginTop: 'auto' }}>
              <textarea className="chat-input" placeholder="AI 에이전트에게 요청하세요..." rows={3} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}></textarea>
              <button className="send-btn" onClick={() => {
                const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
                send(textarea.value);
                textarea.value = '';
              }}>Send</button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default App
