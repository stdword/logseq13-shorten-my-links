import '@logseq/libs'
import { info, debug, referencesShortenerService } from './logic.ts'


const main = () => {
    logseq.UI.showMsg(
        `[:p "Hello!"]`,
        'info',
        {timeout: 5000},
    )
    info('loaded')

    const service = referencesShortenerService()

    setTimeout(() => service.start(), 1000)

    logseq.beforeunload(async () => {
        service.stop()
    })
}


logseq.ready(main).catch(console.error)
