import type { ReactNode } from 'react';
import "./components.scss";

type PanelProps = {
    title: string;
    children: ReactNode;
    style?: React.CSSProperties;
}

function Panel({ title, children, style }: PanelProps) {
    return(
        <div className="panel" style={style}>
            <div className="panel-header">{title}</div>
            <div className="panel-content">
                {children}
            </div>
        </div>
    )
}

export default Panel;