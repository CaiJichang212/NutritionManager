# 营养健康管家 Web 应用

一款功能完善、用户友好的跨设备营养健康管理 Web 应用，帮助用户记录日常饮食、监控营养摄入、通过拍照识别包装食品配料表，并提供 AI 驱动的个性化营养建议。

## 项目简介

本项目是一个**营养健康管家 Web 应用**的 MVP 版本，旨在帮助用户：

- 记录日常饮食，监控营养摄入
- 通过拍照识别包装食品配料表，快速评估食品健康程度
- 针对特定人群（减脂、增肌、健康管理）提供个性化营养指导
- 促进用户养成健康的饮食习惯
- 支持电脑端和移动端访问，实现跨设备数据同步

### 目标用户

- 关注健康饮食的普通用户
- 减脂人群：需要控制热量摄入、选择低卡食品的用户
- 增肌人群：需要高蛋白饮食、优化营养配比的用户
- 健康管理人群：有特定健康需求（如糖尿病、高血压）的用户

### 核心功能

| 功能模块 | 描述 |
|---------|------|
| 用户系统 | 手机号/邮箱登录、个人信息管理、健康目标设置 |
| 食物识别 | 条形码扫描、拍照识别、手动搜索、快捷选择 |
| 营养追踪 | 热量、蛋白质、脂肪、碳水摄入监控 |
| 健康评估 | 食品健康评分（0-10分）、NOVA 分类 |
| AI 营养师 | 基于 Qwen 模型的智能问答、个性化建议 |
| 数据报告 | 日报/周报自动生成、趋势分析 |

---

## 项目架构

```
idea0329-figma/
├── docs/                              # 项目文档
│   ├── 需求文档-v8.1.1-figma.md        # 详细需求文档
│   └── 参考资料.md
├── src/
│   ├── backend/                       # 后端代码 (Python/FastAPI)
│   │   ├── routers/                   # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # 认证相关 API
│   │   │   ├── foods.py               # 食物相关 API
│   │   │   └── records.py             # 记录相关 API
│   │   ├── services/                  # 业务服务
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py          # AI 营养师服务
│   │   │   └── nutrition.py           # 营养计算服务
│   │   ├── tests/                     # 后端测试
│   │   │   ├── conftest.py
│   │   │   ├── test_auth.py
│   │   │   └── test_main.py
│   │   ├── config.py                  # 配置管理
│   │   ├── database.py                # 数据库连接
│   │   ├── init_db.py                 # 数据库初始化
│   │   ├── main.py                    # 应用入口
│   │   ├── models.py                  # 数据模型
│   │   ├── schemas.py                 # Pydantic 模式
│   │   ├── nutrition_app.db           # SQLite 数据库
│   │   ├── pyproject.toml             # 项目配置
│   │   ├── pytest.ini                 # 测试配置
│   │   └── requirements.txt           # 依赖列表
│   └── frontend/                      # 前端代码 (React/TypeScript)
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/        # UI 组件
│       │   │   │   ├── figma/         # Figma 相关组件
│       │   │   │   └── ui/            # 基础 UI 组件
│       │   │   ├── pages/             # 页面组件
│       │   │   │   ├── AIChatPage.tsx
│       │   │   │   ├── DashboardPage.tsx
│       │   │   │   ├── LoginPage.tsx
│       │   │   │   ├── NutritionPage.tsx
│       │   │   │   ├── ProfilePage.tsx
│       │   │   │   ├── RecordPage.tsx
│       │   │   │   ├── ReportsPage.tsx
│       │   │   │   └── SocialPage.tsx
│       │   │   ├── services/          # API 服务
│       │   │   │   ├── aiService.ts
│       │   │   │   ├── api.ts
│       │   │   │   ├── authService.ts
│       │   │   │   ├── foodService.ts
│       │   │   │   ├── index.ts
│       │   │   │   └── recordService.ts
│       │   │   ├── stores/            # Zustand 状态管理
│       │   │   │   ├── authStore.ts
│       │   │   │   ├── dietStore.ts
│       │   │   │   ├── foodStore.ts
│       │   │   │   ├── nutritionStore.ts
│       │   │   │   └── index.ts
│       │   │   ├── App.tsx            # 应用入口
│       │   │   ├── Root.tsx           # 根组件
│       │   │   └── routes.ts          # 路由配置
│       │   ├── styles/                # 样式文件
│       │   │   ├── fonts.css
│       │   │   ├── index.css
│       │   │   ├── tailwind.css
│       │   │   └── theme.css
│       │   ├── test/
│       │   │   └── setup.ts
│       │   └── main.tsx               # 入口文件
│       ├── index.html
│       ├── package.json
│       ├── pnpm-lock.yaml
│       ├── postcss.config.mjs
│       ├── vite.config.ts
│       └── vitest.config.ts
└── tests/                             # E2E 测试
    ├── reports/
    ├── backend-tests.js
    ├── config.js
    ├── frontend-tests.js
    ├── run-tests.js
    └── utils.js
```

