function Header() {
    return (
        <div className="header">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>React App Running</span>
          </div>
          <div className="api-config">
            <select className="api-select">
              <option value="">Select API</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Genimi">Genimi</option>
            </select>
            <input type="password" className="api-input" placeholder="LLM API Key" />
            <button className="api-save-btn" onClick={(event)=>{
               
            }}>Save</button>
          </div>
        </div>
    )
}

export default Header;