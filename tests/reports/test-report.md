# 自动化测试报告

> 生成时间: 2026/3/29 15:14:03

## 测试概览

| 指标 | 值 |
|------|----|
| 总测试数 | 24 |
| 通过数 | 10 |
| 失败数 | 12 |
| 跳过数 | 2 |
| 通过率 | 41.67% |

## 前端测试结果

| ID | 测试名称 | 状态 | 耗时 | 描述 |
|----|---------|------|------|------|
| FE-001 | 登录页面加载测试 | ✅ passed | 1144ms | 验证登录页面是否正确加载，包含所有必要元素 |
| FE-002 | 登录表单元素测试 | ❌ failed | 2ms | 验证登录表单包含所有必要元素 |
| FE-003 | 表单验证测试 | ❌ failed | 560ms | 测试登录和注册表单的输入验证 |
| FE-004 | 用户注册流程测试 | ❌ failed | 728ms | 测试完整的用户注册流程 |
| FE-005 | 用户登录测试 | ❌ failed | 711ms | 测试邮箱登录功能 |
| FE-006 | 仪表盘页面渲染测试 | ✅ passed | 1957ms | 验证仪表盘页面元素正确渲染 |
| FE-007 | 导航跳转测试 | ❌ failed | 1522ms | 测试侧边栏和底部导航的页面跳转 |
| FE-008 | 响应式布局测试 | ✅ passed | 1480ms | 测试移动端和桌面端的响应式布局 |
| FE-009 | 页面加载性能测试 | ✅ passed | 949ms | 测量页面加载时间和资源大小 |

### 详细结果

#### FE-001: 登录页面加载测试

- **状态**: passed
- **描述**: 验证登录页面是否正确加载，包含所有必要元素
- **优先级**: high
- **耗时**: 1144ms
- **断言详情**:
  - ✅ assertExists: 页面标题存在
  - ✅ assertTrue: 登录表单存在
  - ✅ assertTrue: 提交按钮存在
  - ✅ assertContains: 页面包含应用名称

#### FE-002: 登录表单元素测试

- **状态**: failed
- **描述**: 验证登录表单包含所有必要元素
- **优先级**: high
- **耗时**: 2ms
- **断言详情**:
  - ✅ assertTrue: 手机号登录选项卡存在
  - ✅ assertTrue: 邮箱登录选项卡存在
- **错误信息**: 
```
this.page.$x is not a function
```

#### FE-003: 表单验证测试

- **状态**: failed
- **描述**: 测试登录和注册表单的输入验证
- **优先级**: medium
- **耗时**: 560ms
- **错误信息**: 
```
this.page.$x is not a function
```

#### FE-004: 用户注册流程测试

- **状态**: failed
- **描述**: 测试完整的用户注册流程
- **优先级**: high
- **耗时**: 728ms
- **错误信息**: 
```
this.page.$x is not a function
```

#### FE-005: 用户登录测试

- **状态**: failed
- **描述**: 测试邮箱登录功能
- **优先级**: high
- **耗时**: 711ms
- **错误信息**: 
```
this.page.$x is not a function
```

#### FE-006: 仪表盘页面渲染测试

- **状态**: passed
- **描述**: 验证仪表盘页面元素正确渲染
- **优先级**: high
- **耗时**: 1957ms
- **断言详情**:
  - ✅ assertExists: 侧边栏存在
  - ✅ assertExists: 顶部导航存在
  - ✅ assertTrue: 热量信息存在
  - ✅ assertTrue: 营养素区域存在

#### FE-007: 导航跳转测试

- **状态**: failed
- **描述**: 测试侧边栏和底部导航的页面跳转
- **优先级**: medium
- **耗时**: 1522ms
- **断言详情**:
  - ❌ assertTrue: 导航到记录饮食页面失败
  - ❌ assertTrue: 导航到营养数据页面失败
  - ❌ assertTrue: 导航到数据报告页面失败
  - ❌ assertTrue: 导航到个人中心页面失败
- **错误信息**: 
```
导航到记录饮食页面失败; 导航到营养数据页面失败; 导航到数据报告页面失败; 导航到个人中心页面失败
```

#### FE-008: 响应式布局测试

- **状态**: passed
- **描述**: 测试移动端和桌面端的响应式布局
- **优先级**: medium
- **耗时**: 1480ms
- **断言详情**:
  - ✅ assertTrue: 桌面端布局正常
  - ✅ assertTrue: 移动端布局正常

#### FE-009: 页面加载性能测试

- **状态**: passed
- **描述**: 测量页面加载时间和资源大小
- **优先级**: medium
- **耗时**: 949ms
- **断言详情**:
  - ✅ assertLessThan: 页面加载时间: 947ms
  - ✅ assertExists: 性能指标获取成功

## 后端API测试结果

| ID | 测试名称 | 状态 | 耗时 | 描述 |
|----|---------|------|------|------|
| API-000 | API健康检查 | ✅ passed | 17ms | 验证后端服务是否正常运行 |
| API-001 | 用户注册接口测试 | ✅ passed | 181ms | 测试POST /api/auth/register接口 |
| API-002 | 用户登录接口测试 | ✅ passed | 358ms | 测试POST /api/auth/login接口 |
| API-003 | 获取用户信息接口测试 | ❌ failed | 1ms | 测试GET /api/auth/me接口 |
| API-004 | 更新用户资料接口测试 | ❌ failed | 1ms | 测试PUT /api/auth/profile接口 |
| API-005 | 营养计算接口测试 | ❌ failed | 0ms | 测试GET /api/auth/nutrition-calculation接口 |
| API-006 | 食物搜索接口测试 | ✅ passed | 3ms | 测试GET /api/foods/search接口 |
| API-007 | 食物分类接口测试 | ✅ passed | 1ms | 测试GET /api/foods/categories/list接口 |
| API-008 | 饮食记录创建接口测试 | ❌ failed | 1ms | 测试POST /api/records接口 |
| API-009 | 获取今日记录接口测试 | ❌ failed | 1ms | 测试GET /api/records/today接口 |
| API-010 | 获取历史摘要接口测试 | ❌ failed | 1ms | 测试GET /api/records/history/summary接口 |
| API-011 | 更新饮食记录接口测试 | ⏭️ skipped | 0ms | 测试PUT /api/records/{id}接口 |
| API-012 | 删除饮食记录接口测试 | ⏭️ skipped | 0ms | 测试DELETE /api/records/{id}接口 |
| API-013 | 错误处理测试 | ❌ failed | 1ms | 测试各种错误场景的响应 |
| API-014 | 认证边界条件测试 | ✅ passed | 1ms | 测试无效token、过期token等场景 |