---

## 技术方案

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 编程语言 |
| FastAPI | 0.109.0 | Web 框架 |
| SQLAlchemy | 2.0.25 | ORM |
| Pydantic | 2.5.3 | 数据验证 |
| python-jose | 3.3.0 | JWT 认证 |
| OpenAI | 1.12.0 | AI 服务 (ModelScope) |
| SQLite | - | 数据库 |
| Uvicorn | 0.27.0 | ASGI 服务器 |
| Pytest | 8.0.0 | 测试框架 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| TypeScript | - | 类型安全 |
| React Router | 7.13.0 | 路由管理 |
| Zustand | 5.0.12 | 状态管理 |
| Radix UI | - | 无障碍组件库 |
| Tailwind CSS | 4.1.12 | 样式方案 |
| Vite | 6.3.5 | 构建工具 |
| Vitest | 1.3.1 | 测试框架 |
| Axios | 1.14.0 | HTTP 客户端 |
| Recharts | 2.15.2 | 图表库 |

### 数据模型

#### User (用户)
```python
- id: Integer (主键)
- phone/email: String (唯一)
- password_hash: String
- nickname, avatar, gender, age, height, weight
- activity_level: Enum (sedentary/light/moderate/active/very_active)
- goal_type: Enum (lose_weight/maintain/gain_weight/muscle_gain)
- health_conditions, allergies: JSON
- bmr, tdee, daily_calorie_goal: Float
```

#### Food (食物)
```python
- id: Integer (主键)
- name, brand, category, barcode: String
- calories, protein, fat, carbs, fiber, sugar, sodium: Float
- health_score: Integer (0-100)
- nova_class: Integer (1-4)
- ingredients, allergens: JSON
```

#### DietRecord (饮食记录)
```python
- id: Integer (主键)
- user_id: Integer (外键)
- date: DateTime
- meal_type: Enum (breakfast/lunch/dinner/snack)
- foods: JSON
- total_calories, total_protein, total_fat, total_carbs: Float
```

### API 端点

#### 认证 API (`/api/auth`)
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/register` | 用户注册 |
| POST | `/login` | 用户登录 |
| GET | `/me` | 获取当前用户信息 |
| PUT | `/profile` | 更新用户资料 |
| GET | `/nutrition-calculation` | 计算营养指标 |

#### 食物 API (`/api/foods`)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 获取食物列表 |
| GET | `/{food_id}` | 获取食物详情 |
| GET | `/barcode/{barcode}` | 通过条形码查询 |
| POST | `/` | 创建食物 |

#### 记录 API (`/api/records`)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 获取记录列表 |
| POST | `/` | 创建饮食记录 |
| PUT | `/{record_id}` | 更新记录 |
| DELETE | `/{record_id}` | 删除记录 |

#### AI API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/ai/chat` | AI 营养师对话 |

### 前端路由

