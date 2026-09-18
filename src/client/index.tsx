/**
 * dsh-shuorenhua Client plugin entry for DeepSeek Harness Web UI.
 * Injects the "说人话" button into `conversation.chat.assistant-actions`.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { ShuorenhuaButton } from './components/ShuorenhuaButton.tsx'
import { en, NS, zh, type ShuorenhuaKey } from './locales.ts'

export const name = 'dsh-shuorenhua'
export const inject = ['slots', 'locale']

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    shuorenhua: ShuorenhuaKey
  }
}

/**
 * Apply the Client-side Shuorenhua plugin to the browser Cordis Context.
 * @param ctx - Browser Client root context.
 */
export function apply(ctx: ClientContext): void {
  // 1. Register i18n copy dictionaries
  ctx.effect(() => {
    try {
      const localeService = (ctx as any).locale
      if (localeService && typeof localeService.register === 'function') {
        return localeService.register(NS, { zh, en })
      }
    } catch {
      // locale service not ready
    }
    return () => {}
  }, 'dsh-shuorenhua: dictionaries')

  // 2. Inject the action button into finalized assistant message actions row
  ctx.slots.inject('conversation.chat.assistant-actions' as any, () =>
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions' as any,
        id: 'shuorenhua',
        order: 12,
        locale: NS,
      },
      ShuorenhuaButton as any,
    ),
  )
}

export { ShuorenhuaButton } from './components/ShuorenhuaButton.tsx'
export { ShuorenhuaModal } from './components/ShuorenhuaModal.tsx'
export * from './locales.ts'
