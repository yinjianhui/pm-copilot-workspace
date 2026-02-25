# PM Copilot Workspace - TODO

> 分析时间：2026-02-25
> 项目状态：基础框架完成，核心功能部分实现

---

## 项目概览

PM Copilot Workspace 是一个面向产品经理的 AI 辅助工作区，使用 FastAPI (后端) + React/TypeScript (前端) 构建。

### 技术栈
- **后端**: FastAPI + SQLAlchemy + SQLite
- **前端**: React 18 + TypeScript + Vite + Redux Toolkit + Tailwind CSS
- **AI**: Anthropic Claude / OpenAI GPT (待集成)

### 完成度评估
- **后端**: ~40% (基础 CRUD 完成，AI 功能缺失)
- **前端**: ~80% (主要 UI 完成，部分功能缺失)
- **整体**: ~60%

---

## 1. 已完成功能

### 1.1 后端 (FastAPI)

#### 项目基础设施
- [x] FastAPI 应用初始化 (`backend/app/main.py`)
- [x] CORS 中间件配置
- [x] 环境配置系统 (`backend/app/config.py`)
- [x] 数据库会话管理 (`backend/app/db/session.py`)
- [x] 数据库初始化脚本 (`backend/app/db/init_db.py`)

#### 数据模型 (`backend/app/models/`)
- [x] Workspace - 工作区模型
- [x] Epic - Epic 模型
- [x] Requirement - 需求模型
- [x] Task - 任务模型（仅定义，无 API）
- [x] RequirementCard - 需求卡片模型（仅定义，无 API）

#### API 端点 (`backend/app/api/v1/`)
- [x] `/api/v1/health` - 健康检查
- [x] `/api/v1/workspaces` - GET/POST/PUT/DELETE
- [x] `/api/v1/epics` - GET/POST/PUT/DELETE
- [x] `/api/v1/requirements` - GET/POST/PUT/DELETE

#### 数据验证 (`backend/app/schemas/`)
- [x] Workspace Pydantic Schemas
- [x] Epic Pydantic Schemas
- [x] Requirement Pydantic Schemas
- [x] Task Pydantic Schemas
- [x] RequirementCard Pydantic Schemas

### 1.2 前端 (React + TypeScript)

#### 项目基础设施
- [x] Vite 项目配置
- [x] React Router 路由配置
- [x] Redux Toolkit 状态管理
- [x] Axios API 客户端（含认证拦截器）
- [x] Tailwind CSS 样式系统

#### 页面组件 (`frontend/src/pages/`)
- [x] `WorkspaceList` - 工作区列表页
- [x] `EpicDetail` - Epic 详情页
- [x] `RequirementDetail` - 需求详情页
- [x] `PRDEditor` - PRD 编辑器页

#### 业务组件 (`frontend/src/components/`)
- [x] `WorkspaceCard` - 工作区卡片
- [x] `EpicCard` - Epic 卡片
- [x] `RequirementCard` - 需求卡片
- [x] `ConversationView` - AI 对话视图

#### 通用 UI 组件 (`frontend/src/components/common/`)
- [x] `Button` - 按钮组件
- [x] `Card` - 卡片组件
- [x] `Modal` - 模态框组件
- [x] `LoadingSpinner` - 加载动画

#### 状态管理 (`frontend/src/store/`)
- [x] `workspaceSlice` - 工作区状态
- [x] `epicSlice` - Epic 状态
- [x] `requirementSlice` - 需求状态
- [x] `conversationSlice` - 对话状态（完整实现）
- [x] `prdSlice` - PRD 状态（完整实现）

#### API 服务层 (`frontend/src/services/`)
- [x] `workspaceService` - 工作区 API
- [x] `epicService` - Epic API
- [x] `requirementService` - 需求 API
- [x] `conversationService` - 对话 API（等待后端）
- [x] `prdService` - PRD API（等待后端）

#### 类型定义 (`frontend/src/types/`)
- [x] `workspace.ts`
- [x] `epic.ts`
- [x] `requirement.ts`
- [x] `conversation.ts`
- [x] `prd.ts`

---

## 2. 部分实现功能（前端完成，后端缺失）

