import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { runFrontendTests } from './frontend-tests.js';
import { runBackendTests } from './backend-tests.js';
import { config } from './config.js';

const args = process.argv.slice(2);
const runFrontend = args.includes('--frontend') || args.length === 0;
const runBackend = args.includes('--api') || args.length === 0;

function printBanner() {
  console.log(chalk.green.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║       营养健康管家 - 自动化测试套件                        ║'));
  console.log(chalk.green.bold('║       Nutrition Health Manager - E2E Test Suite            ║'));
  console.log(chalk.green.bold('╚════════════════════════════════════════════════════════════╝\n'));
}

function printConfig() {
  console.log(chalk.blue('📋 测试配置:'));
  console.log(chalk.gray(`   前端地址: ${config.frontend.baseUrl}`));
  console.log(chalk.gray(`   后端地址: ${config.backend.baseUrl}`));
  console.log(chalk.gray(`   无头模式: ${config.frontend.headless ? '是' : '否'}`));
  console.log(chalk.gray(`   视口大小: ${config.frontend.viewport.width}x${config.frontend.viewport.height}`));
  console.log();
}

function printSummary(frontendReport, backendReport) {
  console.log(chalk.green.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.green.bold('║                      测试结果汇总                          ║'));
  console.log(chalk.green.bold('╚════════════════════════════════════════════════════════════╝\n'));
  
  if (frontendReport) {
    const summary = frontendReport.summary;
    console.log(chalk.cyan.bold('前端测试:'));
    console.log(chalk.gray(`   总计: ${summary.total}`));
    console.log(chalk.green(`   通过: ${summary.passed}`));
    console.log(chalk.red(`   失败: ${summary.failed}`));
    console.log(chalk.yellow(`   跳过: ${summary.skipped}`));
    console.log(chalk.blue(`   通过率: ${summary.passRate}`));
    console.log(chalk.gray(`   耗时: ${(summary.duration / 1000).toFixed(2)}秒`));
    console.log();
  }
  
  if (backendReport) {
    const summary = backendReport.summary;
    console.log(chalk.cyan.bold('后端API测试:'));
    console.log(chalk.gray(`   总计: ${summary.total}`));
    console.log(chalk.green(`   通过: ${summary.passed}`));
    console.log(chalk.red(`   失败: ${summary.failed}`));
    console.log(chalk.yellow(`   跳过: ${summary.skipped}`));
    console.log(chalk.blue(`   通过率: ${summary.passRate}`));
    console.log(chalk.gray(`   耗时: ${(summary.duration / 1000).toFixed(2)}秒`));
    console.log();
  }
  
  const totalTests = (frontendReport?.summary.total || 0) + (backendReport?.summary.total || 0);
  const totalPassed = (frontendReport?.summary.passed || 0) + (backendReport?.summary.passed || 0);
  const totalFailed = (frontendReport?.summary.failed || 0) + (backendReport?.summary.failed || 0);
  
  console.log(chalk.cyan.bold('总体结果:'));
  console.log(chalk.gray(`   总测试数: ${totalTests}`));
  console.log(chalk.green(`   通过: ${totalPassed}`));
  console.log(chalk.red(`   失败: ${totalFailed}`));
  console.log(chalk.blue(`   总通过率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0}%`));
  console.log();
  
  if (totalFailed === 0) {
    console.log(chalk.green.bold('✅ 所有测试通过！'));
  } else {
    console.log(chalk.red.bold(`❌ 有 ${totalFailed} 个测试失败`));
  }
}

async function main() {
  printBanner();
  printConfig();
  
  let frontendReport = null;
  let backendReport = null;
  
  const reportsDir = './reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  try {
    if (runFrontend) {
      console.log(chalk.yellow.bold('═══════════════════════════════════════════════════════════'));
      console.log(chalk.yellow.bold('                    前端测试                                '));
      console.log(chalk.yellow.bold('═══════════════════════════════════════════════════════════\n'));
      
      frontendReport = await runFrontendTests();
      
      fs.writeFileSync(
        path.join(reportsDir, 'frontend-report.json'),
        JSON.stringify(frontendReport, null, 2)
      );
    }
    
    if (runBackend) {
      console.log(chalk.yellow.bold('\n═══════════════════════════════════════════════════════════'));
      console.log(chalk.yellow.bold('                    后端API测试                             '));
      console.log(chalk.yellow.bold('═══════════════════════════════════════════════════════════\n'));
      
      backendReport = await runBackendTests();
      
      fs.writeFileSync(
        path.join(reportsDir, 'backend-report.json'),
        JSON.stringify(backendReport, null, 2)
      );
    }
    
    printSummary(frontendReport, backendReport);
    
    const combinedReport = {
      frontend: frontendReport,
      backend: backendReport,
      summary: {
        total: (frontendReport?.summary.total || 0) + (backendReport?.summary.total || 0),
        passed: (frontendReport?.summary.passed || 0) + (backendReport?.summary.passed || 0),
        failed: (frontendReport?.summary.failed || 0) + (backendReport?.summary.failed || 0),
        skipped: (frontendReport?.summary.skipped || 0) + (backendReport?.summary.skipped || 0),
        timestamp: new Date().toISOString()
      }
    };
    
    fs.writeFileSync(
      path.join(reportsDir, 'test-report.json'),
      JSON.stringify(combinedReport, null, 2)
    );
    
    const mdReport = generateMarkdownReport(frontendReport, backendReport);
    fs.writeFileSync(
      path.join(reportsDir, 'test-report.md'),
      mdReport
    );
    
    console.log(chalk.green(`\n📄 测试报告已生成:`));
    console.log(chalk.gray(`   - ${path.join(reportsDir, 'test-report.json')}`));
    console.log(chalk.gray(`   - ${path.join(reportsDir, 'test-report.md')}`));
    if (frontendReport) {
      console.log(chalk.gray(`   - ${path.join(reportsDir, 'frontend-report.json')}`));
    }
    if (backendReport) {
      console.log(chalk.gray(`   - ${path.join(reportsDir, 'backend-report.json')}`));
    }
    
    process.exit(combinedReport.summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(chalk.red.bold('\n❌ 测试执行失败:'), error);
    process.exit(1);
  }
}

function generateMarkdownReport(frontendReport, backendReport) {
  let md = `# 自动化测试报告\n\n`;
  md += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  md += `## 测试概览\n\n`;
  
  const totalTests = (frontendReport?.summary.total || 0) + (backendReport?.summary.total || 0);
  const totalPassed = (frontendReport?.summary.passed || 0) + (backendReport?.summary.passed || 0);
  const totalFailed = (frontendReport?.summary.failed || 0) + (backendReport?.summary.failed || 0);
  const totalSkipped = (frontendReport?.summary.skipped || 0) + (backendReport?.summary.skipped || 0);
  
  md += `| 指标 | 值 |\n`;
  md += `|------|----|\n`;
  md += `| 总测试数 | ${totalTests} |\n`;
  md += `| 通过数 | ${totalPassed} |\n`;
  md += `| 失败数 | ${totalFailed} |\n`;
  md += `| 跳过数 | ${totalSkipped} |\n`;
  md += `| 通过率 | ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0}% |\n\n`;
  
  if (frontendReport) {
    md += `## 前端测试结果\n\n`;
    md += generateSectionReport(frontendReport);
  }
  
  if (backendReport) {
    md += `## 后端API测试结果\n\n`;
    md += generateSectionReport(backendReport);
  }
  
  md += `## 测试环境\n\n`;
  md += `- 前端地址: ${config.frontend.baseUrl}\n`;
  md += `- 后端地址: ${config.backend.baseUrl}\n`;
  md += `- 浏览器: Chromium (Puppeteer)\n`;
  md += `- 无头模式: ${config.frontend.headless ? '是' : '否'}\n`;
  md += `- 视口大小: ${config.frontend.viewport.width}x${config.frontend.viewport.height}\n\n`;
  
  md += `---\n`;
  md += `*报告由自动化测试系统生成*\n`;
  
  return md;
}

function generateSectionReport(report) {
  let md = ``;
  
  md += `| ID | 测试名称 | 状态 | 耗时 | 描述 |\n`;
  md += `|----|---------|------|------|------|\n`;
  
  report.frontend?.concat(report.backend || []).forEach(r => {
    const statusEmoji = r.status === 'passed' ? '✅' : r.status === 'failed' ? '❌' : '⏭️';
    md += `| ${r.id} | ${r.name} | ${statusEmoji} ${r.status} | ${r.duration}ms | ${r.description} |\n`;
  });
  
  md += `\n### 详细结果\n\n`;
  
  report.frontend?.concat(report.backend || []).forEach(r => {
    md += `#### ${r.id}: ${r.name}\n\n`;
    md += `- **状态**: ${r.status}\n`;
    md += `- **描述**: ${r.description}\n`;
    md += `- **优先级**: ${r.priority}\n`;
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
    
    md += `\n`;
  });
  
  return md;
}

main();
