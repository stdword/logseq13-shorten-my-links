import '@logseq/libs'


const main = () => {
    logseq.UI.showMsg(
        `[:p "Hello!"]`,
        'info',
        {timeout: 5000},
    )
}


logseq.ready(main).catch(console.error)
