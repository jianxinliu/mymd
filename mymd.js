const RegExps = {
    isTitle: /#+\s(.*?)$/,
    isColor: /#(.*?)\{(.*?)\}/g,
    isBold: /\*\*(.+?)\*\*/g,
    isItalics: /\*(.+?)\*/g,
    isOrderList: /^\d\.\s(.*?)$/,
    isUnOrderList: /^\-\s(.*?)$/
}
const MAX_TITLE = 6
const BASE_TITLE_FONT_SIZE = 5
const STEP_FONT_SIZE = 3

function compileMd(text = '') {
    const rows = text.split('\n')
    let rowsRet = []
    for (let i = 0; i < rows.length;) {
        const row = rows[i]
        if (RegExps.isTitle.test(row)) {
            rowsRet.push(color(title(row)))
        } else if (RegExps.isOrderList.test(row)) {
            let liList = []
            while (RegExps.isOrderList.test(rows[i])) {
                const c = rows[i++].match(RegExps.isOrderList)
                if (c) {
                    liList.push(`<li>${simpleRow(c[1])}</li>`)
                }
            }
            i--
            rowsRet.push(`<ol style="list-style: decimal; margin-left: 0px">${liList.join('')}</ol>`)
        } else if (RegExps.isUnOrderList.test(row)) {
            let liList = []
            while (RegExps.isUnOrderList.test(rows[i])) {
                const c = rows[i++].match(RegExps.isUnOrderList)
                if (c) {
                    liList.push(`<li>${simpleRow(c[1])}</li>`)
                }
            }
            i--
            rowsRet.push(`<ul style="list-style: disc; margin-left: 0px">${liList.join('')}</ul>`)
        } else {
            rowsRet.push(makeSpan(simpleRow(row)))
        }
        i++;
    }
    return `<div>${rowsRet.map(v => v || '</br>').join('')}</div>`
}

function simpleRow(input = '') {
    let isBold = true
    let isItalics = true
    let isColor = true
    let iRow = input
    while (isBold || isItalics || isColor) {
        iRow = color(italics(bold(iRow)))
        isBold = RegExps.isBold.test(iRow)
        isItalics = RegExps.isItalics.test(iRow)
        isColor = RegExps.isColor.test(iRow)
    }
    return iRow
}

function title(input = '') {
    const reg = RegExps.isTitle
    const isTitle = reg.test(input)
    if (isTitle) {
        const hashes = input.split(' ')[0].split('')
        const legal = hashes.every(e => e === '#')
        if (!legal) {
            return input
        } else {
            let n = hashes.length
            if (n > MAX_TITLE) {
                alert(`暂不支持 ${n} 级标题`)
                throw Error(`暂不支持 ${n} 级标题`)
            }
            const borderWidth = n == 1 ? 2 : 1
            const titleStyle = `font-weight: bold; font-size: ${(MAX_TITLE - n) * STEP_FONT_SIZE + BASE_TITLE_FONT_SIZE}px; border-bottom: ${borderWidth}px solid black; padding: 0px 0px 2px 2px;margin-bottom: 10px`
            return input.replace(reg, `<p style="${titleStyle}">$1</p>`)
        }
    } else {
        return input
    }
}

function color(input = '') {
    const reg = RegExps.isColor
    return input.replace(reg, '<span style="color: $1">$2</span>')
}

function makeSpan(input = '') {
    if (!input) {
        return ''
    }
    return `<p style="margin: 5px 0px">${input}</p>`
}

function bold(input = '') {
    const reg = RegExps.isBold
    return input.replace(reg, '<span style="font-weight: bold">$1</span>')
}

function italics(input = '') {
    const reg = RegExps.isItalics
    return input.replace(reg, '<span style="font-style: italic">$1</span>')
}