

async function setAgent(LLM_type:string) {
    if (LLM_type === "ChatGPT") {
        const { llm } = await import("./LLMs/ChatGPT");
        return llm;
    } else if (LLM_type === "Gemini") {
        const { llm } = await import("./LLMs/Gemini");
        return llm;
    } else {
        throw new Error("LLM을 고르지 않은 것 같습니다.");
    }
}