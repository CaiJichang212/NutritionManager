import { v4 as uuidv4 } from 'uuid';

export class TestReporter {
  constructor() {
    this.results = {
      frontend: [],
      backend: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        startTime: null,
        endTime: null,
        duration: 0
      }
    };
  }

  startTest() {
    this.results.summary.startTime = new Date();
  }

  endTest() {
    this.results.summary.endTime = new Date();
    this.results.summary.duration = this.results.summary.endTime - this.results.summary.startTime;
  }

  addResult(category, testCase) {
    const result = {
      id: testCase.id,
      name: testCase.name,
      description: testCase.description,
      priority: testCase.priority,
      status: testCase.status,
      duration: testCase.duration || 0,
      error: testCase.error || null,
      screenshot: testCase.screenshot || null,
      assertions: testCase.assertions || [],
      timestamp: new Date().toISOString()
    };

    this.results[category].push(result);
    this.results.summary.total++;
    
    if (result.status === 'passed') {
      this.results.summary.passed++;
    } else if (result.status === 'failed') {
      this.results.summary.failed++;
    } else if (result.status === 'skipped') {
      this.results.summary.skipped++;
    }
  }

  generateReport() {
    const report = {
      ...this.results,
      summary: {
        ...this.results.summary,
        passRate: this.results.summary.total > 0 
          ? ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(2) + '%'
          : '0%'
      }
    };
    return report;
  }

  generateMarkdownReport() {
    const report = this.generateReport();
    let md = `# 自动化测试报告\n\n`;
    md += `## 测试概览\n\n`;
    md += `| 指标 | 值 |\n`;
    md += `|------|----|\n`;
    md += `| 测试开始时间 | ${report.summary.startTime?.toLocaleString('zh-CN') || '-'} |\n`;
    md += `| 测试结束时间 | ${report.summary.endTime?.toLocaleString('zh-CN') || '-'} |\n`;
    md += `| 总耗时 | ${(report.summary.duration / 1000).toFixed(2)}秒 |\n`;
    md += `| 总测试数 | ${report.summary.total} |\n`;
    md += `| 通过数 | ${report.summary.passed} |\n`;
    md += `| 失败数 | ${report.summary.failed} |\n`;
    md += `| 跳过数 | ${report.summary.skipped} |\n`;
    md += `| 通过率 | ${report.summary.passRate} |\n\n`;

    md += `## 前端测试结果\n\n`;
    if (report.frontend.length === 0) {
      md += `*无前端测试结果*\n\n`;
    } else {
      md += `| ID | 测试名称 | 状态 | 耗时 | 错误信息 |\n`;
      md += `|----|---------|------|------|----------|\n`;
      report.frontend.forEach(r => {
        const statusEmoji = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
        md += `| ${r.id} | ${r.name} | ${statusEmoji} ${r.status} | ${r.duration}ms | ${r.error || '-'} |\n`;
      });
      md += `\n`;
    }

    md += `## 后端API测试结果\n\n`;
    if (report.backend.length === 0) {
      md += `*无后端测试结果*\n\n`;
    } else {
      md += `| ID | 测试名称 | 状态 | 耗时 | 错误信息 |\n`;
      md += `|----|---------|------|------|----------|\n`;
      report.backend.forEach(r => {
        const statusEmoji = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
        md += `| ${r.id} | ${r.name} | ${statusEmoji} ${r.status} | ${r.duration}ms | ${r.error || '-'} |\n`;
      });
      md += `\n`;
    }

    md += `## 详细测试结果\n\n`;
    
    const allResults = [...report.frontend, ...report.backend];
    allResults.forEach(r => {
      md += `### ${r.id}: ${r.name}\n\n`;
      md += `- **描述**: ${r.description}\n`;
      md += `- **优先级**: ${r.priority}\n`;
      md += `- **状态**: ${r.status}\n`;
      md += `- **耗时**: ${r.duration}ms\n`;
      if (r.assertions && r.assertions.length > 0) {
        md += `- **断言详情**:\n`;
        r.assertions.forEach(a => {
          md += `  - ${a.passed ? '✅' : '❌'} ${a.name}: ${a.message || ''}\n`;
        });
      }
      if (r.error) {
        md += `- **错误信息**: \n\`\`\`\n${r.error}\n\`\`\`\n`;
      }
      if (r.screenshot) {
        md += `- **截图**: ${r.screenshot}\n`;
      }
      md += `\n`;
    });

    return md;
  }
}

export class AssertionHelper {
  static assertEqual(actual, expected, message = '') {
    const passed = actual === expected;
    return {
      passed,
      name: 'assertEqual',
      message: message || (passed ? `值相等: ${actual}` : `期望 ${expected}, 实际 ${actual}`)
    };
  }

  static assertContains(text, substring, message = '') {
    const passed = text?.includes(substring);
    return {
      passed,
      name: 'assertContains',
      message: message || (passed ? `文本包含 "${substring}"` : `文本不包含 "${substring}"`)
    };
  }

  static assertTrue(condition, message = '') {
    return {
      passed: condition,
      name: 'assertTrue',
      message: message || (condition ? '条件为真' : '条件为假')
    };
  }

  static assertExists(value, message = '') {
    const passed = value !== null && value !== undefined;
    return {
      passed,
      name: 'assertExists',
      message: message || (passed ? '值存在' : '值不存在')
    };
  }

  static assertStatusCode(actual, expected, message = '') {
    const passed = actual === expected;
    return {
      passed,
      name: 'assertStatusCode',
      message: message || (passed ? `状态码正确: ${actual}` : `期望状态码 ${expected}, 实际 ${actual}`)
    };
  }

  static assertType(value, expectedType, message = '') {
    const actualType = typeof value;
    const passed = actualType === expectedType;
    return {
      passed,
      name: 'assertType',
      message: message || (passed ? `类型正确: ${actualType}` : `期望类型 ${expectedType}, 实际 ${actualType}`)
    };
  }

  static assertGreaterThan(actual, expected, message = '') {
    const passed = actual > expected;
    return {
      passed,
      name: 'assertGreaterThan',
      message: message || (passed ? `${actual} > ${expected}` : `${actual} 不大于 ${expected}`)
    };
  }

  static assertLessThan(actual, expected, message = '') {
    const passed = actual < expected;
    return {
      passed,
      name: 'assertLessThan',
      message: message || (passed ? `${actual} < ${expected}` : `${actual} 不小于 ${expected}`)
    };
  }
}

export class PerformanceHelper {
  constructor(page) {
    this.page = page;
    this.metrics = {};
  }

  async measurePageLoad(pageName) {
    const startTime = Date.now();
    const metrics = await this.page.metrics();
    const timing = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] || {};
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart,
        totalLoad: perf.loadEventEnd - perf.fetchStart
      };
    });
    
    this.metrics[pageName] = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      ...metrics,
      timing
    };
    
    return this.metrics[pageName];
  }

  async measureResourceSize() {
    const resources = await this.page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize || r.encodedBodySize || 0,
        type: r.initiatorType
      }));
    });
    
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    return {
      resources,
      totalSize,
      resourceCount: resources.length
    };
  }

  getMetrics() {
    return this.metrics;
  }
}

export function generateTestId() {
  return uuidv4();
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
}

export function randomPhone() {
  return `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}
