import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import glob from 'fast-glob';

/**
 * 프로젝트 구조 분석
 */
export async function analyzeProjectStructure(projectRoot: string): Promise<Record<string, unknown>> {
  try {
    const structure: Record<string, unknown> = {
      projectRoot,
      hasPackageJson: false,
      hasGit: false,
      packageName: undefined,
      scriptCount: 0,
      srcFiles: [],
      frameworks: [] as string[],
      dependencies: {} as Record<string, unknown>
    };

    // package.json 확인
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      structure.hasPackageJson = true;
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        structure.packageName = packageJson.name;
        structure.scriptCount = Object.keys(packageJson.scripts || {}).length;
        structure.dependencies = packageJson.dependencies || {};

        // 사용된 프레임워크 감지
        const deps = packageJson.dependencies || {};
        if (deps.react) structure.frameworks?.push('React');
        if (deps.next) structure.frameworks?.push('Next.js');
        if (deps.electron) structure.frameworks?.push('Electron');
        if (deps.vue) structure.frameworks?.push('Vue');
        if (deps.angular) structure.frameworks?.push('Angular');
        if (deps.express) structure.frameworks?.push('Express');
      } catch (e) {
        // package.json 파싱 실패
      }
    }

    // .git 확인
    const gitPath = join(projectRoot, '.git');
    structure.hasGit = existsSync(gitPath);

    // 소스 파일 목록
    const srcPatterns = ['src/**/*.{ts,tsx,js,jsx}', 'app/**/*.{ts,tsx,js,jsx}'];
    for (const pattern of srcPatterns) {
      const files = await glob(pattern, {
        cwd: projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
      });
      if (files.length > 0) {
        structure.srcFiles = files.slice(0, 20); // 최대 20개
        break;
      }
    }

    return structure;
  } catch (error) {
    throw new Error(`프로젝트 분석 실패: ${error}`);
  }
}

/**
 * 특정 종류의 파일 찾기
 */
export async function findFiles(fileType: string, projectRoot: string): Promise<string[]> {
  try {
    const patterns: Record<string, string> = {
      'typescript': 'src/**/*.{ts,tsx}',
      'javascript': 'src/**/*.{js,jsx}',
      'config': '*.{json,yml,yaml,toml}',
      'styles': 'src/**/*.{css,scss,sass}',
      'tests': 'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'components': 'src/**/*{component,Component}.{ts,tsx,js,jsx}'
    };

    const pattern = patterns[fileType.toLowerCase()] || fileType;
    const files = await glob(pattern, {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    return files.slice(0, 30); // 최대 30개
  } catch (error) {
    throw new Error(`파일 검색 실패: ${error}`);
  }
}

/**
 * 의존성 분석
 */
export async function analyzeDependencies(projectRoot: string): Promise<Record<string, unknown>> {
  try {
    const packageJsonPath = join(projectRoot, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new Error('package.json을 찾을 수 없습니다.');
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    return {
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      dependencyCount: Object.keys(packageJson.dependencies || {}).length,
      devDependencyCount: Object.keys(packageJson.devDependencies || {}).length,
      nodeVersion: packageJson.engines?.node || 'not specified'
    };
  } catch (error) {
    throw new Error(`의존성 분석 실패: ${error}`);
  }
}

/**
 * 특정 파일 패턴의 파일들 내용 요약
 */
export async function summarizeCode(
  filePattern: string,
  projectRoot: string
): Promise<Record<string, unknown>> {
  try {
    const files = await glob(filePattern, {
      cwd: projectRoot,
      ignore: ['**/node_modules/**']
    });

    const summary: Record<string, unknown> = {
      fileCount: files.length,
      totalLines: 0,
      files: []
    };

    let totalLines = 0;
    const fileDetails: Array<Record<string, unknown>> = [];

    for (const file of files.slice(0, 10)) {
      try {
        const content = readFileSync(join(projectRoot, file), 'utf-8');
        const lineCount = content.split('\n').length;
        totalLines += lineCount;
        
        fileDetails.push({
          path: file,
          lines: lineCount,
          exports: (content.match(/export\s+(const|function|class|interface|type)/g) || []).length,
          imports: (content.match(/^import\s+.*from/gm) || []).length
        });
      } catch (e) {
        // 파일 읽기 실패
      }
    }

    summary.totalLines = totalLines;
    summary.files = fileDetails;

    return summary;
  } catch (error) {
    throw new Error(`코드 요약 실패: ${error}`);
  }
}
