// Sigma-lite 规则匹配引擎：对「模拟告警 JSON」跑「检测规则 JSON」
// 匹配器语义：规则内 matchers 为 AND；单个 matcher 内 values 为 OR。
// op 支持三种：
//   equals  —— 字段值等于 values 中的任意一个
//   contains —— 字段值（不区分大小写）包含 values 中的任意一个
//   regex   —— 字段值匹配 values 中的任意一条正则

export function matchAlert(alert, rule) {
  const matchers = (rule && rule.matchers) || [];
  for (const m of matchers) {
    const raw = alert[m.field];
    if (raw === undefined || raw === null) return false;
    const values = Array.isArray(m.values) ? m.values : [m.values];
    const s = String(raw);
    let hit = false;
    switch (m.op) {
      case 'equals':
        hit = values.some((v) => s === String(v));
        break;
      case 'contains':
        hit = values.some((v) => s.toLowerCase().includes(String(v).toLowerCase()));
        break;
      case 'regex':
        hit = values.some((v) => {
          try {
            return new RegExp(String(v), 'i').test(s);
          } catch {
            return false;
          }
        });
        break;
      default:
        hit = values.some((v) => s === String(v));
    }
    if (!hit) return false;
  }
  return true;
}

// 对一批告警跑一条规则：命中了任意一条告警即算场景命中
export function matchScenario(alerts, rule) {
  if (!rule) return { matched: false, rule: null };
  for (const alert of alerts) {
    if (matchAlert(alert, rule)) {
      return { matched: true, rule: rule.slug };
    }
  }
  return { matched: false, rule: rule.slug };
}