### 2.1 AI 对话功能

#### 前端状态：已完成
- [x] `ConversationView` 对话界面组件
- [x] Redux 状态管理（conversationSlice）
- [x] API 服务封装（conversationService）
- [x] 消息气泡展示
- [x] 发送消息逻辑
- [x] 错误处理 UI

#### 后端状态：缺失
- [ ] `backend/app/api/v1/conversations.py` - 对话 API 端点
  - [ ] `GET /requirements/{id}/conversations` - 获取对话列表
  - [ ] `GET /conversations/{id}` - 获取单个对话
  - [ ] `GET /conversations/{id}/messages` - 获取消息历史
  - [ ] `POST /conversations/{id}/messages` - 发送消息
  - [ ] `POST /requirements/{id}/conversations` - 创建对话
- [ ] `backend/app/models/conversation.py` - 对话数据模型
- [ ] `backend/app/models/message.py` - 消息数据模型
- [ ] `backend/app/services/ai.py` - AI 服务集成
  - [ ] Anthropic Claude API 集成
  - [ ] OpenAI GPT API 集成
  - [ ] 对话上下文管理
  - [ ] 流式响应支持

#### 文件位置
- 前端: `frontend/src/components/requirement/ConversationView.tsx:1`
- 前端 Service: `frontend/src/services/conversation.ts:1`
- 前端 Slice: `frontend/src/store/conversationSlice.ts:1`

### 2.2 PRD 生成功能

#### 前端状态：已完成
- [x] `PRDEditor` PRD 编辑器页面
- [x] Redux 状态管理（prdSlice）
- [x] API 服务封装（prdService）
- [x] PRD 字段编辑
- [x] AI 生成按钮
- [x] 保存/更新逻辑

#### 后端状态：缺失
- [ ] `backend/app/api/v1/prds.py` - PRD API 端点
  - [ ] `GET /requirements/{id}/prd` - 获取 PRD
  - [ ] `POST /requirements/{id}/prd` - 创建 PRD
  - [ ] `PUT /prds/{id}` - 更新 PRD
  - [ ] `DELETE /prds/{id}` - 删除 PRD
  - [ ] `POST /requirements/{id}/prd/generate` - AI 生成 PRD
- [ ] `backend/app/models/prd.py` - PRD 数据模型
- [ ] `backend/app/models/prd_section.py` - PRD 章节模型
- [ ] `backend/app/services/prd_generator.py` - PRD 生成服务
  - [ ] AI Prompt 模板系统
  - [ ] PRD 结构化生成
  - [ ] 版本控制

#### 文件位置
- 前端页面: `frontend/src/pages/PRDEditor.tsx:1`
- 前端 Service: `frontend/src/services/prd.ts:1`
- 前端 Slice: `frontend/src/store/prdSlice.ts:1`

### 2.3 Task 管理

#### 前端状态：缺失
- [ ] Task 列表组件
- [ ] Task 看板视图
- [ ] Task 详情页
- [ ] Task 创建/编辑表单

#### 后端状态：模型定义完成，API 缺失
- [x] `backend/app/models/task.py` - Task 模型已定义
- [x] `backend/app/schemas/task.py` - Task Schema 已定义
- [ ] `backend/app/api/v1/tasks.py` - Task API 端点
  - [ ] `GET /requirements/{id}/tasks` - 获取任务列表
  - [ ] `GET /tasks/{id}` - 获取单个任务
  - [ ] `POST /tasks` - 创建任务
  - [ ] `PUT /tasks/{id}` - 更新任务
  - [ ] `DELETE /tasks/{id}` - 删除任务
  - [ ] `PATCH /tasks/{id}/status` - 更新任务状态

#### 文件位置
- 后端模型: `backend/app/models/task.py:1`
- 后端 Schema: `backend/app/schemas/task.py:1`

### 2.4 Requirement Card 功能

#### 前端状态：部分实现
- [x] `RequirementCard` 基础卡片组件
- [ ] Card 可视化编辑器
- [ ] Card 拖拽排序
- [ ] Card 模板选择

