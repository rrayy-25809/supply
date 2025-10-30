import "./components.scss";

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo">
                <span>⚡</span>
                <span>Supply</span>
            </div>
            
            <div className="folder-section">
                <div className="section-title">Project Folder</div>
                <button className="folder-btn">
                    <span>📁</span>
                    <span>Open Folder</span>
                </button>
            </div>

            <div className="git-section">
                <div className="section-title">Git Controls</div>
                <div className="git-controls">
                    <button className="git-btn">Commit</button>
                    <button className="git-btn">Clone</button>
                    <button className="git-btn">Push</button>
                    <button className="git-btn">Sync</button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;