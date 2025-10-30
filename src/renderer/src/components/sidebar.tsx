import "./components.scss";

function Sidebar() {
    const openFolder = async () => {
        const folderPath = await window.api.openFolderDialog();
        if (folderPath) {
            window.electron.ipcRenderer.send('set_project_folder', folderPath);
        } else {
            alert('폴더 선택이 취소되었습니다.');
        }
    }

    return (
        <div className="sidebar">
            <div className="logo">
                <span>⚡</span>
                <span>Supply</span>
            </div>
            
            <div className="folder-section">
                <div className="section-title">Project Folder</div>
                <button className="folder-btn" onClick={async () => await openFolder()}>
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