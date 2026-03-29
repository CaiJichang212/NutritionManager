# AGENTS.md

## 项目概述

本项目是一个**营养健康管家 Web 应用**的 MVP 版本，旨在帮助用户记录日常饮食、监控营养摄入、通过拍照识别包装食品配料表，并提供 AI 驱动的个性化营养建议。

### 核心目标
- 快速验证产品核心价值
- 收集真实用户反馈
- 验证技术方案可行性
- 为后续迭代奠定基础

---

## 技术栈

### 后端 (Python)
| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | >=0.109.0 | Web 框架 |
| SQLAlchemy | >=2.0.0 | ORM |
| Pydantic | >=2.5.0 | 数据验证 |
| python-jose | >=3.3.0 | JWT 认证 |
| OpenAI | >=1.30.0 | AI 服务 (ModelScope) |
| SQLite | - | 数据库 |

### 前端 (TypeScript/React)
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | UI 框架 |
| React Router | 7.13.0 | 路由管理 |
| Zustand | 5.0.12 | 状态管理 |
| Radix UI | - | 无障碍组件库 |
| Tailwind CSS | 4.1.12 | 样式方案 |
| Vite | 6.3.5 | 构建工具 |
| Vitest | 1.3.1 | 测试框架 |
| Axios | 1.14.0 | HTTP 客户端 |
| Recharts | 2.15.2 | 图表库 |

---

## 项目结构

```
idea0329-figma/
├── docs/                          # 项目文档
│   ├── 需求文档-v8.1.1-figma.md    # 详细需求文档
│   └── 参考资料.md
├── src/
│   ├── backend/                   # 后端代码
│   │   ├── routers/               # API 路由
│   │   │   ├── auth.py            # 认证相关 API
│   │   │   ├── foods.py           # 食物相关 API
│   │   │   └── records.py         # 记录相关 API
│   │   ├── services/              # 业务服务
│   │   │   ├── ai_service.py      # AI 营养师服务
│   │   │   └── nutrition.py       # 营养计算服务
│   │   ├── tests/                 # 后端测试
│   │   ├── config.py              # 配置管理
│   │   ├── database.py            # 数据库连接
│   │   ├── main.py                # 应用入口
│   │   ├── models.py              # 数据模型
│   │   └── schemas.py             # Pydantic 模式
│   └── frontend/                  # 前端代码
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/    # UI 组件
│       │   │   │   ├── figma/     # Figma 相关组件
│       │   │   │   └── ui/        # 基础 UI 组件
│       │   │   ├── pages/         # 页面组件
│       │   │   ├── services/      # API 服务
│       │   │   ├── stores/        # Zustand 状态
│       │   │   ├── App.tsx        # 应用入口
│       │   │   ├── Root.tsx       # 根组件
│       │   │   └── routes.ts      # 路由配置
│       │   ├── styles/            # 样式文件
│       │   └── main.tsx           # 入口文件
│       ├── package.json
│       └── vite.config.ts
└── tests/                         # E2E 测试
```

---

## 开发指南

### 环境准备

#### 后端
```bash
cd src/backend
# 使用 uv 安装依赖
uv sync

# 或使用 pip
pip install -r requirements.txt
```

#### 前端
```bash
cd src/frontend
pnpm install
```

### 启动服务

#### 后端服务
```bash
cd src/backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端开发服务器
```bash
cd src/frontend
pnpm dev
```

### 运行测试

#### 后端测试
```bash
cd src/backend
uv run pytest
```

#### 前端测试
```bash
cd src/frontend
pnpm test
```

---

## 核心功能模块

### 1. 用户系统
- **认证方式**: 手机号 + 验证码 / 邮箱 + 密码
- **JWT Token**: 有效期 168 小时 (7天)
- **个人信息**: 性别、年龄、身高、体重、活动水平、健康目标

### 2. 食物识别与记录
- 扫码识别 (条形码)
- 拍照识别 (配料表/非包装食物)
- 图片上传
- 手动搜索
- 快捷选择

### 3. 营养数据中心
- 今日概览 (热量进度环、三大营养素进度条)
- 营养详情页
- 统一提醒中心

### 4. 健康评估系统
- 包装食品健康评分 (0-10分)
- NOVA 食品分类 (1-4级)
- 特定人群评估 (减脂/增肌/糖尿病/高血压)

### 5. AI 营养师
- 模型: Qwen/Qwen3.5-122B-A10B (主) / ERNIE-4.5-VL-28B-A3B-PT (备)
- 上下文感知: 用户健康目标、今日营养数据、历史饮食记录
- 功能: 智能问答、个性化建议、饮食规划

### 6. 数据报告
- 日报/周报自动生成
- 趋势分析
- 分享功能

---

## API 端点

### 认证 API (`/api/auth`)
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/register` | 用户注册 |
| POST | `/login` | 用户登录 |
| GET | `/me` | 获取当前用户信息 |
| PUT | `/profile` | 更新用户资料 |
| GET | `/nutrition-calculation` | 计算营养指标 |

### 食物 API (`/api/foods`)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 获取食物列表 |
| GET | `/{food_id}` | 获取食物详情 |
| GET | `/barcode/{barcode}` | 通过条形码查询 |
| POST | `/` | 创建食物 |

### 记录 API (`/api/records`)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 获取记录列表 |
| POST | `/` | 创建饮食记录 |
| PUT | `/{record_id}` | 更新记录 |
| DELETE | `/{record_id}` | 删除记录 |

### AI API
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/ai/chat` | AI 营养师对话 |

---

## 数据模型

### User (用户)
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

### Food (食物)
```python
- id: Integer (主键)
- name, brand, category, barcode: String
- calories, protein, fat, carbs, fiber, sugar, sodium: Float
- health_score: Integer (0-100)
- nova_class: Integer (1-4)
- ingredients, allergens: JSON
```

### DietRecord (饮食记录)
```python
- id: Integer (主键)
- user_id: Integer (外键)
- date: DateTime
- meal_type: Enum (breakfast/lunch/dinner/snack)
- foods: JSON
- total_calories, total_protein, total_fat, total_carbs: Float
```

---

## 前端页面路由

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

## 状态管理 (Zustand)

### authStore
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}
```

---

## 配置说明

### 后端配置 (config.py)
```python
SECRET_KEY: str           # JWT 密钥
DATABASE_URL: str         # 数据库连接
MODELSCOPE_API_KEY: str   # AI 服务 API Key
ACCESS_TOKEN_EXPIRE_HOURS: int = 168
```

### 前端配置
- API 基础 URL: `http://localhost:8000/api`
- 路径别名: `@` -> `./src`

---

## 响应式设计断点

| 设备类型 | 屏幕宽度 | 布局方式 |
|---------|---------|---------|
| 大屏电脑 | >= 1200px | 多栏布局 |
| 中屏电脑/平板横屏 | 768px - 1199px | 两栏布局 |
| 平板竖屏 | 576px - 767px | 单栏/部分双栏 |
| 手机 | < 576px | 单栏布局 |

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

# 前端
cd src/frontend && pnpm dev                            # 启动开发服务器
cd src/frontend && pnpm build                          # 构建生产版本
cd src/frontend && pnpm test                           # 运行测试
```
