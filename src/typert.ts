/**
 * Host Typert model manifest for the shuorenhua Remote.
 */
import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry/types'
import { DSH_SHUORENHUA_INVOCATIONS } from './contract.js'

export const TYPERT_MANIFEST: TypertContribution = {
  package: 'dsh-shuorenhua',
  face: 'host',
  schemas: [],
  model: {
    services: [
      {
        key: 'shuorenhua',
        exportName: 'ShuorenhuaRuntime',
        description: 'Shuorenhua (Speak Human) text simplification and de-AI-cliché service.',
        tags: [],
        members: [
          {
            kind: 'method',
            name: 'humanize',
            signature: 'humanize(text: string): Promise<HumanizeResult>',
          },
        ],
        types: [],
      },
    ],
    events: [],
    objects: [],
  },
  invocations: DSH_SHUORENHUA_INVOCATIONS,
}