#### 后端状态：模型定义完成，API 缺失
- [x] `backend/app/models/requirement_card.py` - RequirementCard 模型已定义
- [x] `backend/app/schemas/requirement_card.py` - RequirementCard Schema 已定义
- [ ] `backend/app/api/v1/requirement_cards.py` - Card API 端点
  - [ ] `GET /requirements/{id}/card` - 获取需求卡片
  - [ ] `POST /requirement_cards` - 创建卡片
  - [ ] `PUT /requirement_cards/{id}` - 更新卡片
  - [ ] `DELETE /requirement_cards/{id}` - 删除卡片

#### 文件位置
- 后端模型: `backend/app/models/requirement_card.py:1`
- 后端 Schema: `backend/app/schemas/requirement_card.py:1`
- 前端组件: `frontend/src/components/requirement/RequirementCard.tsx:1`

---

## 3. 未实现功能

### 3.1 用户认证与授权

#### 后端
- [ ] `backend/app/api/v1/auth.py` - 认证 API
  - [ ] `POST /auth/register` - 用户注册
  - [ ] `POST /auth/login` - 用户登录
  - [ ] `POST /auth/logout` - 用户登出
  - [ ] `POST /auth/refresh` - 刷新令牌
- [ ] `backend/app/models/user.py` - 用户模型
- [ ] `backend/app/api/deps.py` - JWT 认证依赖
- [ ] ] API 访问保护中间件
- [ ] ] 角色权限系统

#### 前端
- [ ] 登录页面 (`frontend/src/pages/Login.tsx`)
- [ ] 注册页面 (`frontend/src/pages/Register.tsx`)
- [ ] 个人设置页面
- [ ] ] ProtectedRoute 路由守卫
- [ ] ] 认证状态管理

#### 依赖已安装
- `pyjwt==2.8.0`
- `passlib[bcrypt]==1.7.4`
- `python-jose[cryptography]==3.3.0`

### 3.2 向量存储与语义搜索

#### 后端
- [ ] `backend/app/services/vector_store.py` - 向量存储服务
  - [ ] ChromaDB 集成
  - [ ] 文档向量化
  - [ ] 语义搜索
  - [ ] 相似度匹配
- [ ] `backend/app/api/v1/search.py` - 搜索 API
  - [ ] `POST /search` - 语义搜索
  - [ ] `POST /documents` - 添加文档到向量库

#### 前端
- [ ] 全局搜索组件
- [ ] 搜索结果展示
- [ ] 相关内容推荐

#### 依赖已安装
- `chromadb==0.4.18`
- `faiss-cpu==1.7.4`

### 3.3 实时协作功能

#### 后端
- [ ] WebSocket 连接管理
- [ ] ] 实时消息推送
- [ ] ] 协作编辑同步

#### 前端
- [ ] WebSocket 客户端
- [ ] ] 实时更新通知
- [ ] ] 多用户协作指示

### 3.4 导出功能

#### 后端
- [ ] PDF 生成服务
- [ ] Markdown 导出
- [ ] ] 数据导出（JSON/CSV）

#### 前端
- [ ] 导出按钮
- [ ] ] 导出格式选择
- [ ] ] 导出进度显示

### 3.5 搜索与筛选

#### 后端
- [ ] ] 高级筛选 API
- [ ] ] 标签系统 API
- [ ] ] 全文搜索

#### 前端
- [ ] ] 搜索栏组件
- [ ] ] 筛选面板
- [ ] ] 标签选择器

---

## 4. 需要修复的问题

### 4.1 环境配置问题

#### 缺失文件
- [ ] `.env.example` - 环境变量示例文件
- [ ] ] `backend/.env` - 后端环境配置
- [ ] ] `frontend/.env` - 前端环境配置

#### 需要定义的环境变量
```bash
# 后端环境变量
DATABASE_URL=sqlite:///./pm_copilot.db
SECRET_KEY=your-secret-key-change-in-production
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key

# 前端环境变量
VITE_API_URL=http://localhost:8000/api/v1
```

### 4.2 数据库问题

- [ ] 缺少 Alembic 迁移脚本
  - [ ] `backend/alembic/versions/` 目录为空
- [ ] 缺少种子数据（seed data）
- [ ] 缺少数据库版本管理

### 4.3 错误处理问题