### 详细结果

#### API-000: API健康检查

- **状态**: passed
- **描述**: 验证后端服务是否正常运行
- **优先级**: high
- **耗时**: 17ms
- **断言详情**:
  - ✅ assertTrue: API服务可访问
  - ✅ assertTrue: API端点存在

#### API-001: 用户注册接口测试

- **状态**: passed
- **描述**: 测试POST /api/auth/register接口
- **优先级**: high
- **耗时**: 181ms
- **断言详情**:
  - ✅ assertStatusCode: 注册成功，状态码: 201
  - ✅ assertExists: 返回访问令牌
  - ✅ assertStatusCode: 重复注册正确返回错误，状态码: 400

#### API-002: 用户登录接口测试

- **状态**: passed
- **描述**: 测试POST /api/auth/login接口
- **优先级**: high
- **耗时**: 358ms
- **断言详情**:
  - ✅ assertStatusCode: 登录成功，状态码: 200
  - ✅ assertExists: 返回访问令牌
  - ✅ assertStatusCode: 错误密码正确返回401
  - ✅ assertStatusCode: 不存在用户正确返回401

#### API-003: 获取用户信息接口测试

- **状态**: failed
- **描述**: 测试GET /api/auth/me接口
- **优先级**: high
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200，实际: 401
- **错误信息**: 
```
期望状态码 200，实际: 401
```

#### API-004: 更新用户资料接口测试

- **状态**: failed
- **描述**: 测试PUT /api/auth/profile接口
- **优先级**: medium
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200，实际: 401
- **错误信息**: 
```
期望状态码 200，实际: 401
```

#### API-005: 营养计算接口测试

- **状态**: failed
- **描述**: 测试GET /api/auth/nutrition-calculation接口
- **优先级**: medium
- **耗时**: 0ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200，实际: 401
- **错误信息**: 
```
期望状态码 200，实际: 401
```

#### API-006: 食物搜索接口测试

- **状态**: passed
- **描述**: 测试GET /api/foods/search接口
- **优先级**: medium
- **耗时**: 3ms
- **断言详情**:
  - ✅ assertStatusCode: 搜索成功，状态码: 200
  - ✅ assertTrue: 返回数组
  - ✅ assertStatusCode: 缺少搜索参数正确返回错误，状态码: 422

#### API-007: 食物分类接口测试

- **状态**: passed
- **描述**: 测试GET /api/foods/categories/list接口
- **优先级**: medium
- **耗时**: 1ms
- **断言详情**:
  - ✅ assertStatusCode: 获取分类成功，状态码: 200
  - ✅ assertTrue: 返回数组

#### API-008: 饮食记录创建接口测试

- **状态**: failed
- **描述**: 测试POST /api/records接口
- **优先级**: medium
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200/201，实际: 401
- **错误信息**: 
```
期望状态码 200/201，实际: 401
```

#### API-009: 获取今日记录接口测试

- **状态**: failed
- **描述**: 测试GET /api/records/today接口
- **优先级**: medium
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200，实际: 401
- **错误信息**: 
```
期望状态码 200，实际: 401
```

#### API-010: 获取历史摘要接口测试

- **状态**: failed
- **描述**: 测试GET /api/records/history/summary接口
- **优先级**: medium
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 200，实际: 401
- **错误信息**: 
```
期望状态码 200，实际: 401
```

#### API-011: 更新饮食记录接口测试

- **状态**: skipped
- **描述**: 测试PUT /api/records/{id}接口
- **优先级**: medium
- **耗时**: 0ms
- **错误信息**: 
```
没有可更新的记录
```

#### API-012: 删除饮食记录接口测试

- **状态**: skipped
- **描述**: 测试DELETE /api/records/{id}接口
- **优先级**: medium
- **耗时**: 0ms
- **错误信息**: 
```
没有可删除的记录
```

#### API-013: 错误处理测试

- **状态**: failed
- **描述**: 测试各种错误场景的响应
- **优先级**: high
- **耗时**: 1ms
- **断言详情**:
  - ❌ assertStatusCode: 期望状态码 404，实际: 405
  - ✅ assertStatusCode: 无效注册数据正确返回错误，状态码: 422
- **错误信息**: 
```
期望状态码 404，实际: 405
```

#### API-014: 认证边界条件测试

- **状态**: passed
- **描述**: 测试无效token、过期token等场景
- **优先级**: high
- **耗时**: 1ms
- **断言详情**:
  - ✅ assertStatusCode: 无效token正确返回401
  - ✅ assertStatusCode: 无token正确返回403

## 测试环境

- 前端地址: http://localhost:5173
- 后端地址: http://localhost:8000
- 浏览器: Chromium (Puppeteer)
- 无头模式: 是
- 视口大小: 1280x800

---
*报告由自动化测试系统生成*
