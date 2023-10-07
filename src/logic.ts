import { logseq as packageInfo } from '../package.json'


export function info(...values: any[]) {
    console.info(`#${packageInfo.id}: `, ...values)
}


export function debug(...values: any[]) {
    return;  // disable debug messages

    console.debug(`#${packageInfo.id}: `, ...values)
}


function changeText(ref: HTMLElement, opts: {toOrig: boolean}) {
    const { toOrig } = opts

    let text = ''
    if (toOrig)
        text = ref.dataset.origText ?? ''
    else
        text = ref.dataset.abbreviatedText ?? ''

    if (!text)
        return

    const isTag = ref.classList.contains('tag')
    const textNode = getTextNode(ref)
    if (textNode)
        textNode.textContent = (isTag ? '#' : '') + text
}


function getTextNode(ref: HTMLElement): ChildNode | undefined {
    let textNode: ChildNode | undefined
    ref.childNodes.forEach((node) => {
        if (node.nodeType === document.TEXT_NODE)
            textNode = node
    })
    return textNode
}


function findCommonPrefix(text: string, title: string): [string?, string?] {
    const parts = text.split('/')
    for (let i = 1; i < parts.length; i++) {
        const prefix = parts.slice(0, -i).join('/')
        if (prefix === title)
            return [ prefix, parts.slice(-i).join('/') ]
    }
    return [ undefined, undefined ]
}


function findContainerTitleForRef(
    namespacedRef: HTMLElement,
    titleSelectors: string[][],
): string | undefined {
    for (const [bubbleSelector, titleSelector, hierarchySelector] of titleSelectors) {
        const bubbleNode = namespacedRef.closest(bubbleSelector)
        if (!bubbleNode) {
            debug('skip — wrong bubble', {bubbleSelector})
            continue
        }

        debug({bubbleSelector, bubbleNode})

        const titleNode: HTMLElement | null = bubbleNode?.querySelector(titleSelector)
        if (!titleNode) {
            debug('skip — missing title', {titleSelector})
            continue
        }
        if (titleNode === namespacedRef) {
            debug('skip — same as ref')
            continue
        }

        debug('found title', {titleSelector, titleNode})

        if (titleNode.dataset.origText)
            return titleNode.dataset.origText

        const title = getTextNode(titleNode)?.textContent
        if (!title)
            return undefined

        let prefix = ''
        if (hierarchySelector) {
            top!.document.querySelectorAll(hierarchySelector).forEach((node) => {
                const text = getTextNode(node as HTMLElement)?.textContent ?? ''
                if (text)
                    prefix += text + '/'
            })
        }

        return prefix + title
    }
    return undefined
}


function createReferencesObserver(boundSelectors) {
    function onMouseAction(event: Event) {
        const ref = (event.target as Node).parentElement
        if (!ref)
            return

        if (event.type === 'mouseenter')
            changeText(ref, {toOrig: true})
        else if (event.type === 'mouseleave')
            changeText(ref, {toOrig: false})
    }

    function main(node: HTMLElement, boundInfo: Array<[string, string[][]]>) {
        for (const [refsSelectors, titleSelectors] of boundInfo) {
            for (const namespacedRef_ of node.querySelectorAll(refsSelectors)) {
                const namespacedRef = namespacedRef_ as HTMLElement

                // skipping already abbreviated refs
                if (namespacedRef.dataset.abbreviatedText)
                    continue

                const textNode = getTextNode(namespacedRef)!
                let origText = textNode?.textContent ?? ''

                // skipping refs without namespaces
                if (origText.indexOf('/') < 0)
                    continue

                const isTag = namespacedRef.classList.contains('tag')
                origText = isTag ? origText.substring(1) : origText

                // skipping refs with manual labels
                if (namespacedRef.dataset.ref)
                    if (namespacedRef.dataset.ref.toLowerCase() !== origText.toLowerCase())
                        continue

                debug('Ref:', {namespacedRef, origText})

                const title = findContainerTitleForRef(namespacedRef, titleSelectors)
                // skipping refs without corresponding title
                if (!title)
                    continue

                debug({title})

                const [ prefix, abbreviatedText ] = findCommonPrefix(origText, title)
                // skipping completely different refs
                if (!abbreviatedText)
                    continue

                debug({prefix, abbreviatedText})

                namespacedRef.dataset.origText = origText
                namespacedRef.dataset.abbreviatedText = abbreviatedText
                textNode.textContent = isTag ? '#' + abbreviatedText : abbreviatedText

                var anchor = top!.document.createElement('span')
                anchor.innerText = '↳ '
                anchor.classList.add(anchorClass)
                anchor.onmouseenter = onMouseAction
                anchor.onmouseleave = onMouseAction

                const first = namespacedRef.childNodes[0] as HTMLElement
                if ((first.className ?? '').split(' ').includes('bracket'))
                    first.insertAdjacentElement('afterend', anchor)
                else
                    namespacedRef.insertAdjacentElement('afterbegin', anchor)
            }
        }
    }

    const observerCallback = (mutationList) => {
        for (const mutation of mutationList) {
            for (const anyNode of mutation.addedNodes) {
                const node = anyNode as HTMLElement
                if (!node.querySelectorAll)
                    continue

                if (node.classList.contains('awLi-icon') || node.classList.contains('awLi-favicon'))
                    continue

                debug('Check:', {node})

                let boundInfo = null
                for (const boundSelector of Object.keys(boundSelectors)) {
                    // skipping nodes upper than monitored one
                    // required due to: observer need to be attached to existed at the application start nodes
                    if (!node.closest(boundSelector))
                        continue
                    boundInfo = boundSelectors[boundSelector]
                    break
                }
                if (!boundInfo)
                    continue

                debug('Select:', {node, boundInfo})
                main(node, boundInfo)
            }
        }
    }

    return new MutationObserver(observerCallback)
}


