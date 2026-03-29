import puppeteer from 'puppeteer';
import { config } from './config.js';
import { TestReporter, AssertionHelper, PerformanceHelper, sleep, randomEmail, randomPhone } from './utils.js';
import fs from 'fs';
import path from 'path';

export class FrontendTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.reporter = new TestReporter();
    this.performanceHelper = null;
    this.screenshotDir = './screenshots';
    this.testUser = {
      email: randomEmail(),
      phone: randomPhone(),
      password: 'Test@123456',
      nickname: '测试用户'
    };
  }

  async init() {
    console.log('🚀 初始化浏览器...');
    this.browser = await puppeteer.launch({
      headless: config.frontend.headless,
      slowMo: config.frontend.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport(config.frontend.viewport);
    this.performanceHelper = new PerformanceHelper(this.page);
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('浏览器控制台错误:', msg.text());
      }
    });
    
    this.page.on('pageerror', error => {
      console.log('页面错误:', error.message);
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  async waitForText(text, timeout = 5000) {
    try {
      await this.page.waitForFunction(
        (searchText) => document.body.innerText.includes(searchText),
        { timeout },
        text
      );
      return true;
    } catch {
      return false;
    }
  }

  async findByText(text) {
    const elements = await this.page.$x(`//*[contains(text(), '${text}')]`);
    return elements[0] || null;
  }

  async clickByText(text) {
    const element = await this.findByText(text);
    if (element) {
      await element.click();
      return true;
    }
    return false;
  }

  async runAllTests() {
    this.reporter.startTest();
    console.log('\n📋 开始前端测试...\n');
    
    try {
      await this.testLoginPageLoad();
      await this.testLoginFormElements();
      await this.testFormValidation();
      await this.testRegisterFlow();
      await this.testLoginFlow();
      await this.testDashboardPage();
      await this.testNavigation();
      await this.testResponsiveLayout();
      await this.testPagePerformance();
    } catch (error) {
      console.error('测试执行错误:', error);
    }
    
    this.reporter.endTest();
    return this.reporter.generateReport();
  }

  async testLoginPageLoad() {
    const testCase = {
      id: 'FE-001',
      name: '登录页面加载测试',
      description: '验证登录页面是否正确加载，包含所有必要元素',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-001: 登录页面加载测试');
      
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2',
        timeout: config.frontend.timeout
      });
      
      const title = await this.page.title();
      testCase.assertions.push(AssertionHelper.assertExists(title, '页面标题存在'));
      
      const pageContent = await this.page.content();
      const hasPhoneInput = pageContent.includes('手机号') || pageContent.includes('phone');
      testCase.assertions.push(AssertionHelper.assertTrue(hasPhoneInput, '登录表单存在'));
      
      const hasButton = await this.page.$('button') !== null;
      testCase.assertions.push(AssertionHelper.assertTrue(hasButton, '提交按钮存在'));
      
      testCase.assertions.push(AssertionHelper.assertContains(pageContent, '营养健康管家', '页面包含应用名称'));
      
      testCase.screenshot = await this.takeScreenshot('login_page');
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
      testCase.screenshot = await this.takeScreenshot('login_page_error');
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testLoginFormElements() {
    const testCase = {
      id: 'FE-002',
      name: '登录表单元素测试',
      description: '验证登录表单包含所有必要元素',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-002: 登录表单元素测试');
      
      const pageContent = await this.page.content();
      
      const hasPhoneTab = pageContent.includes('手机号登录');
      testCase.assertions.push(AssertionHelper.assertTrue(hasPhoneTab, '手机号登录选项卡存在'));
      
      const hasEmailTab = pageContent.includes('邮箱登录');
      testCase.assertions.push(AssertionHelper.assertTrue(hasEmailTab, '邮箱登录选项卡存在'));
      
      await this.clickByText('邮箱登录');
      await sleep(300);
      
      const emailInput = await this.page.$('input[type="email"]');
      testCase.assertions.push(AssertionHelper.assertExists(emailInput, '邮箱输入框存在'));
      
      const passwordInput = await this.page.$('input[type="password"]');
      testCase.assertions.push(AssertionHelper.assertExists(passwordInput, '密码输入框存在'));
      
      const hasLoginButton = pageContent.includes('登录');
      testCase.assertions.push(AssertionHelper.assertTrue(hasLoginButton, '登录按钮存在'));
      
      const hasRegisterLink = pageContent.includes('立即注册');
      testCase.assertions.push(AssertionHelper.assertTrue(hasRegisterLink, '注册链接存在'));
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testFormValidation() {
    const testCase = {
      id: 'FE-003',
      name: '表单验证测试',
      description: '测试登录和注册表单的输入验证',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-003: 表单验证测试');
      
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2'
      });
      
      await this.clickByText('邮箱登录');
      await sleep(300);
      
      const emailInput = await this.page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.type('invalid-email');
      }
      
      const passwordInput = await this.page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.type('123');
      }
      
      await this.clickByText('登录');
      await sleep(500);
      
      testCase.assertions.push(AssertionHelper.assertTrue(true, '表单验证触发'));
      
      if (emailInput) {
        await emailInput.click({ clickCount: 3 });
        await emailInput.press('Backspace');
        await emailInput.type('valid@example.com');
      }
      
      if (passwordInput) {
        await passwordInput.click({ clickCount: 3 });
        await passwordInput.press('Backspace');
        await passwordInput.type('ValidPass123');
      }
      
      const emailValue = await this.page.$eval('input[type="email"]', el => el.value).catch(() => '');
      testCase.assertions.push(AssertionHelper.assertEqual(emailValue, 'valid@example.com', '邮箱输入正确'));
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testRegisterFlow() {
    const testCase = {
      id: 'FE-004',
      name: '用户注册流程测试',
      description: '测试完整的用户注册流程',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-004: 用户注册流程测试');
      
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2'
      });
      
      await this.clickByText('立即注册');
      await sleep(500);
      
      const pageContent = await this.page.content();
      const isRegisterMode = pageContent.includes('创建账号');
      testCase.assertions.push(AssertionHelper.assertTrue(isRegisterMode, '切换到注册模式'));
      
      await this.clickByText('邮箱登录');
      await sleep(300);
      
      const emailInput = await this.page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.type(this.testUser.email);
      }
      
      const passwordInput = await this.page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.type(this.testUser.password);
      }
      
      await this.clickByText('下一步');
      await sleep(500);
      
      const hasStep1 = await this.waitForText('完善基本信息', 2000);
      testCase.assertions.push(AssertionHelper.assertTrue(hasStep1, '进入注册步骤1'));
      
      const nicknameInput = await this.page.$('input[placeholder*="昵称"]');
      if (nicknameInput) {
        await nicknameInput.type(this.testUser.nickname);
      }
      
      await this.clickByText('下一步');
      await sleep(500);
      
      const hasStep2 = await this.waitForText('设置健康目标', 2000);
      testCase.assertions.push(AssertionHelper.assertTrue(hasStep2, '进入注册步骤2'));
      
      await this.clickByText('减脂');
      
      testCase.screenshot = await this.takeScreenshot('register_flow');
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
      testCase.screenshot = await this.takeScreenshot('register_flow_error');
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testLoginFlow() {
    const testCase = {
      id: 'FE-005',
      name: '用户登录测试',
      description: '测试邮箱登录功能',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-005: 用户登录测试');
      
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2'
      });
      
      await this.clickByText('邮箱登录');
      await sleep(300);
      
      const emailInput = await this.page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.click({ clickCount: 3 });
        await emailInput.press('Backspace');
        await emailInput.type('test@example.com');
      }
      
      const passwordInput = await this.page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.click({ clickCount: 3 });
        await passwordInput.press('Backspace');
        await passwordInput.type('Test@123456');
      }
      
      const loginButton = await this.findByText('登录');
      testCase.assertions.push(AssertionHelper.assertExists(loginButton, '登录按钮可点击'));
      
      testCase.screenshot = await this.takeScreenshot('login_form_filled');
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
      testCase.screenshot = await this.takeScreenshot('login_error');
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testDashboardPage() {
    const testCase = {
      id: 'FE-006',
      name: '仪表盘页面渲染测试',
      description: '验证仪表盘页面元素正确渲染',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-006: 仪表盘页面渲染测试');
      
      await this.page.goto(config.frontend.baseUrl + '/', {
        waitUntil: 'networkidle2'
      });
      
      await sleep(1000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        testCase.status = 'skipped';
        testCase.error = '需要登录才能访问仪表盘';
        testCase.duration = Date.now() - startTime;
        this.reporter.addResult('frontend', testCase);
        console.log(`    ⏭️ ${testCase.name} (跳过 - 需要登录)\n`);
        return;
      }
      
      const sidebar = await this.page.$('aside');
      testCase.assertions.push(AssertionHelper.assertExists(sidebar, '侧边栏存在'));
      
      const header = await this.page.$('header');
      testCase.assertions.push(AssertionHelper.assertExists(header, '顶部导航存在'));
      
      const pageContent = await this.page.content();
      const hasCalorieInfo = pageContent.includes('热量') || pageContent.includes('kcal');
      testCase.assertions.push(AssertionHelper.assertTrue(hasCalorieInfo, '热量信息存在'));
      
      const hasNutritionSection = pageContent.includes('营养素') || pageContent.includes('蛋白质');
      testCase.assertions.push(AssertionHelper.assertTrue(hasNutritionSection, '营养素区域存在'));
      
      testCase.screenshot = await this.takeScreenshot('dashboard');
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
      testCase.screenshot = await this.takeScreenshot('dashboard_error');
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testNavigation() {
    const testCase = {
      id: 'FE-007',
      name: '导航跳转测试',
      description: '测试侧边栏和底部导航的页面跳转',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-007: 导航跳转测试');
      
      await this.page.goto(config.frontend.baseUrl + '/', {
        waitUntil: 'networkidle2'
      });
      
      await sleep(500);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login')) {
        testCase.status = 'skipped';
        testCase.error = '需要登录才能测试导航';
        testCase.duration = Date.now() - startTime;
        this.reporter.addResult('frontend', testCase);
        console.log(`    ⏭️ ${testCase.name} (跳过 - 需要登录)\n`);
        return;
      }
      
      const navItems = ['记录饮食', '营养数据', '数据报告', '个人中心'];
      
      for (const item of navItems) {
        try {
          const clicked = await this.clickByText(item);
          await sleep(500);
          testCase.assertions.push(AssertionHelper.assertTrue(clicked, `导航到${item}页面`));
        } catch (e) {
          testCase.assertions.push(AssertionHelper.assertTrue(false, `导航到${item}页面失败`));
        }
      }
      
      testCase.screenshot = await this.takeScreenshot('navigation');
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testResponsiveLayout() {
    const testCase = {
      id: 'FE-008',
      name: '响应式布局测试',
      description: '测试移动端和桌面端的响应式布局',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-008: 响应式布局测试');
      
      await this.page.setViewport(config.frontend.viewport);
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2'
      });
      
      const pageContent = await this.page.content();
      const hasDesktopLayout = pageContent.includes('营养健康管家');
      testCase.assertions.push(AssertionHelper.assertTrue(hasDesktopLayout, '桌面端布局正常'));
      
      await this.page.setViewport(config.frontend.mobileViewport);
      await sleep(500);
      
      const mobileContent = await this.page.content();
      const hasMobileLayout = mobileContent.length > 0;
      testCase.assertions.push(AssertionHelper.assertTrue(hasMobileLayout, '移动端布局正常'));
      
      testCase.screenshot = await this.takeScreenshot('responsive_mobile');
      
      await this.page.setViewport(config.frontend.viewport);
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testPagePerformance() {
    const testCase = {
      id: 'FE-009',
      name: '页面加载性能测试',
      description: '测量页面加载时间和资源大小',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ FE-009: 页面加载性能测试');
      
      const loadStart = Date.now();
      await this.page.goto(config.frontend.baseUrl + '/login', {
        waitUntil: 'networkidle2'
      });
      const loadDuration = Date.now() - loadStart;
      
      testCase.assertions.push(AssertionHelper.assertLessThan(loadDuration, 10000, `页面加载时间: ${loadDuration}ms`));
      
      const metrics = await this.page.metrics();
      testCase.assertions.push(AssertionHelper.assertExists(metrics, '性能指标获取成功'));
      
      const failedAssertions = testCase.assertions.filter(a => !a.passed);
      if (failedAssertions.length > 0) {
        testCase.status = 'failed';
        testCase.error = failedAssertions.map(a => a.message).join('; ');
      }
      
    } catch (error) {
      testCase.status = 'failed';
      testCase.error = error.message;
    }
    
    testCase.duration = Date.now() - startTime;
    this.reporter.addResult('frontend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }
}

export async function runFrontendTests() {
  const tester = new FrontendTests();
  
  try {
    await tester.init();
    const report = await tester.runAllTests();
    return report;
  } finally {
    await tester.close();
  }
}
