interface HeaderProps {
  onApiConfigSaved?: (config: { llmType: string; apiKey: string }) => void;
}

function Header({ onApiConfigSaved }: HeaderProps) {
    const handleSave = () => {
      const select = document.querySelector('.api-select') as HTMLSelectElement;
      const input = document.querySelector('.api-input') as HTMLInputElement;
      
      if (!select.value || !input.value) {
        alert('LLM과 API Key를 모두 입력해주세요');
        return;
      }
      
      // localStorage에 저장
      localStorage.setItem('llmType', select.value);
      localStorage.setItem('apiKey', input.value);
      
      // 콜백 호출
      onApiConfigSaved?.({ llmType: select.value, apiKey: input.value });
      alert('저장되었습니다');
    };

    return (
        <div className="header">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>React App Running</span>
          </div>
          <div className="api-config">
            <select className="api-select" defaultValue={localStorage.getItem('llmType') || ''}>
              <option value="">Select API</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Gemini">Gemini</option>
            </select>
            <input type="password" className="api-input" placeholder="LLM API Key" defaultValue={localStorage.getItem('apiKey') || ''} />
            <button className="api-save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
    )
}

export default Header;