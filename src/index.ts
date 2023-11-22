import '@logseq/libs'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

import { referencesShortenerService } from './logic.ts'
import { insertContent, p } from './utils.ts'


const main = async () => {
    console.log(p`loaded`)

    const service = referencesShortenerService()
    setTimeout(() => service.start(), 1000)

    logseq.beforeunload(async () => {
        service.stop()
    })

    logseq.Editor.registerSlashCommand('Reference to ./sub-page', async (e) => {
        const block = await logseq.Editor.getCurrentBlock() as BlockEntity
        const page = await logseq.Editor.getPage(block.page.id)
        const title = page!.originalName

        const prefix = `${title}/`

        await insertContent(`[[${prefix}]]`, { positionIndex: -3 })
    })

    logseq.Editor.registerSlashCommand('Reference to ../sibling-page', async (e) => {
        const block = await logseq.Editor.getCurrentBlock() as BlockEntity
        const page = await logseq.Editor.getPage(block.page.id)
        const title = page!.originalName

        if (title.indexOf('/') === -1) {
            await insertContent('[[]]', { positionIndex: -3 })
            return
        }

        const parts = title.split('/')
        parts.pop()
        const prefix = parts.join('/')

        await insertContent(`[[${prefix}/]]`, { positionIndex: -3 })
    })

    await notifyUser()
}


function notifyUser() {
    if (!logseq.settings!.notifications)
        logseq.settings!.notifications = {}

    const previousPluginVersion = logseq.settings!.notifications.previousPluginVersion
    const currentPluginVersion = logseq.baseInfo.version

    // Notify only old users
    if (currentPluginVersion !== previousPluginVersion) {
        if (!logseq.settings!.notifications.introducedSubPagesCommand) {
            logseq.UI.showMsg(
                `[:div
                    [:p [:code "👁‍🗨 Shorten My Links"] [:br]
                        [:p [:i "The fast way of referencing sub pages"]]
                        [:p "Just type-in " [:code "«/.»"] " and select " [:br]
                            [:code "Reference to ./sub-page"] " or " [:br]
                            [:code "Reference to ../sibling-page"] ]]
                    [:p "See details "
                        [:a {:href "https://github.com/stdword/logseq13-shorten-my-links#2-to-have-a-very-fast-way-of-creating-or-referencing-sub-pages"}
                            "here"] "."]
                ]`,
                'info', {timeout: 60000})
            logseq.updateSettings({notifications: {introducedSubPagesCommand: true}})
        }
    }

    logseq.updateSettings({notifications: {previousPluginVersion: currentPluginVersion}})
}


logseq.ready(main).catch(console.error)