| 路径 | 页面 | 描述 |
|------|------|------|
| `/login` | LoginPage | 登录页 |
| `/` | DashboardPage | 首页/今日概览 |
| `/record` | RecordPage | 饮食记录 |
| `/nutrition` | NutritionPage | 营养详情 |
| `/reports` | ReportsPage | 数据报告 |
| `/ai` | AIChatPage | AI 营养师 |
| `/profile` | ProfilePage | 个人中心 |
| `/social` | SocialPage | 社交激励 |

---

## 安装部署

### 环境要求

- **后端**: Python 3.10+
- **前端**: Node.js 18+, pnpm 8+
- **操作系统**: macOS / Linux / Windows

### 后端安装部署

#### 1. 进入后端目录

```bash
cd src/backend
```

#### 2. 安装依赖

**方式一：使用 uv（推荐）**

```bash
# 安装 uv（如果尚未安装）
pip install uv

# 同步依赖
uv sync
```

**方式二：使用 pip**

```bash
pip install -r requirements.txt
```

#### 3. 配置环境变量

创建 `.env` 文件（可选，使用默认配置也可运行）：

```bash
# .env
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./nutrition_app.db
MODELSCOPE_API_KEY=your-modelscope-api-key
ACCESS_TOKEN_EXPIRE_HOURS=168
```

#### 4. 初始化数据库

```bash
uv run python init_db.py
```

#### 5. 启动开发服务器

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务启动后访问：
- API 文档: http://localhost:8000/docs
- API 文档: http://localhost:8000/redoc

#### 6. 运行测试

```bash
uv run pytest
```

### 前端安装部署

#### 1. 进入前端目录

```bash
cd src/frontend
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 启动开发服务器

```bash
pnpm dev
```

服务启动后访问: http://localhost:5173

#### 4. 构建生产版本

```bash
pnpm build
```

构建产物位于 `dist/` 目录。

#### 5. 运行测试

```bash
# 运行测试
pnpm test

# 运行测试（单次）
pnpm test:run

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

### 完整启动流程

#### 开发环境

**终端 1 - 启动后端：**
```bash
cd src/backend
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**终端 2 - 启动前端：**
```bash
cd src/frontend
pnpm install
pnpm dev
```

#### 生产环境部署

**后端：**
```bash
cd src/backend
uv sync
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

**前端：**
```bash
cd src/frontend
pnpm install
pnpm build
# 使用 nginx 或其他静态服务器托管 dist/ 目录
```

---

## 响应式设计

### 设备适配

| 设备类型 | 屏幕宽度 | 布局方式 |
|---------|---------|---------|
| 大屏电脑 | >= 1200px | 多栏布局 |
| 中屏电脑/平板横屏 | 768px - 1199px | 两栏布局 |
| 平板竖屏 | 576px - 767px | 单栏/部分双栏 |
| 手机 | < 576px | 单栏布局 |

### 浏览器兼容性

| 浏览器 | 支持版本 |
|-------|---------|
| Chrome | 最新2个版本 |
| Safari | 最新2个版本 |
| Firefox | 最新2个版本 |
| Edge | 最新2个版本 |
| 微信内置浏览器 | 支持 |
| QQ内置浏览器 | 支持 |

---

## 注意事项

1. **认证**: 所有需要认证的 API 都需要在 Header 中携带 `Authorization: Bearer <token>`
2. **CORS**: 后端已配置允许所有来源，生产环境需要修改
3. **数据库**: 使用 SQLite，生产环境建议切换到 PostgreSQL
4. **AI 服务**: 使用 ModelScope API，有主备模型切换机制
5. **状态持久化**: 使用 Zustand 的 persist 中间件，存储在 localStorage

---

## 常用命令速查

```bash
# 后端
cd src/backend && uv run uvicorn main:app --reload    # 启动开发服务器
cd src/backend && uv run pytest                        # 运行测试
cd src/backend && uv run python init_db.py             # 初始化数据库

# 前端
cd src/frontend && pnpm dev                            # 启动开发服务器
cd src/frontend && pnpm build                          # 构建生产版本
cd src/frontend && pnpm test                           # 运行测试
```

---

## 许可证

MIT License
