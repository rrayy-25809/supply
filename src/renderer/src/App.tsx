import React, { useState } from 'react'
import Sidebar from './components/sidebar'
import Panel from './components/panel'
import Header from './components/header'
import Chat from './components/chat'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

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
            <div className="messages" style={{ height: '85%', overflowY: 'auto' }}>
              <Chat type="agent" text="👋 안녕하세요! Supply AI 에이전트입니다. 프로젝트 파일을 수정하거나 개발을 도와드릴 수 있습니다." />
              <Chat type="user" text="App.jsx에 버튼 컴포넌트 추가해줘" />
              <Chat type="agent" text="네, App.jsx에 버튼 컴포넌트를 추가했습니다. 라이브 프리뷰에서 확인해보세요!" />
            </div>
            <div className="chat-input-area" style={{ marginTop: 'auto' }}>
              <textarea className="chat-input" placeholder="AI 에이전트에게 요청하세요..." rows={3} onKeyDown={() => {
                // send 함수 만들기
              }}></textarea>
              <button className="send-btn" onClick={() => {

              }}>Send</button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

export default App
