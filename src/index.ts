import '@logseq/libs'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { referencesShortenerService } from './logic.ts'
import { insertContent, p } from './utils.ts'


const main = () => {
    console.log(p`loaded`)

    const service = referencesShortenerService()
    setTimeout(() => service.start(), 1000)

    logseq.beforeunload(async () => {
        service.stop()
    })

    logseq.Editor.registerSlashCommand('Create ref to ./sub-page', async (e) => {
        const page = (await logseq.Editor.getCurrentPage())!
        const prefix = page.originalName

        await insertContent(`[[${prefix}/]]`, { positionIndex: -3 })
    })

    logseq.Editor.registerSlashCommand('Create ref to ../sibling-page', async (e) => {
        const page = (await logseq.Editor.getCurrentPage())!
        if (page.originalName.indexOf('/') === -1) {
            await insertContent(`[[]]`, { positionIndex: -3 })
            return
        }

        const parts = page.originalName.split('/')
        parts.pop()
        const prefix = parts.join('/')

        await insertContent(`[[${prefix}/]]`, { positionIndex: -3 })
    })
}


logseq.ready(main).catch(console.error)
