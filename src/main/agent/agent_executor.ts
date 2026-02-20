import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { StructuredTool } from "@langchain/core/tools";
import { BaseMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { 
  readFile, 
  writeFile, 
  listFiles, 
  analyzeCode, 
  deleteFile, 
  renameFile 
} from "../tools/file_tools";
import {
  analyzeProjectStructure,
  findFiles,
  analyzeDependencies,
  summarizeCode
} from "../tools/project_tools";
import { IpcMainEvent } from "electron";
import { z } from "zod";

/**
 * 에이전트 도구 정의 (간단한 버전)
 */
function createTools(projectRoot: string): StructuredTool[] {
  return [
    new StructuredTool({
      name: "read_file",
      description: "파일을 읽습니다",
      schema: z.object({
        path: z.string().describe("파일 경로")
      }),
      func: async (input: { path: string }) => {
        return await readFile(input.path, projectRoot);
      }
    }),
    new StructuredTool({
      name: "write_file",
      description: "파일을 쓰습니다",
      schema: z.object({
        path: z.string().describe("파일 경로"),
        content: z.string().describe("파일 내용")
      }),
      func: async (input: { path: string; content: string }) => {
        return await writeFile(input.path, input.content, projectRoot);
      }
    }),
    new StructuredTool({
      name: "search_files",
      description: "파일을 glob 패턴으로 검색합니다 (예: src/**/*.tsx, **/*.json)",
      schema: z.object({
        pattern: z.string().describe("glob 패턴 (예: src/**/*.tsx)")
      }),
      func: async (input: { pattern: string }) => {
        const files = await listFiles(input.pattern, projectRoot);
        return JSON.stringify(files.slice(0, 20));
      }
    }),
    new StructuredTool({
      name: "find_by_name",
      description: "파일 이름으로 검색합니다 (예: App.tsx, config.json)",
      schema: z.object({
        filename: z.string().describe("찾을 파일 이름 (정확한 이름 또는 일부)")
      }),
      func: async (input: { filename: string }) => {
        // 확장자 없이 검색하려면 여러 패턴 시도
        const patterns = [
          `**/${input.filename}`,
          `**/${input.filename}.*`,
          `**/(*/)${input.filename}*`
        ];
        
        let results: string[] = [];
        for (const pattern of patterns) {
          try {
            const files = await listFiles(pattern, projectRoot);
            results = [...results, ...files];
          } catch (e) {
            // 패턴이 실패해도 계속
          }
        }
        
        // 중복 제거
        const unique = Array.from(new Set(results));
        return JSON.stringify(unique.slice(0, 20));
      }
    }),
    new StructuredTool({
      name: "find_typescript",
      description: "모든 TypeScript/TSX 파일을 찾습니다",
      schema: z.object({}),
      func: async () => {
        const files = await findFiles('typescript', projectRoot);
        return JSON.stringify(files);
      }
    }),
    new StructuredTool({
      name: "analyze_file",
      description: "파일을 분석합니다 (라인 수, 함수 수 등)",
      schema: z.object({
        path: z.string().describe("분석할 파일 경로")
      }),
      func: async (input: { path: string }) => {
        const result = await analyzeCode(input.path, projectRoot);
        return JSON.stringify(result);
      }
    })
  ];
}

/**
 * LangChain 에이전트 실행 (ReAct 패턴)
 */
export async function runAgent(
  llmType: string,
  apiKey: string,
  userMessage: string,
  projectRoot: string,
  event: IpcMainEvent
): Promise<void> {
  try {
    // LLM 초기화
    let llm: BaseLanguageModel;
    
    if (llmType === "ChatGPT") {
      llm = new ChatOpenAI({
        modelName: "gpt-4-turbo",
        temperature: 0.7,
        apiKey: apiKey
      });
    } else if (llmType === "Gemini") {
      llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-pro",
        temperature: 0.7,
        apiKey: apiKey
      });
    } else {
      throw new Error("지원하지 않는 LLM입니다.");
    }

    // 프로젝트 폴더 정보 포함한 시스템 메시지
    const systemMessage = `당신은 개발자의 파일 수정을 도와주는 AI 어시스턴트입니다.
프로젝트 경로: ${projectRoot}

다음 작업을 수행할 수 있습니다:

1. 파일 조회:
   - [TOOL:read_file|경로/파일명] - 파일 내용 읽기
   - [TOOL:analyze_file|경로/파일명] - 파일 분석 (라인 수, 함수 수 등)

2. 파일 검색:
   - [TOOL:find_by_name|파일이름] - 파일 이름으로 검색
   - [TOOL:search_files|src/**/*.tsx] - glob 패턴으로 검색
   - [TOOL:find_typescript|] - 모든 TypeScript 파일 찾기

3. 파일 수정:
   - [TOOL:write_file|경로/파일명|새 내용] - 파일 쓰기/수정

사용 예시:
- 사용자: "App.tsx라는 파일을 찾아줄 수 있나?"
- 당신: [TOOL:find_by_name|App.tsx] 파일을 찾아드리겠습니다...
- 사용자: "component 폴더의 모든 tsx 파일 목록을 보여줘"
- 당신: [TOOL:search_files|component/**/*.tsx] component 폴더를 검색하겠습니다...

도구를 사용한 후 결과를 설명하는 자연스러운 응답을 제공해주세요.`;

    const messages: BaseMessage[] = [
      new HumanMessage(systemMessage),
      new HumanMessage(userMessage)
    ];

    // LLM 호출
    const response = await llm.invoke(messages);
    const responseText = typeof response === 'object' && 'content' in response 
      ? (response as any).content 
      : String(response);

    console.log('LLM Response:', responseText);

    // 응답에서 도구 호출 찾기
    const toolCalls = extractToolCalls(responseText);
    
    if (toolCalls.length === 0) {
      // 도구 호출이 없으면 바로 응답
      event.sender.send('agent:response', {
        status: 'success',
        message: responseText
      });
      return;
    }

    // 도구 실행
    let finalResponse = responseText;
    for (const toolCall of toolCalls) {
      try {
        event.sender.send('agent:progress', {
          status: 'tool_use',
          message: `도구 사용: ${toolCall.name}`
        });

        let result: string;
        switch (toolCall.name) {
          case 'read_file':
            result = await readFile(toolCall.args[0], projectRoot);
            finalResponse = finalResponse.replace(toolCall.raw, `\n문件 내용:\n${result}`);
            break;
          case 'write_file':
            result = await writeFile(toolCall.args[0], toolCall.args[1], projectRoot);
            finalResponse = finalResponse.replace(toolCall.raw, `\n✅ ${result}`);
            break;
          case 'search_files':
            const files = await listFiles(toolCall.args[0], projectRoot);
            result = JSON.stringify(files.slice(0, 20));
            finalResponse = finalResponse.replace(toolCall.raw, `\n검색 결과:\n${result}`);
            break;
          default:
            result = '알 수 없는 도구';
        }

        event.sender.send('agent:progress', {
          status: 'tool_result',
          message: `완료: ${toolCall.name}`
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Tool error:`, errorMsg);
        finalResponse = finalResponse.replace(toolCall.raw, `\n❌ 에러: ${errorMsg}`);
      }
    }

    event.sender.send('agent:response', {
      status: 'success',
      message: cleanupResponse(finalResponse)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Agent error:', errorMessage);
    event.sender.send('agent:response', {
      status: 'error',
      message: `에러 발생: ${errorMessage}`
    });
  }
}

/**
 * 응답에서 도구 호출 추출
 */
function extractToolCalls(response: string): Array<{ name: string; args: string[]; raw: string }> {
  const toolPattern = /\[TOOL:(\w+)\|([^\]]+)\]/g;
  const calls: Array<{ name: string; args: string[]; raw: string }> = [];
  
  let match;
  while ((match = toolPattern.exec(response)) !== null) {
    const name = match[1];
    const argsStr = match[2];
    const args = argsStr.split('|');
    calls.push({
      name,
      args,
      raw: match[0]
    });
  }
  
  return calls;
}

/**
 * 응답 정리 (도구 호출 제거)
 */
function cleanupResponse(text: string): string {
  return text.replace(/\[TOOL:\w+\|[^\]]+\]/g, '').trim();
}

/**
 * 간단한 AI 응답 생성 (도구 없이)
 */
export async function generateSimpleResponse(
  llmType: string,
  apiKey: string,
  userMessage: string,
  event: IpcMainEvent
): Promise<void> {
  try {
    let llm: BaseLanguageModel;
    
    if (llmType === "ChatGPT") {
      llm = new ChatOpenAI({
        modelName: "gpt-4-turbo",
        temperature: 0.7,
        apiKey: apiKey
      });
    } else if (llmType === "Gemini") {
      llm = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-pro",
        temperature: 0.7,
        apiKey: apiKey
      });
    } else {
      throw new Error("지원하지 않는 LLM입니다.");
    }

    const response = await llm.invoke([new HumanMessage(userMessage)]);
    
    event.sender.send('agent:response', {
      status: 'success',
      message: typeof response === 'object' && 'content' in response ? (response as any).content : String(response)
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    event.sender.send('agent:response', {
      status: 'error',
      message: `에러 발생: ${errorMessage}`
    });
  }
}

