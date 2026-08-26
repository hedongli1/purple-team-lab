# 紫队实验台 · Purple Team Lab ⚔️

**攻击模拟 → 检测验证** 的轻量级实验平台：用「红队的攻击手法」验证「蓝队的检测能力」，输出覆盖报告。

> ⚠️ **合规声明**：本仓库为**纯离线数据模拟**。所有"攻击告警"均为内置的示例数据（演示 IP、示例载荷特征），
> 代码不包含任何攻击载荷、不发起端口扫描 / 网络探测 / 真实攻击行为，断网环境亦可完整运行。
> 项目仅供安全研究与授权防护验证使用。

## ✅ 可验证状态

| 徽章 | 说明 |
| --- | --- |
| ![CI](https://img.shields.io/github/actions/workflow/status/hedongli1/purple-team-lab/ci.yml?branch=master&label=CI&logo=github) | 测试 + 构建流水线（Node 22/24，`npm test` 11 用例 + `vite build`），点击徽章可查看运行历史 |
| ![tests](https://img.shields.io/badge/tests-11%20passed-brightgreen) | 端到端接口测试全部通过（`node --test`，零框架依赖） |
| ![coverage](https://img.shields.io/badge/detection%20coverage-83%25-orange) | 12 个场景 → 10 命中 + 2 检测缺口（编码绕过 / DNS 隧道） |
| ![license](https://img.shields.io/github/license/hedongli1/purple-team-lab) | MIT |

> 本地复现：`cd server && npm install && npm test` → 11 个用例全部通过（需 Node ≥ 22）。

## 🎯 解决什么问题

安全运营的经典痛点：**告警规则到底有没有用？哪些攻击手法检不出？**
本平台用一个**可控闭环**回答它：

```
选用例（红队手法）→ 生成模拟告警（mss/软探针风格字段）
   → Sigma-lite 规则引擎匹配 → 命中 / 漏检（检测缺口）→ 覆盖率报告
```

## ✨ 特性

- **12 个攻击场景**（SQL 注入 ×2、XSS ×2、目录爆破、SSH/Web 爆破、Webshell、反弹 Shell、PowerShell 编码执行、横向移动、DNS 隧道），全部映射 MITRE ATT&CK 战术与技战术编号
- **12 条 Sigma-lite 检测规则**：`equals / contains / regex` 三种匹配算子，规则内 AND、算子内 OR
- **内置 2 个"检测缺口"演示**（双重 URL 编码绕过 XSS、DNS 高熵隧道），报告会明确标出漏检点与改进建议
- **黑金风格 Web 界面**（与本站博客/记账本同视觉语言）：场景库 / 验证任务 / 检测报告 三页
- **11 个端到端测试**（`node:test`，零测试框架依赖）
- **Docker Compose 一键启动**；数据落 SQLite（Node 内置 `node:sqlite`，零原生编译依赖）

## 🧱 技术栈

Vue 3 + Vite ｜ Express ｜ Node 内置 SQLite ｜ Sigma-lite 规则引擎 ｜ Docker

## 🚀 快速开始

环境要求：Node ≥ 22

```bash
# 后端（端口 3100）
cd server && npm install && npm start

# 前端（端口 5174，已配 /api 代理）
cd web && npm install && npm run dev
# 打开 http://localhost:5174
```

跑测试：`cd server && npm test`（11 个用例）

Docker 一键启动：`docker compose up -d` → 前端 http://localhost:8081

## 📡 API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/scenarios` | 攻击场景库（含模拟告警样本） |
| GET | `/api/rules` | 检测规则库 |
| POST | `/api/runs` | 发起验证任务 `{ scenarios: [slug...] }` |
| GET | `/api/runs` / `/api/runs/:id` | 任务列表 / 明细 |
| GET | `/api/report` | 汇总报告（覆盖率 + 缺口 + ATT&CK 分布） |

## 🗺️ 场景 × 战术覆盖

| 场景 | 战术 | 技战术 |
| --- | --- | --- |
| SQL 注入（UNION / 盲注） | TA0001 初始访问 | T1190 |
| XSS（反射 / 编码绕过） | TA0001 初始访问 | T1189 |
| 目录爆破扫描 | TA0043 侦察 | T1595 |
| SSH / Web 登录爆破 | TA0006 凭据访问 | T1110 |
| Webshell 上传（冰蝎特征） | TA0002 执行 | T1505 |
| 反弹 Shell | TA0011 C2 | T1059 |
| PowerShell 编码执行 | TA0002 执行 | T1059.001 |
| 横向移动（PSEXEC） | TA0008 横向移动 | T1021.002 |
| DNS 隧道 | TA0011 C2 | T1071.004 |

## 🎯 简历可以这样写

- 独立设计并实现紫队"攻击模拟 → 检测验证"实验台：内置 12 个 MITRE ATT&CK 攻击场景与 12 条 Sigma-lite 检测规则，覆盖初始访问、执行、凭据访问、横向移动、C2 等 6 大战术
- 自研规则匹配引擎，支持 equals/contains/regex 算子与 AND/OR 组合逻辑；通过受控实验识别出 2 类检测缺口（双重编码绕过、DNS 高熵隧道），并给出改进方案
- 全过程纯离线数据模拟，以符合实际的模拟告警（含数据源、源/目的 IP、协议、告警描述等字段）驱动验证，将检测工程验证流程工程化、可复现
- 编写 11 个端到端接口测试零依赖框架；前端 Vue3 黑金界面 + Docker Compose 一键部署

## 📄 License

MIT