const anchorClass = 'shml-anchor'
const refsSelectors = ['a.page-ref[data-ref*="/"]', 'a.tag[data-ref*="/"]']
const refsInBreadcrumbsSelectors = ['.breadcrumb span.inline-wrap > span.page-reference']

const prefixSelectors = (prefix, selectors) => selectors.map((s) => prefix + ' ' + s).join(', ')

const boundSelectors = {
    '.cp__sidebar-main-content': [  // page content
        // pages tagged with
        [prefixSelectors('div.references.page-tags', refsSelectors), [
            ['div.page', 'div.ls-page-title span.title[data-ref]', '#hierarchyLinks > a.page-ref'],  // normal page view
        ]],

        // linked references section
        [prefixSelectors('div.references.page-linked div.foldable-title', refsSelectors), [
            ['div.page', 'div.ls-page-title span.title[data-ref]', '#hierarchyLinks > a.page-ref'],  // normal page view
        ]],
        [prefixSelectors('div.references.page-linked div.blocks-container', refsSelectors.concat(refsInBreadcrumbsSelectors)), [
            ['div.content > div > div.lazy-visibility', 'div.content a.page-ref'],
        ]],

        // page section
        [prefixSelectors('div.page > div:first-child', refsSelectors), [
            ['div.embed-page', 'section a.page-ref'],  // embedded page
            ['div.content > div > div.lazy-visibility', 'a.page-ref'],  // inline linked references
            ['div.page > div:first-child', 'div.ls-page-title span.title[data-ref]', '#hierarchyLinks > a.page-ref'],  // normal page view
            ['div.page > div:first-child', 'div.breadcrumb a.page-ref'], // zoomed-in block
        ]],
        [prefixSelectors('div.page > div:first-child', refsInBreadcrumbsSelectors), [
            ['div.content > div > div.lazy-visibility', 'a.page-ref'], // inline linked references
            ['div.breadcrumb', 'a.page-ref'], // zoomed-in block
        ]],
    ],

    '#right-sidebar': [  // right sidebar
        // pages tagged with
        [prefixSelectors('div.references.page-tags', refsSelectors), [
            ['div.sidebar-item', 'div.page-title > span.text-ellipsis'],
        ]],

        // linked references section
        [prefixSelectors('div.references.page-linked div.foldable-title', refsSelectors), [
            ['div.sidebar-item', 'div.page-title > span.text-ellipsis'],
        ]],
        [prefixSelectors('div.references.page-linked div.blocks-container', refsSelectors.concat(refsInBreadcrumbsSelectors)), [
            ['div.content > div > div.lazy-visibility', 'div.content a.page-ref'],
        ]],

        // sidebar content section
        [prefixSelectors('div.page > div:first-child', refsSelectors), [
            ['div.embed-page', 'section a.page-ref'],
            ['div.sidebar-item', 'div.page-title > span.text-ellipsis'],
            ['div.sidebar-item', 'div.breadcrumb a.page-ref'],
        ]],
        [prefixSelectors('', refsInBreadcrumbsSelectors), [
            ['div.sidebar-item', 'div.page-title > span.text-ellipsis'],
            ['div.sidebar-item', 'div.breadcrumb a.page-ref'],
        ]],
    ],
}


function resetReferences() {
    top!.document.querySelectorAll('.' + anchorClass).forEach((anchor) => {
        const ref = anchor.parentElement!
        ref.removeChild(anchor)
        if (ref.dataset!.origText) {
            changeText(ref, {toOrig: true})
            delete ref.dataset.origText
        }
        if (ref.dataset!.abbreviatedText)
            delete ref.dataset.abbreviatedText
    })
}


export function referencesShortenerService() {
    const observer = createReferencesObserver(boundSelectors)
    const api = {
        start: () => {
            const container = top!.document.querySelector('#app-container')!
            if (!container) {
                setTimeout(() => api.start(), 500)
                return
            }

            observer.observe(
                container, {
                subtree: true,
                childList: true,
            })
        },
        stop: () => {
            observer.disconnect()
            resetReferences()
        },
    }
    return api
}
