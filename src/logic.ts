function linkAbbreviator(boundSelectors) {
  function onMouseAction(event) {
    const ref = event.target.parentElement
    if (!ref.dataset.abbreviatedText)
      return

    let text = ''
    if (event.type === 'mouseenter')
      text = ref.dataset.origText
    else if (event.type === 'mouseleave')
      text = ref.dataset.abbreviatedText

    if (text) {
      const isTag = ref.classList.contains('tag')
      const textNode = getTextNode(ref)
      if (textNode)
        textNode.textContent = (isTag ? '#' : '') + text
    }
  }

  function getTextNode(ref) {
    let textNode = null
    ref.childNodes.forEach((node) => {
      if (node.nodeType === document.TEXT_NODE)
        textNode = node
    })
    return textNode
  }

  function findContainerTitleForRef(namespacedRef, titleSelectors) {
    for (const [bubbleSelector, titleSelector, hierarchySelector] of titleSelectors) {
      const bubbleNode = namespacedRef.closest(bubbleSelector)
      if (!bubbleNode) {
        console.debug('shortlr: skip — wrong bubble', {bubbleSelector})
        continue
      }

      console.debug('shortlr:', {bubbleSelector, bubbleNode})

      const titleNode = bubbleNode?.querySelector(titleSelector)
      if (!titleNode) {
        console.debug('shortlr: skip — missing title', {titleSelector})
        continue
      }
      if (titleNode === namespacedRef) {
        console.debug('shortlr: skip — same as ref')
        continue
      }

      console.debug('shortlr: found title', {titleSelector, titleNode})

      if (titleNode.dataset.origText)
        return titleNode.dataset.origText

      const title = getTextNode(titleNode)?.textContent
      if (!title)
        return null

      let prefix = ''
      if (hierarchySelector) {
        document.querySelectorAll(hierarchySelector).forEach((node) => {
          const text = getTextNode(node)?.textContent ?? ''
          if (text)
            prefix += text + '/'
        })
      }

      return prefix + title
    }
    return null
  }

  function findCommonPrefix(text, title) {
    const parts = text.split('/')
    for (let i = 1; i < parts.length; i++) {
      const prefix = parts.slice(0, -i).join('/')
      if (prefix === title)
        return [ prefix, parts.slice(-i).join('/') ]
    }
    return [ null, null ]
  }

  function main(node, boundInfo) {
    for (const [refsSelectors, titleSelectors] of boundInfo) {
      for (const namespacedRef of node.querySelectorAll(refsSelectors)) {
        // skipping already abbreviated refs
        if (namespacedRef.dataset.abbreviatedText)
          continue

        const textNode = getTextNode(namespacedRef)
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

        console.debug('Ref:', {namespacedRef, origText})

        const title = findContainerTitleForRef(namespacedRef, titleSelectors)
        // skipping refs without corresponding title
        if (!title)
          continue

        console.debug('shortlr:', {title})

        const [ prefix, abbreviatedText ] = findCommonPrefix(origText, title)
        // skipping completely different refs
        if (!prefix)
          continue

        console.debug('shortlr:', {prefix, abbreviatedText})

        namespacedRef.dataset.origText = origText
        namespacedRef.dataset.abbreviatedText = abbreviatedText
        textNode.textContent = isTag ? '#' + abbreviatedText : abbreviatedText

        var anchor = document.createElement('span')
        anchor.innerText = '↳ '
        anchor.onmouseenter = onMouseAction
        anchor.onmouseleave = onMouseAction

        const first = namespacedRef.childNodes[0]
        if ((first.className ?? '').split(' ').includes('bracket'))
          first.insertAdjacentElement('afterend', anchor)
        else
          namespacedRef.insertAdjacentElement('afterbegin', anchor)
      }
    }
  }

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (!node.querySelectorAll)
          continue

        if (node.classList.contains('awLi-icon') || node.classList.contains('awLi-favicon'))
          continue

        console.debug('Check:', {node})

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

        console.debug('Select:', {node, boundInfo})
        main(node, boundInfo)
      }
    }
  })

  const container = document.querySelector('#app-container')
  observer.observe(container, {
    subtree: true,
    childList: true,
  })
 }

const refsSelectors = ['a.page-ref[data-ref*="/"]', 'a.tag[data-ref*="/"]']
const refsInBreadcrumbsSelectors = ['.breadcrumb span.inline-wrap > span.page-reference']

const prefixSelectors = (prefix, selectors) => selectors.map((s) => prefix + ' ' + s)

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
    [refsInBreadcrumbsSelectors, [
      ['div.sidebar-item', 'div.page-title > span.text-ellipsis'],
      ['div.sidebar-item', 'div.breadcrumb a.page-ref'],
    ]],
  ],
}

// linkAbbreviator(boundSelectors)
