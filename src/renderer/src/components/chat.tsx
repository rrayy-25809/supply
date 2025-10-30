import "./components.scss";

type ChatProps = {
    type: string;
    text: string;
}

function Chat({ type, text }: ChatProps) {
    return (
    <div className={"message " + type}>
        {text}
    </div>
    )
}

export default Chat;