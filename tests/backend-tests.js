import { config } from './config.js';
import { TestReporter, AssertionHelper, randomEmail, randomPhone } from './utils.js';

export class BackendTests {
  constructor() {
    this.reporter = new TestReporter();
    this.baseUrl = config.backend.baseUrl + config.backend.apiPrefix;
    this.authToken = null;
    this.testUser = {
      email: randomEmail(),
      phone: randomPhone(),
      password: 'Test@123456',
      nickname: '测试用户'
    };
    this.createdRecordId = null;
  }

  async request(endpoint, options = {}) {
    const url = this.baseUrl + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return {
        status: response.status,
        ok: response.ok,
        data
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  runAllTests() {
    this.reporter.startTest();
    console.log('\n📋 开始后端API测试...\n');
    
    return this.executeTests();
  }

  async executeTests() {
    try {
      await this.testHealthCheck();
      await this.testRegisterAPI();
      await this.testLoginAPI();
      await this.testGetCurrentUser();
      await this.testUpdateProfile();
      await this.testNutritionCalculation();
      await this.testFoodSearch();
      await this.testFoodCategories();
      await this.testCreateRecord();
      await this.testGetTodayRecords();
      await this.testGetHistorySummary();
      await this.testUpdateRecord();
      await this.testDeleteRecord();
      await this.testErrorHandling();
      await this.testAuthBoundaryConditions();
    } catch (error) {
      console.error('测试执行错误:', error);
    }
    
    this.reporter.endTest();
    return this.reporter.generateReport();
  }

  async testHealthCheck() {
    const testCase = {
      id: 'API-000',
      name: 'API健康检查',
      description: '验证后端服务是否正常运行',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-000: API健康检查');
      
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test'
        })
      });
      
