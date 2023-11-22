import { logseq as packageInfo } from '../package.json'


/**
 * Tagged template printing function
 * @usage console.log(p`Hello, Logseq!`)
 * @usage console.debug(p``, {var})
 **/
export function p(strings: any, ...values: any[]): string {
    const raw = String.raw({raw: strings}, ...values)
    const space = raw ? ' ' : ''
    return `#${packageInfo.id}:${space}${raw}`
}

export function debug(...values: any[]) {
    return;  // disable debug messages

    console.debug(p``, ...values)
}

/**
 * Sleep for specified milliseconds
 **/
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Count substrings in string
 */
export function countOf(string: string, substring: string): number {
    if (substring.length === 0)
        return 0

    const matchedCount = string.length - string.replaceAll(substring, '').length
    return matchedCount / substring.length
}

/**
 * Find index of Nth substring in string
 */
export function indexOfNth(string: string, substring: string, count: number = 1): number | null {
    if (count <= 0)
        throw new Error('count param should be positive')

    const realCount = countOf(string, substring)
    if (count > realCount)
        return null

    return string.split(substring, count).join(substring).length
}

/**
 * @returns pair [UUID, false] in case of currently editing block
 * @returns pair [UUID, true] in case of selected block (outside of editing mode)
 * @returns null in case of none of the blocks are selected (outside of editing mode)
 */
export async function getChosenBlock(): Promise<[string, boolean] | null> {
    const selected = (await logseq.Editor.getSelectedBlocks()) ?? []
    const editing = await logseq.Editor.checkEditing()
    if (!editing && selected.length === 0)
        return null

    const isSelectedState = selected.length !== 0
    const uuid = isSelectedState ? selected[0].uuid : editing as string
    return [ uuid, isSelectedState ]
}


export async function insertContent(
    content: string,
    options: {
        positionOnNthText?: {count: number, text: string},
        positionBeforeText?: string,
        positionAfterText?: string,
        positionIndex?: number
    } = {},
): Promise<boolean> {
    // Bug-or-feature with Command Palette modal: Logseq exits editing state when modal appears
    // To handle this: use selected blocks — the editing block turns to selected

    const chosenBlock = await getChosenBlock()
    if (!chosenBlock) {
        console.warn(p`Attempt to insert content while not in editing state and no one block is selected`)
        return false
    }
    const [ uuid, isSelectedState ] = chosenBlock

    const { positionOnNthText, positionBeforeText, positionAfterText, positionIndex } = options
    let position: number | undefined
    if (positionOnNthText) {
        const { text, count } = positionOnNthText
        position = indexOfNth(content, text, count) ?? content.length
    }
    else if (positionBeforeText) {
        const index = content.indexOf(positionBeforeText)
        if (index !== -1)
            position = index
    }
    else if (positionAfterText) {
        const index = content.indexOf(positionAfterText)
        if (index !== -1)
            position = index + positionAfterText.length
    }
    else if (positionIndex) {
        const adjustedIndex = adjustIndexForLength(positionIndex, content.length)
        if (adjustedIndex < content.length)  // skip adjustedIndex == content.length
            position = adjustedIndex
    }

    if (isSelectedState) {
        await logseq.Editor.updateBlock(uuid, content)
        if (position !== undefined)
            await logseq.Editor.editBlock(uuid, { pos: position })
    } else {
        await logseq.Editor.insertAtEditingCursor(content)

        if (position !== undefined) {
            // need delay before getting cursor position
            await sleep(20)
            const posInfo = await logseq.Editor.getEditingCursorPosition()

            const relativePosition = posInfo!.pos - content.length + position
            console.debug(
                p`Calculating arg position`,
                posInfo!.pos, '-', content.length, '+', position, '===', relativePosition,
            )

            // try non-API way
            const done = setEditingCursorPosition(relativePosition)
            if (!done) {
                // API way: need to exit to perform entering on certain position
                await logseq.Editor.exitEditingMode()
                await sleep(20)

                await logseq.Editor.editBlock(uuid, { pos: relativePosition })
            }
        }
    }

    return true
}

/**
 * Sets the current editing block cursor position.
 * There is no need to check boundaries.
 * Negative indexing is supported.
 *
 * @param `pos`: new cursor position
 * @usage
 *  setEditingCursorPosition(0) — set to the start
 *  setEditingCursorPosition(-1) — set to the end
 *  setEditingCursorPosition(-2) — set before the last char
 */
export function setEditingCursorPosition(pos: number) {
    return setEditingCursorSelection(pos, pos)
}

function adjustIndexForLength(i, len) {
    if (i > len)
        i = len
    if (i < (-len - 1))
        i = -len - 1
    if (i < 0)
        i += len + 1
    return i
}

function _getEditingTextArea(): HTMLTextAreaElement | null {
    const editorElement = top!.document.getElementsByClassName('editor-wrapper')[0] as HTMLDivElement
    if (!editorElement)
        return null

    const textAreaElement = top!.document.getElementById(
        editorElement.id.replace(/^editor-/, '')
    ) as HTMLTextAreaElement
    if (!textAreaElement)
        return null

    return textAreaElement
}

export function setEditingCursorSelection(start: number, end: number) {
    const textAreaElement = _getEditingTextArea()
    if (!textAreaElement)
        return false

    const length = textAreaElement.value.length
    start = adjustIndexForLength(start, length)
    end = adjustIndexForLength(end, length)

    textAreaElement.selectionStart = start
    textAreaElement.selectionEnd = end
    return true
}

export const privateExports = {
    _getEditingTextArea,
}
