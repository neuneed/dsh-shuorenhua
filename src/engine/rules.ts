/**
 * Rule definitions for dsh-shuorenhua.
 * Synthesized from:
 *   - MrGeDiao/shuorenhua (pruning empty conversational openers, closers, disclaimers)
 *   - op7418/Humanizer-zh (de-buzzwording, killing bureaucratic clichés)
 *   - nothing0here/humanizer-zh (natural rhythm, sentence structure de-bloat)
 */

/** Opening greeting regexes to strip. */
export const OPENING_GREETINGS: RegExp[] = [
  /^(好的|收到|没问题|当然可以|很高兴为您解答|感谢您的提问)[，！。、\s\n]*/i,
  /^(针对您提出的|关于您提到的|关于这个问题|针对您所说的问题)[^，。！？\n]*[，。：:\n\s]*/i,
  /^(这是一个非常(好|棒|深刻|经典|有趣)的问题)[，。！\n\s]*/i,
  /^(我来为您(详细)?(解答|分析|梳理|整理|说明|介绍))[，。！\n\s]*/i,
  /^(以下是为您(准备|整理|提供)的|下面为您详细介绍)[^：:\n]*[：:\n\s]*/i,
  /^(在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,\s]*)/i,
  /^(随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,\s]*)/i,
  /^(在(这个|如今)[^，,\n]*(时代|背景下)[，,\s]*)/i,
]

/** Closing boilerplate and disclaimer regexes to strip. */
export const CLOSING_BOILERPLATES: RegExp[] = [
  /(希望以上(解答|内容|方案|建议|信息)?(对您有所帮助|能帮到您|能解决您的问题|对您有用)[！。~]*\s*)+$/i,
  /(希望(对您有所帮助|能帮到您|能解决您的问题)[！。~]*\s*)+$/i,
  /(如果您还有(任何|其他)?(疑问|问题|需要|想法)，欢迎随时(向我提问|提问|告知我|联系我|深入探讨)[！。~]*\s*)+$/i,
  /(作为(一个)?AI(语言模型|助手)?，(我需要提醒您|请注意)[^。\n]*[。\n]?\s*)+$/i,
  /(请根据您的(实际情况|具体需求|业务场景)(进行调整|酌情参考|审慎选择)[！。]*\s*)+$/i,
  /(总而言之|综上所述|总的来说|总的来看)[，,][^\n。]*[。\n]?\s*$/i,
  /(如需进一步(了解|探讨|协助)，请随时(告诉我|留言)[！。~]*\s*)+$/i,
]

/** Buzzword mappings: bureaucratic/AI cliché -> plain natural word. */
export const BUZZWORD_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string; label: string }> = [
  { pattern: /赋能/g, replacement: '帮助', label: '赋能 -> 帮助' },
  { pattern: /抓手/g, replacement: '切入点', label: '抓手 -> 切入点' },
  { pattern: /闭环/g, replacement: '搞定', label: '闭环 -> 搞定' },
  { pattern: /深耕/g, replacement: '专注', label: '深耕 -> 专注' },
  { pattern: /打法/g, replacement: '做法', label: '打法 -> 做法' },
  { pattern: /壁垒/g, replacement: '门槛', label: '壁垒 -> 门槛' },
  { pattern: /背书/g, replacement: '支持', label: '背书 -> 支持' },
  { pattern: /底层逻辑/g, replacement: '基本原理', label: '底层逻辑 -> 基本原理' },
  { pattern: /顶层设计/g, replacement: '总体规划', label: '顶层设计 -> 总体规划' },
  { pattern: /颗粒度/g, replacement: '细节程度', label: '颗粒度 -> 细节程度' },
  { pattern: /对齐/g, replacement: '同步', label: '对齐 -> 同步' },
  { pattern: /打通/g, replacement: '连通', label: '打通 -> 连通' },
  { pattern: /矩阵/g, replacement: '组合', label: '矩阵 -> 组合' },
  { pattern: /载体/g, replacement: '形式', label: '载体 -> 形式' },
  { pattern: /发力点/g, replacement: '重点', label: '发力点 -> 重点' },
  { pattern: /组合拳/g, replacement: '多项举措', label: '组合拳 -> 多项举措' },
  { pattern: /痛点/g, replacement: '难点', label: '痛点 -> 难点' },
  { pattern: /标志着/g, replacement: '表明', label: '标志着 -> 表明' },
  { pattern: /彰显了/g, replacement: '体现出', label: '彰显了 -> 体现出' },
  { pattern: /凸显了/g, replacement: '说明', label: '凸显了 -> 说明' },
  { pattern: /毋庸置疑(的是)?[，,]?/g, replacement: '显然，', label: '毋庸置疑 -> 显然' },
  { pattern: /不可否认的是[，,]?/g, replacement: '确实，', label: '不可否认 -> 确实' },
  { pattern: /显而易见的是[，,]?/g, replacement: '显然，', label: '显而易见 -> 显然' },
  { pattern: /毫无疑问(的是)?[，,]?/g, replacement: '显然，', label: '毫无疑问 -> 显然' },
  { pattern: /发挥着至关重要的作用/g, replacement: '非常重要', label: '至关重要 -> 非常重要' },
  { pattern: /扮演着不可或缺的角色/g, replacement: '不可或缺', label: '不可或缺的角色 -> 不可或缺' },
  { pattern: /值得注意的是[，,]?/g, replacement: '注意：', label: '值得注意 -> 注意' },
  { pattern: /需要指出的是[，,]?/g, replacement: '提示：', label: '需要指出 -> 提示' },
]

/** Empty filler sentences inside text. */
export const FILLER_SENTENCES: RegExp[] = [
  /在当今[^，,\n]*(世界|社会|时代|浪潮)[^，,\n]*[，,]/g,
  /随着[^，,\n]*(飞速发展|迅猛发展|日益普及|不断进步|广泛应用)[^，,\n]*[，,]/g,
  /在(这个|如今)[^，,\n]*(时代|背景下)[，,]/g,
]
