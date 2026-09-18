/**
 * Typert wire contract for dsh-shuorenhua.
 */
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'

const dummySchema = {
  parse: (value: unknown) => value,
}

const strictCodec = (typeSymbol: string) => ({
  mode: 'strict' as const,
  typeSymbol,
  schema: dummySchema,
  create: () => dummySchema,
})

const jsonParam = (name: string, wire: string, typeSymbol: string) => ({
  name,
  wire,
  source: 'json' as const,
  codec: strictCodec(typeSymbol),
})

export const DSH_SHUORENHUA_INVOCATIONS: readonly InvocationDescriptor[] = [
  {
    id: 'dsh-shuorenhua#shuorenhua/humanize',
    service: 'shuorenhua',
    namespace: 'shuorenhua',
    method: 'humanize',
    invocation: { kind: 'direct' },
    parameters: [
      jsonParam('text', 'text', 'dsh-shuorenhua#Text'),
    ],
    result: strictCodec('dsh-shuorenhua#HumanizeResult'),
  },
]
