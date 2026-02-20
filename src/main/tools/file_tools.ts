import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, relative, parse } from 'path';
import glob from 'fast-glob';

/**
 * 파일 읽기 도구
 */
export async function readFile(filePath: string, projectRoot: string): Promise<string> {
  try {
    const absolutePath = join(projectRoot, filePath);
    
    // 보안: 프로젝트 루트 밖의 파일 접근 방지
    const relativePath = relative(projectRoot, absolutePath);
    if (relativePath.startsWith('..')) {
      throw new Error('프로젝트 루트 밖의 파일에 접근할 수 없습니다.');
    }

    if (!existsSync(absolutePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    return readFileSync(absolutePath, 'utf-8');
  } catch (error) {
    throw new Error(`파일 읽기 실패: ${error}`);
  }
}

/**
 * 파일 쓰기 도구
 */
export async function writeFile(filePath: string, content: string, projectRoot: string): Promise<string> {
  try {
    const absolutePath = join(projectRoot, filePath);
    
    // 보안: 프로젝트 루트 밖의 파일 접근 방지
    const relativePath = relative(projectRoot, absolutePath);
    if (relativePath.startsWith('..')) {
      throw new Error('프로젝트 루트 밖의 파일에 접근할 수 없습니다.');
    }

    // 민감한 파일 보호
    const protectedFiles = ['package.json', '.env', '.git', 'node_modules'];
    const fileName = parse(filePath).base;
    if (protectedFiles.includes(fileName)) {
      throw new Error(`"${fileName}"는 수정할 수 없는 파일입니다.`);
    }

    writeFileSync(absolutePath, content, 'utf-8');
    return `파일이 성공적으로 저장되었습니다: ${filePath}`;
  } catch (error) {
    throw new Error(`파일 쓰기 실패: ${error}`);
  }
}

/**
 * 파일 목록 조회
 */
export async function listFiles(pattern: string, projectRoot: string): Promise<string[]> {
  try {
    const files = await glob(pattern, {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'out/**'],
      dot: false
    });
    return files;
  } catch (error) {
    throw new Error(`파일 목록 조회 실패: ${error}`);
  }
}

/**
 * 파일 이름 변경
 */
export async function renameFile(oldPath: string, newPath: string, projectRoot: string): Promise<string> {
  try {
    const { renameSync } = await import('fs');
    const absoluteOldPath = join(projectRoot, oldPath);
    const absoluteNewPath = join(projectRoot, newPath);
    
    // 보안 검사
    const relativeOldPath = relative(projectRoot, absoluteOldPath);
    const relativeNewPath = relative(projectRoot, absoluteNewPath);
    
    if (relativeOldPath.startsWith('..') || relativeNewPath.startsWith('..')) {
      throw new Error('프로젝트 루트 밖의 파일에 접근할 수 없습니다.');
    }

    if (!existsSync(absoluteOldPath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${oldPath}`);
    }

    renameSync(absoluteOldPath, absoluteNewPath);
    return `파일이 성공적으로 이름 변경되었습니다: ${oldPath} -> ${newPath}`;
  } catch (error) {
    throw new Error(`파일 이름 변경 실패: ${error}`);
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(filePath: string, projectRoot: string): Promise<string> {
  try {
    const { unlinkSync } = await import('fs');
    const absolutePath = join(projectRoot, filePath);
    
    // 보안 검사
    const relativePath = relative(projectRoot, absolutePath);
    if (relativePath.startsWith('..')) {
      throw new Error('프로젝트 루트 밖의 파일에 접근할 수 없습니다.');
    }

    if (!existsSync(absolutePath)) {
      throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }

    unlinkSync(absolutePath);
    return `파일이 성공적으로 삭제되었습니다: ${filePath}`;
  } catch (error) {
    throw new Error(`파일 삭제 실패: ${error}`);
  }
}

/**
 * 코드 분석 (간단한 통계)
 */
export async function analyzeCode(filePath: string, projectRoot: string): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(filePath, projectRoot);
    const lines = content.split('\n');
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('/*')).length;
    
    return {
      filePath,
      totalLines: lines.length,
      codeLines,
      hasTypeScript: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
      hasReact: content.includes('React') || content.includes('jsx'),
      hasTailwind: content.includes('tailwind') || content.includes('className='),
      complexity: content.match(/function|const|class|interface/g)?.length || 0
    };
  } catch (error) {
    throw new Error(`코드 분석 실패: ${error}`);
  }
}
