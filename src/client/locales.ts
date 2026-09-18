/**
 * Client locale strings for dsh-shuorenhua.
 */

export const NS = 'shuorenhua'

export const zh = {
  'action.button': '说人话',
  'action.tooltip': '说人话 · AI 深度去味润色',
  'modal.title': '说人话 · 去 AI 味润色',
  'modal.desc': '深度融合三大开源规则体系，AI 实时重写真实、通俗、无套话的自然人话',
  'status.generating': 'AI 正在润色转化中...',
  'status.completed': 'AI 润色完成',
  'status.offline': '离线规则润色',
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
  'btn.regenerate': '重新润色',
  'empty.tip': '暂未获取到本轮回答的文本内容',
}

export const en = {
  'action.button': 'Humanize',
  'action.tooltip': 'Speak Human · De-AI & Simplify',
  'modal.title': 'Speak Human · De-AI & Simplify',
  'modal.desc': 'Synthesized from 3 open-source humanizer rules, rewrites AI fluff into authentic human speech.',
  'status.generating': 'AI is humanizing text...',
  'status.completed': 'Humanized with AI',
  'status.offline': 'Local Rule Mode',
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
  'btn.regenerate': 'Regenerate',
  'empty.tip': 'No text detected for this message round.',
}

export type ShuorenhuaKey = keyof typeof zh
