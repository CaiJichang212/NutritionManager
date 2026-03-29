export const config = {
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    timeout: 30000,
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    headless: process.env.HEADLESS !== 'false',
    viewport: {
      width: 1280,
      height: 800
    },
    mobileViewport: {
      width: 375,
      height: 667
    }
  },
  backend: {
    baseUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    apiPrefix: '/api',
    timeout: 10000
  },
  testUser: {
    email: `test_${Date.now()}@example.com`,
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    password: 'Test@123456',
    nickname: '测试用户'
  },
  testCases: {
    frontend: [
      {
        id: 'FE-001',
        name: '登录页面加载测试',
        description: '验证登录页面是否正确加载，包含所有必要元素',
        priority: 'high'
      },
      {
        id: 'FE-002',
        name: '用户注册流程测试',
        description: '测试完整的用户注册流程，包括信息填写和目标设置',
        priority: 'high'
      },
      {
        id: 'FE-003',
        name: '用户登录测试',
        description: '测试邮箱登录功能',
        priority: 'high'
      },
      {
        id: 'FE-004',
        name: '仪表盘页面渲染测试',
        description: '验证仪表盘页面元素正确渲染',
        priority: 'high'
      },
      {
        id: 'FE-005',
        name: '导航跳转测试',
        description: '测试侧边栏和底部导航的页面跳转',
        priority: 'medium'
      },
      {
        id: 'FE-006',
        name: '表单验证测试',
        description: '测试登录和注册表单的输入验证',
        priority: 'medium'
      },
      {
        id: 'FE-007',
        name: '响应式布局测试',
        description: '测试移动端和桌面端的响应式布局',
        priority: 'medium'
      },
      {
        id: 'FE-008',
        name: '页面加载性能测试',
        description: '测量页面加载时间和资源大小',
        priority: 'medium'
      }
    ],
    backend: [
      {
        id: 'API-001',
        name: '用户注册接口测试',
        description: '测试POST /api/auth/register接口',
        priority: 'high'
      },
      {
        id: 'API-002',
        name: '用户登录接口测试',
        description: '测试POST /api/auth/login接口',
        priority: 'high'
      },
      {
        id: 'API-003',
        name: '获取用户信息接口测试',
        description: '测试GET /api/auth/me接口',
        priority: 'high'
      },
      {
        id: 'API-004',
        name: '更新用户资料接口测试',
        description: '测试PUT /api/auth/profile接口',
        priority: 'medium'
      },
      {
        id: 'API-005',
        name: '食物搜索接口测试',
        description: '测试GET /api/foods/search接口',
        priority: 'medium'
      },
      {
        id: 'API-006',
        name: '饮食记录创建接口测试',
        description: '测试POST /api/records接口',
        priority: 'medium'
      },
      {
        id: 'API-007',
        name: '获取今日记录接口测试',
        description: '测试GET /api/records/today接口',
        priority: 'medium'
      },
      {
        id: 'API-008',
        name: '错误处理测试',
        description: '测试各种错误场景的响应',
        priority: 'high'
      },
      {
        id: 'API-009',
        name: '认证边界条件测试',
        description: '测试无效token、过期token等场景',
        priority: 'high'
      }
    ]
  }
};

export default config;