#### 后端
- [ ] 缺少全局异常处理中间件
- [ ] 缺少统一的错误响应格式
- [ ] 缺少日志系统

#### 前端
- [ ] 错误状态使用不统一
- [ ] 缺少全局错误提示组件
- [ ] ] 404 页面
- [ ] ] 500 错误页面

### 4.4 开发工具配置

#### 缺失配置文件
- [ ] Dockerfile（后端/前端）
- [ ] docker-compose.yml
- [ ] `.gitignore` 完善
- [ ] `.prettierrc` - Prettier 配置
- [ ] `.eslintrc.js` 完善
- [ ] CI/CD 配置 (`.github/workflows/`)
- [ ] ] 测试配置 (`pytest.ini`, `jest.config.js`)

### 4.5 技术债务

#### 未使用的依赖
- `chromadb==0.4.18` - 已导入但未使用
- `faiss-cpu==1.7.4` - 已导入但未使用

#### 代码质量问题
- 缺少代码格式化配置
- 缺少 lint 规则完善
- 缺少单元测试
- 缺少集成测试
- 缺少 API 测试

### 4.6 API 端点不一致

#### 前端期望但后端未实现的端点
- `/requirements/{id}/conversations` - 需求对话列表
- `/conversations/{id}/messages` - 对话消息
- `/conversations/{id}/messages` - 发送消息 (POST)
- `/requirements/{id}/prd` - PRD 获取/创建
- `/requirements/{id}/prd/generate` - AI 生成 PRD (POST)

---

## 5. 优先级建议

### P0 - 核心功能（必须完成）

1. **AI 对话功能**
   - 创建 `backend/app/models/conversation.py` 和 `message.py`
   - 创建 `backend/app/api/v1/conversations.py`
   - 实现 `backend/app/services/ai.py`（Anthropic/OpenAI 集成）
   - 配置 ANTHROPIC_API_KEY

2. **PRD 生成功能**
   - 创建 `backend/app/models/prd.py` 和 `prd_section.py`
   - 创建 `backend/app/api/v1/prds.py`
   - 实现 `backend/app/services/prd_generator.py`

3. **环境配置**
   - 创建 `.env.example`
   - 添加配置文档

4. **错误处理**
   - 添加全局异常处理中间件
   - 统一错误响应格式

### P1 - 重要功能（尽快完成）

1. **Task 管理 CRUD**
   - 创建 `backend/app/api/v1/tasks.py`
   - 前端 Task 列表组件

2. **用户认证系统**
   - 创建 `backend/app/models/user.py`
   - 创建 `backend/app/api/v1/auth.py`
   - 前端登录/注册页面

3. **数据库迁移**
   - 创建 Alembic 迁移脚本
   - 添加种子数据

4. **测试**
   - 添加单元测试
   - 添加 API 集成测试

### P2 - 增强功能（后续迭代）

1. **Requirement Card 编辑器**
   - 完整的 Card API
   - 可视化编辑器

2. **向量存储与语义搜索**
   - ChromaDB 集成
   - 搜索组件

3. **实时协作**
   - WebSocket 支持
   - 实时更新

4. **导出功能**
   - PDF/Markdown 导出

### P3 - 优化与完善

1. Docker 部署配置
2. CI/CD 流程
3. 性能优化
4. 文档完善
5. UI/UX 优化

---

## 6. 下一步行动

### 立即行动

1. **创建环境配置文件**
   ```bash
   # 创建 backend/.env.example
   # 创建 frontend/.env.example
   ```

2. **实现 AI 对话 API**
   - 添加 Conversation 和 Message 模型
   - 实现 conversations.py 路由
   - 集成 Anthropic Claude API

3. **实现 PRD 生成 API**
   - 添加 PRD 和 PRDSection 模型
   - 实现 prds.py 路由
   - 创建 PRD 生成 Prompt 模板

4. **测试与调试**
   - 启动后端: `cd backend && uvicorn app.main:app --reload`
   - 启动前端: `cd frontend && npm run dev`
   - 端到端测试基本流程

---

## 7. 项目文件树

