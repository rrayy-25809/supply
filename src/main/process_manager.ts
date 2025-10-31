import { spawn } from "child_process";
import { IpcMainEvent } from 'electron';

function findPort(data: string): string | null {
    const localhostIndex = data.indexOf('http://localhost:');
    if (localhostIndex !== -1) {
        // http://localhost: 이후부터 추출
        const afterLocalhost = data.substring(localhostIndex);
        
        // 포트 번호 추출 (숫자만)
        let portStr = '';
        for (let i = 'http://localhost:'.length+3; i < afterLocalhost.length; i++) {
            const char = afterLocalhost[i];
            if (char >= '0' && char <= '9') {
                portStr += char;
            } else if (portStr.length >= 4 && (char < '0' || char > '9')) {
                // 숫자가 끝남
                break;
            }
        }

        return portStr
    } else {
        return null;
    }
}

function setfolder(folder: string, event: IpcMainEvent) {
    const current = spawn('npm', ['run', 'dev'], {
        cwd : folder,
        shell: true    // Windows에서 npm 실행을 위해 필요
    });

    current.stdout?.on('data', (data) => {
        const strData = data.toString();

        if (strData.includes("http://localhost:")) {
            const url = "http://localhost:"+findPort(strData);
            event.sender.send('get_url', url);
        }
        console.log(`stdout: ${strData}`);
    });

    return current;
}

export { setfolder }