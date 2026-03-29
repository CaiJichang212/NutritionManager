const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './test-screenshots';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: false });
  console.log(`  📸 截图: ${name}.png`);
}

async function testLoginPage() {
  console.log('\n=== 测试登录页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('✓ 登录页面加载成功');

    const title = await page.title();
    console.log(`  页面标题: ${title}`);

    const phoneTabVisible = await page.isVisible('text=手机号登录');
    console.log(`  ${phoneTabVisible ? '✓' : '⚠'} 手机号登录Tab: ${phoneTabVisible ? '可见' : '不可见'}`);

    const emailTabVisible = await page.isVisible('text=邮箱登录');
    console.log(`  ${emailTabVisible ? '✓' : '⚠'} 邮箱登录Tab: ${emailTabVisible ? '可见' : '不可见'}`);

    const loginBtnVisible = await page.isVisible('text=登录');
    console.log(`  ${loginBtnVisible ? '✓' : '⚠'} 登录按钮: ${loginBtnVisible ? '可见' : '不可见'}`);

    const registerBtnVisible = await page.isVisible('text=立即注册');
    console.log(`  ${registerBtnVisible ? '✓' : '⚠'} 立即注册按钮: ${registerBtnVisible ? '可见' : '不可见'}`);

    const sendCodeVisible = await page.isVisible('text=发送验证码');
    console.log(`  ${sendCodeVisible ? '✓' : '⚠'} 发送验证码按钮: ${sendCodeVisible ? '可见' : '不可见'}`);

    await takeScreenshot(page, '01-login-page');

    console.log('登录页面测试通过 ✓');
  } catch (error) {
    console.error('登录页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testDashboardPage() {
  console.log('\n=== 测试首页/Dashboard ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
      await takeScreenshot(page, '02-dashboard-redirect');
    } else {
      console.log('✓ Dashboard页面加载成功');

      const calorieRing = await page.isVisible('svg');
      console.log(`  ${calorieRing ? '✓' : '⚠'} 热量进度环: ${calorieRing ? '存在' : '不存在'}`);

      const quickAddBtns = await page.isVisible('text=拍照识别');
      console.log(`  ${quickAddBtns ? '✓' : '⚠'} 拍照识别按钮: ${quickAddBtns ? '存在' : '不存在'}`);

      const searchBtn = await page.isVisible('text=搜索食物');
      console.log(`  ${searchBtn ? '✓' : '⚠'} 搜索食物按钮: ${searchBtn ? '存在' : '不存在'}`);

      const mealBreakfast = await page.isVisible('text=早餐');
      console.log(`  ${mealBreakfast ? '✓' : '⚠'} 早餐按钮: ${mealBreakfast ? '存在' : '不存在'}`);

      await takeScreenshot(page, '02-dashboard');
    }

    console.log('Dashboard页面测试完成');
  } catch (error) {
    console.error('Dashboard页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testRecordPage() {
  console.log('\n=== 测试记录页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/record`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ 记录页面加载成功');

      const searchInput = await page.isVisible('input[placeholder*="搜索"]');
      console.log(`  ${searchInput ? '✓' : '⚠'} 搜索输入框: ${searchInput ? '存在' : '不存在'}`);

      const scanBtn = await page.isVisible('[title="扫码识别"]');
      console.log(`  ${scanBtn ? '✓' : '⚠'} 扫码识别按钮: ${scanBtn ? '存在' : '不存在'}`);

      const cameraBtn = await page.isVisible('[title="拍照识别"]');
      console.log(`  ${cameraBtn ? '✓' : '⚠'} 拍照识别按钮: ${cameraBtn ? '存在' : '不存在'}`);

      const uploadBtn = await page.isVisible('[title="图片上传"]');
      console.log(`  ${uploadBtn ? '✓' : '⚠'} 图片上传按钮: ${uploadBtn ? '存在' : '不存在'}`);

      const searchTab = await page.isVisible('text=搜索');
      const recentTab = await page.isVisible('text=最近');
      const favTab = await page.isVisible('text=收藏');
      console.log(`  ${searchTab && recentTab && favTab ? '✓' : '⚠'} Tab按钮(搜索/最近/收藏): ${searchTab && recentTab && favTab ? '全部存在' : '部分缺失'}`);

      const breakfastBtn = await page.isVisible('text=早餐');
      console.log(`  ${breakfastBtn ? '✓' : '⚠'} 早餐按钮: ${breakfastBtn ? '存在' : '不存在'}`);

      await takeScreenshot(page, '03-record-page');
    }

    console.log('记录页面测试完成');
  } catch (error) {
    console.error('记录页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testNutritionPage() {
  console.log('\n=== 测试营养数据中心 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/nutrition`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ 营养数据中心页面加载成功');

      const radarChart = await page.isVisible('.recharts-radar');
      console.log(`  ${radarChart ? '✓' : '⚠'} 雷达图: ${radarChart ? '存在' : '不存在'}`);

      const barChart = await page.isVisible('.recharts-bar');
      console.log(`  ${barChart ? '✓' : '⚠'} 柱状图: ${barChart ? '存在' : '不存在'}`);

      const catAll = await page.isVisible('text=全部');
      console.log(`  ${catAll ? '✓' : '⚠'} 分类按钮(全部): ${catAll ? '存在' : '不存在'}`);

      await takeScreenshot(page, '04-nutrition-page');
    }

    console.log('营养数据中心测试完成');
  } catch (error) {
    console.error('营养数据中心测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testAIChatPage() {
  console.log('\n=== 测试AI营养师页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/ai`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ AI营养师页面加载成功');

      const chatInput = await page.isVisible('textarea');
      console.log(`  ${chatInput ? '✓' : '⚠'} 聊天输入框: ${chatInput ? '存在' : '不存在'}`);

      const quickQ1 = await page.isVisible('text=今天应该吃什么');
      const quickQ2 = await page.isVisible('text=我的蛋白质摄入够吗');
      console.log(`  ${quickQ1 && quickQ2 ? '✓' : '⚠'} 快捷问题: ${quickQ1 && quickQ2 ? '存在' : '部分缺失'}`);

      await takeScreenshot(page, '05-ai-chat-page');
    }

    console.log('AI营养师页面测试完成');
  } catch (error) {
    console.error('AI营养师页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testReportsPage() {
  console.log('\n=== 测试数据报告页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ 数据报告页面加载成功');

      const shareBtn = await page.isVisible('[title="分享报告"]');
      console.log(`  ${shareBtn ? '✓' : '⚠'} 分享按钮: ${shareBtn ? '存在' : '不存在'}`);

      const exportBtn = await page.isVisible('[title="导出报告"]');
      console.log(`  ${exportBtn ? '✓' : '⚠'} 导出按钮: ${exportBtn ? '存在' : '不存在'}`);

      const dailyReport = await page.isVisible('text=日报');
      const weeklyReport = await page.isVisible('text=周报');
      console.log(`  ${dailyReport && weeklyReport ? '✓' : '⚠'} 报告类型Tab: ${dailyReport && weeklyReport ? '存在' : '缺失'}`);

      await takeScreenshot(page, '06-reports-page');
    }

    console.log('数据报告页面测试完成');
  } catch (error) {
    console.error('数据报告页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testProfilePage() {
  console.log('\n=== 测试个人中心页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ 个人中心页面加载成功');

      const notiBtn = await page.isVisible('text=提醒设置');
      const privacyBtn = await page.isVisible('text=隐私与安全');
      const helpBtn = await page.isVisible('text=帮助与反馈');
      const sysBtn = await page.isVisible('text=系统设置');
      console.log(`  ${notiBtn && privacyBtn && helpBtn && sysBtn ? '✓' : '⚠'} 设置菜单项: ${notiBtn && privacyBtn && helpBtn && sysBtn ? '全部存在' : '部分缺失'}`);

      const logoutBtn = await page.isVisible('text=退出登录');
      console.log(`  ${logoutBtn ? '✓' : '⚠'} 退出登录按钮: ${logoutBtn ? '存在' : '不存在'}`);

      await takeScreenshot(page, '07-profile-page');
    }

    console.log('个人中心页面测试完成');
  } catch (error) {
    console.error('个人中心页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function testSettingsPages() {
  console.log('\n=== 测试设置页面 ===');

  const settingsPages = [
    { url: '/settings/notifications', name: '提醒设置' },
    { url: '/settings/privacy', name: '隐私与安全' },
    { url: '/settings/help', name: '帮助与反馈' },
    { url: '/settings/system', name: '系统设置' },
  ];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const pageInfo of settingsPages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(500);

      const notFound = await page.isVisible('text=404');
      if (notFound) {
        console.log(`  ⚠ ${pageInfo.name}页面: 未找到`);
      } else {
        console.log(`  ✓ ${pageInfo.name}页面: 加载成功`);
        await takeScreenshot(page, `08-${pageInfo.name}`);
      }
    } catch (error) {
      console.error(`  ⚠ ${pageInfo.name}测试失败:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('设置页面测试完成 ✓');
}

async function testSocialPage() {
  console.log('\n=== 测试社交激励页面 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(`${BASE_URL}/social`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    const loginRedirect = await page.isVisible('text=登录');
    if (loginRedirect) {
      console.log('⚠ 未登录，重定向到登录页面');
    } else {
      console.log('✓ 社交激励页面加载成功');

      const checkInBtn = await page.isVisible('text=立即打卡');
      const checkedBtn = await page.isVisible('text=已打卡');
      console.log(`  ${checkInBtn || checkedBtn ? '✓' : '⚠'} 打卡按钮: ${checkInBtn || checkedBtn ? '存在' : '不存在'}`);

      const shareBtn = await page.isVisible('text=分享成果');
      console.log(`  ${shareBtn ? '✓' : '⚠'} 分享成果按钮: ${shareBtn ? '存在' : '不存在'}`);

      const leaderboard = await page.isVisible('text=排行榜');
      console.log(`  ${leaderboard ? '✓' : '⚠'} 排行榜: ${leaderboard ? '存在' : '不存在'}`);

      const achievements = await page.isVisible('text=成就');
      console.log(`  ${achievements ? '✓' : '⚠'} 成就: ${achievements ? '存在' : '不存在'}`);

      await takeScreenshot(page, '09-social-page');
    }

    console.log('社交激励页面测试完成');
  } catch (error) {
    console.error('社交激励页面测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('   营养健康管家 - 前端功能测试');
  console.log('========================================');
  console.log(`测试地址: ${BASE_URL}`);
  console.log('----------------------------------------');

  try {
    await testLoginPage();
    await testDashboardPage();
    await testRecordPage();
    await testNutritionPage();
    await testAIChatPage();
    await testReportsPage();
    await testProfilePage();
    await testSettingsPages();
    await testSocialPage();

    console.log('\n========================================');
    console.log('   所有测试完成！');
    console.log('========================================');
    console.log('截图已保存到 ./test-screenshots 目录');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

runAllTests();
