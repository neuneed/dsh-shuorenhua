/**
 * Client locale strings for dsh-shuorenhua.
 */

export const NS = 'shuorenhua'

export const zh = {
  'action.button': '说人话',
  'action.tooltip': '说人话 · 去 AI 味润色',
  'modal.title': '说人话 · 去 AI 味润色',
  'modal.desc': '基于三大开源规则（shuorenhua + Humanizer-zh + 自然节律）一键消除AI空话寒暄与公文八股',
  'mode.natural': '自然人话',
  'mode.concise': '极简要点',
  'mode.code_first': '程序员直球',
  'stats.original': '原文字数',
  'stats.humanized': '润色字数',
  'stats.saved': '精简',
  'stats.openers': '消除开场',
  'stats.closers': '消除结尾',
  'stats.buzzwords': '消除套话',
  'copy.button': '一键复制',
  'copy.copied': '已复制 ✓',
  'close.button': '关闭 (ESC)',
  'tab.result': '润色结果',
  'tab.diff': '对比视图',
  'empty.tip': '暂未获取到本轮回答的文本内容',
}

export const en = {
  'action.button': 'Humanize',
  'action.tooltip': 'Speak Human · De-AI & Simplify',
  'modal.title': 'Speak Human · De-AI & Simplify',
  'modal.desc': 'Prune AI fluff, corporate jargon, and opening/closing clichés into clean human speech.',
  'mode.natural': 'Natural',
  'mode.concise': 'Concise',
  'mode.code_first': 'Code-First',
  'stats.original': 'Original',
  'stats.humanized': 'Polished',
  'stats.saved': 'Reduced',
  'stats.openers': 'Openers',
  'stats.closers': 'Closers',
  'stats.buzzwords': 'Buzzwords',
  'copy.button': 'Copy Text',
  'copy.copied': 'Copied ✓',
  'close.button': 'Close (ESC)',
  'tab.result': 'Result',
  'tab.diff': 'Compare',
  'empty.tip': 'No text detected for this message round.',
}

export type ShuorenhuaKey = keyof typeof zh