      testCase.assertions.push(AssertionHelper.assertTrue(response.status !== 0, 'API服务可访问'));
      testCase.assertions.push(AssertionHelper.assertTrue(response.status !== 404, 'API端点存在'));
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testRegisterAPI() {
    const testCase = {
      id: 'API-001',
      name: '用户注册接口测试',
      description: '测试POST /api/auth/register接口',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-001: 用户注册接口测试');
      
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testUser.email,
          password: this.testUser.password,
          nickname: this.testUser.nickname
        })
      });
      
      const statusOk = response.status === 200 || response.status === 201;
      testCase.assertions.push({
        passed: statusOk,
        name: 'assertStatusCode',
        message: statusOk ? `注册成功，状态码: ${response.status}` : `期望状态码 200/201，实际: ${response.status}`
      });
      
      if (response.ok || statusOk) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.access_token, '返回访问令牌'));
        if (response.data?.access_token) {
          this.authToken = response.data.access_token;
        }
      }
      
      const duplicateResponse = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testUser.email,
          password: this.testUser.password
        })
      });
      
      const duplicateStatusOk = duplicateResponse.status === 400 || duplicateResponse.status === 409;
      testCase.assertions.push({
        passed: duplicateStatusOk,
        name: 'assertStatusCode',
        message: duplicateStatusOk ? `重复注册正确返回错误，状态码: ${duplicateResponse.status}` : `期望状态码 400/409，实际: ${duplicateResponse.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testLoginAPI() {
    const testCase = {
      id: 'API-002',
      name: '用户登录接口测试',
      description: '测试POST /api/auth/login接口',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-002: 用户登录接口测试');
      
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testUser.email,
          password: this.testUser.password
        })
      });
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `登录成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.access_token, '返回访问令牌'));
        if (response.data?.access_token) {
          this.authToken = response.data.access_token;
        }
      }
      
      const wrongPasswordResponse = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: this.testUser.email,
          password: 'WrongPassword123'
        })
      });
      
      testCase.assertions.push({
        passed: wrongPasswordResponse.status === 401,
        name: 'assertStatusCode',
        message: wrongPasswordResponse.status === 401 ? `错误密码正确返回401` : `期望状态码 401，实际: ${wrongPasswordResponse.status}`
      });
      
      const nonExistentResponse = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SomePassword123'
        })
      });
      
      testCase.assertions.push({
        passed: nonExistentResponse.status === 401,
        name: 'assertStatusCode',
        message: nonExistentResponse.status === 401 ? `不存在用户正确返回401` : `期望状态码 401，实际: ${nonExistentResponse.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testGetCurrentUser() {
    const testCase = {
      id: 'API-003',
      name: '获取用户信息接口测试',
      description: '测试GET /api/auth/me接口',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-003: 获取用户信息接口测试');
      
      const response = await this.request('/auth/me');
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `获取用户信息成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.id, '用户ID存在'));
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.email, '用户邮箱存在'));
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testUpdateProfile() {
    const testCase = {
      id: 'API-004',
      name: '更新用户资料接口测试',
      description: '测试PUT /api/auth/profile接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-004: 更新用户资料接口测试');
      
      const updateData = {
        nickname: '更新后的昵称',
        gender: 'male',
        age: 28,
        height: 175,
        weight: 72,
        activity_level: 'moderate',
        goal_type: 'lose_weight'
      };
      
      const response = await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `更新资料成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertEqual(response.data?.nickname, updateData.nickname, '昵称更新正确'));
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testNutritionCalculation() {
    const testCase = {
      id: 'API-005',
      name: '营养计算接口测试',
      description: '测试GET /api/auth/nutrition-calculation接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-005: 营养计算接口测试');
      
      const response = await this.request('/auth/nutrition-calculation');
      
      if (response.status === 400) {
        testCase.assertions.push(AssertionHelper.assertTrue(true, '需要完善个人信息才能计算'));
      } else {
        testCase.assertions.push({
          passed: response.status === 200,
          name: 'assertStatusCode',
          message: response.status === 200 ? `营养计算成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
        });
        
        if (response.ok) {
          testCase.assertions.push(AssertionHelper.assertExists(response.data?.bmr, 'BMR存在'));
          testCase.assertions.push(AssertionHelper.assertExists(response.data?.tdee, 'TDEE存在'));
          testCase.assertions.push(AssertionHelper.assertGreaterThan(response.data?.bmr || 0, 0, 'BMR大于0'));
        }
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testFoodSearch() {
    const testCase = {
      id: 'API-006',
      name: '食物搜索接口测试',
      description: '测试GET /api/foods/search接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-006: 食物搜索接口测试');
      
      const response = await this.request('/foods/search?q=苹果');
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `搜索成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertTrue(Array.isArray(response.data), '返回数组'));
      }
      
      const noQueryResponse = await this.request('/foods/search');
      const noQueryStatusOk = noQueryResponse.status === 400 || noQueryResponse.status === 422;
      testCase.assertions.push({
        passed: noQueryStatusOk,
        name: 'assertStatusCode',
        message: noQueryStatusOk ? `缺少搜索参数正确返回错误，状态码: ${noQueryResponse.status}` : `期望状态码 400/422，实际: ${noQueryResponse.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testFoodCategories() {
    const testCase = {
      id: 'API-007',
      name: '食物分类接口测试',
      description: '测试GET /api/foods/categories/list接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-007: 食物分类接口测试');
      
      const response = await this.request('/foods/categories/list');
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `获取分类成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertTrue(Array.isArray(response.data), '返回数组'));
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testCreateRecord() {
    const testCase = {
      id: 'API-008',
      name: '饮食记录创建接口测试',
      description: '测试POST /api/records接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-008: 饮食记录创建接口测试');
      
      const recordData = {
        date: new Date().toISOString(),
        meal_type: 'breakfast',
        foods: [
          {
            name: '苹果',
            amount: 150,
            unit: 'g',
            calories: 78,
            protein: 0.4,
            fat: 0.3,
            carbs: 20.7,
            fiber: 2.4
          }
        ],
        notes: '早餐测试记录'
      };
      
      const response = await this.request('/records', {
        method: 'POST',
        body: JSON.stringify(recordData)
      });
      
      const statusOk = response.status === 200 || response.status === 201;
      testCase.assertions.push({
        passed: statusOk,
        name: 'assertStatusCode',
        message: statusOk ? `创建记录成功，状态码: ${response.status}` : `期望状态码 200/201，实际: ${response.status}`
      });
      
      if (response.ok || statusOk) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.id, '记录ID存在'));
        this.createdRecordId = response.data?.id;
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testGetTodayRecords() {
    const testCase = {
      id: 'API-009',
      name: '获取今日记录接口测试',
      description: '测试GET /api/records/today接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-009: 获取今日记录接口测试');
      
      const response = await this.request('/records/today');
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `获取今日记录成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.date, '日期字段存在'));
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.records, '记录数组存在'));
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testGetHistorySummary() {
    const testCase = {
      id: 'API-010',
      name: '获取历史摘要接口测试',
      description: '测试GET /api/records/history/summary接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-010: 获取历史摘要接口测试');
      
      const response = await this.request('/records/history/summary?days=7');
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `获取历史摘要成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
      if (response.ok) {
        testCase.assertions.push(AssertionHelper.assertExists(response.data?.daily_summaries, '每日摘要数组存在'));
      }
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testUpdateRecord() {
    const testCase = {
      id: 'API-011',
      name: '更新饮食记录接口测试',
      description: '测试PUT /api/records/{id}接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-011: 更新饮食记录接口测试');
      
      if (!this.createdRecordId) {
        testCase.status = 'skipped';
        testCase.error = '没有可更新的记录';
        testCase.duration = Date.now() - startTime;
        this.reporter.addResult('backend', testCase);
        console.log(`    ⏭️ ${testCase.name} (跳过)\n`);
        return;
      }
      
      const updateData = {
        notes: '更新后的备注'
      };
      
      const response = await this.request(`/records/${this.createdRecordId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `更新记录成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testDeleteRecord() {
    const testCase = {
      id: 'API-012',
      name: '删除饮食记录接口测试',
      description: '测试DELETE /api/records/{id}接口',
      priority: 'medium',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-012: 删除饮食记录接口测试');
      
      if (!this.createdRecordId) {
        testCase.status = 'skipped';
        testCase.error = '没有可删除的记录';
        testCase.duration = Date.now() - startTime;
        this.reporter.addResult('backend', testCase);
        console.log(`    ⏭️ ${testCase.name} (跳过)\n`);
        return;
      }
      
      const response = await this.request(`/records/${this.createdRecordId}`, {
        method: 'DELETE'
      });
      
      testCase.assertions.push({
        passed: response.status === 200,
        name: 'assertStatusCode',
        message: response.status === 200 ? `删除记录成功，状态码: 200` : `期望状态码 200，实际: ${response.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testErrorHandling() {
    const testCase = {
      id: 'API-013',
      name: '错误处理测试',
      description: '测试各种错误场景的响应',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-013: 错误处理测试');
      
      const notFoundResponse = await this.request('/records/999999');
      testCase.assertions.push({
        passed: notFoundResponse.status === 404,
        name: 'assertStatusCode',
        message: notFoundResponse.status === 404 ? `不存在的记录正确返回404` : `期望状态码 404，实际: ${notFoundResponse.status}`
      });
      
      const invalidRegisterResponse = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      const invalidStatusOk = invalidRegisterResponse.status === 400 || invalidRegisterResponse.status === 422;
      testCase.assertions.push({
        passed: invalidStatusOk,
        name: 'assertStatusCode',
        message: invalidStatusOk ? `无效注册数据正确返回错误，状态码: ${invalidRegisterResponse.status}` : `期望状态码 400/422，实际: ${invalidRegisterResponse.status}`
      });
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }

  async testAuthBoundaryConditions() {
    const testCase = {
      id: 'API-014',
      name: '认证边界条件测试',
      description: '测试无效token、过期token等场景',
      priority: 'high',
      assertions: [],
      status: 'passed'
    };
    
    const startTime = Date.now();
    
    try {
      console.log('  ▶ API-014: 认证边界条件测试');
      
      const savedToken = this.authToken;
      this.authToken = 'invalid_token_12345';
      
      const invalidTokenResponse = await this.request('/auth/me');
      testCase.assertions.push({
        passed: invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403,
        name: 'assertStatusCode',
        message: invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403 
          ? `无效token正确返回${invalidTokenResponse.status}` 
          : `期望状态码 401/403，实际: ${invalidTokenResponse.status}`
      });
      
      this.authToken = '';
      
      const noTokenResponse = await this.request('/auth/me');
      testCase.assertions.push({
        passed: noTokenResponse.status === 401 || noTokenResponse.status === 403,
        name: 'assertStatusCode',
        message: noTokenResponse.status === 401 || noTokenResponse.status === 403 
          ? `无token正确返回${noTokenResponse.status}` 
          : `期望状态码 401/403，实际: ${noTokenResponse.status}`
      });
      
      this.authToken = savedToken;
      
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
    this.reporter.addResult('backend', testCase);
    console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} ${testCase.name} (${testCase.duration}ms)\n`);
  }
}

export async function runBackendTests() {
  const tester = new BackendTests();
  const report = await tester.runAllTests();
  return report;
}
