import '@logseq/libs'
import { info, debug, referencesShortenerService } from './logic.ts'


const main = () => {
    info('loaded')

    const service = referencesShortenerService()

    setTimeout(() => service.start(), 1000)

    logseq.beforeunload(async () => {
        service.stop()
    })
}


logseq.ready(main).catch(console.error)