```
pm-copilot-workspace/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── epics.py           ✅
│   │   │       ├── health.py          ✅
│   │   │       ├── requirements.py    ✅
│   │   │       ├── router.py          ✅
│   │   │       ├── workspaces.py      ✅
│   │   │       ├── conversations.py   ❌ 缺失
│   │   │       ├── prds.py            ❌ 缺失
│   │   │       ├── tasks.py           ❌ 缺失
│   │   │       ├── auth.py            ❌ 缺失
│   │   │       └── requirement_cards.py ❌ 缺失
│   │   ├── db/
│   │   │   ├── base.py                ✅
│   │   │   ├── init_db.py             ✅
│   │   │   └── session.py             ✅
│   │   ├── models/
│   │   │   ├── workspace.py           ✅
│   │   │   ├── epic.py                ✅
│   │   │   ├── requirement.py         ✅
│   │   │   ├── task.py                ✅ (仅定义)
│   │   │   ├── requirement_card.py    ✅ (仅定义)
│   │   │   ├── conversation.py        ❌ 缺失
│   │   │   ├── message.py             ❌ 缺失
│   │   │   ├── prd.py                 ❌ 缺失
│   │   │   ├── prd_section.py         ❌ 缺失
│   │   │   └── user.py                ❌ 缺失
│   │   ├── schemas/
│   │   │   ├── workspace.py           ✅
│   │   │   ├── epic.py                ✅
│   │   │   ├── requirement.py         ✅
│   │   │   ├── task.py                ✅ (仅定义)
│   │   │   └── requirement_card.py    ✅ (仅定义)
│   │   ├── services/
│   │   │   └── ai.py                  ❌ 缺失
│   │   ├── config.py                  ✅
│   │   └── main.py                    ✅
│   ├── requirements.txt               ✅
│   └── .env                           ❌ 缺失
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                ✅ 全部完成
│   │   │   ├── epic/
│   │   │   │   └── EpicCard.tsx       ✅
│   │   │   ├── requirement/
│   │   │   │   ├── ConversationView.tsx ✅ (等待后端)
│   │   │   │   └── RequirementCard.tsx ✅
│   │   │   └── workspace/
│   │   │       └── WorkspaceCard.tsx  ✅
│   │   ├── pages/
│   │   │   ├── WorkspaceList.tsx      ✅
│   │   │   ├── EpicDetail.tsx         ✅
│   │   │   ├── RequirementDetail.tsx  ✅
│   │   │   ├── PRDEditor.tsx          ✅ (等待后端)
│   │   │   ├── Login.tsx              ❌ 缺失
│   │   │   └── Register.tsx           ❌ 缺失
│   │   ├── store/
│   │   │   ├── workspaceSlice.ts      ✅
│   │   │   ├── epicSlice.ts           ✅
│   │   │   ├── requirementSlice.ts    ✅
│   │   │   ├── conversationSlice.ts   ✅ (等待后端)
│   │   │   └── prdSlice.ts            ✅ (等待后端)
│   │   ├── services/
│   │   │   ├── api.ts                 ✅
│   │   │   ├── workspace.ts           ✅
│   │   │   ├── epic.ts                ✅
│   │   │   ├── requirement.ts         ✅
│   │   │   ├── conversation.ts        ✅ (等待后端)
│   │   │   └── prd.ts                 ✅ (等待后端)
│   │   └── types/                     ✅ 全部完成
│   ├── package.json                   ✅
│   └── .env                           ❌ 缺失
│
├── Dockerfile                         ❌ 缺失
├── docker-compose.yml                 ❌ 缺失
└── .env.example                       ❌ 缺失
```

---

## 8. 关键发现

1. **前端领先后端**: 前端的 AI 对话和 PRD 功能已完全实现，但后端 API 尚未创建

2. **模型与 API 不匹配**: Task 和 RequirementCard 的数据模型已定义，但对应的 API 端点完全缺失

3. **AI 集成未完成**: 虽然 `anthropic` 和 `openai` 依赖已安装，但没有任何实际集成代码

4. **配置缺失**: 项目缺少 `.env.example` 和任何 Docker 部署配置

5. **依赖未使用**: `chromadb` 和 `faiss-cpu` 虽已安装但未实现任何功能
