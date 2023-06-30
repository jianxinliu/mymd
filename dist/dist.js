const config = {
    "maxTitle": 6,
    "baseTitleFontSize": 5,
    "stepFontSize": 3
}

const RegExps = {
  isTitle: /#+\s(.*?)$/, // `# title`
  isColor: /#(.*?)\{(.*?)\}/g, // `#red{content}` `#ccc{content}` `#rgba(255,255,0,0.5){content}`
  isBold: /\*\*(.+?)\*\*/g, // `**bold**`
  isItalics: /\*(.+?)\*/g, // `*italic*`
  isDelete: /~(.*?)~/g,    // `~delete~`
  isUnder: /__(.*?)__/g,   // `__under__`
  isTag: /`(.*?)`/g, // ``tag``

  isOrderList: /^\d\.\s(.*?)$/, // `1. list`
  isUnOrderList: /^\-\s(.*?)$/, // `- un order list`
  isTaskList: /^\-\s\[([\s|X|x])\]\s(.*?)$/, // `- [ ] task`  or `- [X] task`
  isImg: /!\[(.*?)\]\((.*?)\)(\((?<w>w=\d+)?\s?(?<h>h=\d+)?\))?/g, // `![alt](src)(w= h=)`
  isLink: /\[(.*?)\]\((.*?)\)/g, // `[label](url)`
  isQuote: /^>\s(.*?)$/, // `> quote`
  isCodeBlock: /^```(?<lang>.*?)\s?(hl\[(?<hl>.*?)\])?$/, // ```lang hl[3~5,10]
};
const MAX_TITLE = config.maxTitle;
const BASE_TITLE_FONT_SIZE = config.baseTitleFontSize;
const STEP_FONT_SIZE = config.stepFontSize;

export function compileMd(text = "") {
  const rows = text.split("\n");
  const listFn = (i, reg) => list(rows, i, reg);
  let rowsRet = [];
  for (let i = 0; i < rows.length; ) {
    const row = rows[i];
    if (RegExps.isTitle.test(row)) {
      rowsRet.push(color(title(row)));
    } else if (RegExps.isImg.test(row)) {
      rowsRet.push(image(row));
    } else if (RegExps.isTaskList.test(row)) {
      const { i: index, list } = listFn(i, RegExps.isTaskList);
      i = index;
      rowsRet.push(taskList(list));
    } else if (RegExps.isOrderList.test(row)) {
      const { i: index, list } = listFn(i, RegExps.isOrderList);
      i = index;
      rowsRet.push(orderList(list));
    } else if (RegExps.isUnOrderList.test(row)) {
      const { i: index, list } = listFn(i, RegExps.isUnOrderList);
      i = index;
      rowsRet.push(unOrderList(list));
    } else if (RegExps.isCodeBlock.test(row)) {
      const ret = quoteBlock(rows, i, RegExps.isCodeBlock);
      i = ret.i;
      rowsRet.push(codeBlock(ret.list));
    } else if (RegExps.isQuote.test(row)) {
      const { i: index, list } = listFn(i, RegExps.isQuote);
      i = index;
      rowsRet.push(quote(list));
    } else {
      rowsRet.push(makeSpan(simpleRow(row)));
    }
    i++;
  }
  return `<div>${rowsRet.map((v) => v || "</br>").join("")}</div>`;
}

function list(rows = [], i, reg) {
  let liList = [];
  while (reg.test(rows[i])) {
    liList.push(rows[i++]);
  }
  i--;
  return { i, list: liList };
}

function quoteBlock(rows = [], i, reg) {
  let liList = [];
  while (reg.test(rows[i])) {
    liList.push(rows[i++]);
    while (!reg.test(rows[i])) {
      liList.push(rows[i++]);
    }
    liList.push(rows[i++]);
  }
  return { i, list: liList };
}

// ============================= //

function taskList(list = []) {
  const ret = list.map((li) => {
    const c = li.match(RegExps.isTaskList);
    if (c) {
      let checkStr = c[1].trim();
      let check = checkStr === "X";
      return `<input type="checkbox" ${check ? "checked" : ""}></input>
            <label>${simpleRow(c[2])}</label>`;
    }
    return li;
  });
  return ret.join("<br>");
}

function orderList(list = []) {
  const ret = list.map((li) => {
    const c = li.match(RegExps.isOrderList);
    return c ? `<li>${simpleRow(c[1])}</li>` : li;
  });
  return `<ol>${ret.join("")}</ol>`;
}

function unOrderList(list = []) {
  const ret = list.map((li) => {
    const c = li.match(RegExps.isUnOrderList);
    return c ? `<li>${simpleRow(c[1])}</li>` : li;
  });
  return `<ul>${ret.join("")}</ul>`;
}

function codeBlock(list = []) {
  const { lang, hl } = list[0].match(RegExps.isCodeBlock).groups;
  let hls = [];
  if (hl) {
    hls = hl
      .split(",")
      .map((v) => {
        if (v.indexOf("~") > -1) {
          const [from, to] = v.split("~");
          return range(from - 0, to - 0);
        } else {
          return v - 0;
        }
      })
      .flat();
  }
  const codes = list.slice(1, list.length - 1).map((v, i) => {
    let classes = "md-code-line";
    if (hls.includes(i + 1)) {
      classes += " md-code-line-hl";
    }
    return `<div class="${classes}">${v.replace(/\s/g, "&nbsp;")}</div>`;
  });
  return `<div class="md-code">${codes.join("\n")}</div>`;
}

function quote(list = []) {
  const ret = list
    .map((li) => {
      const c = li.match(RegExps.isQuote);
      return c[1] || "";
    })
    .map((v) => `<p>${simpleRow(v)}</p>`);
  return `<div class="md-quote">${ret.join("")}</div>`;
}

const simpleRowHandlers = {
  isTag: tag,
  isLink: link,
  isBold: bold,
  isItalics: italics,
  isColor: color,
  isDelete: deleteFn,
  isUnder: underLine
};

function simpleRow(input = "") {
  const reges = Object.keys(simpleRowHandlers);
  const switches = new Array(reges.length).fill(true);
  let iRow = input;
  while (switches.some(Boolean)) {
    reges.forEach((r, i) => {
      switches[i] = RegExps[r].test(iRow);
      iRow = simpleRowHandlers[r](iRow);
    });
  }
  return iRow;
}

function title(input = "") {
  const reg = RegExps.isTitle;
  const isTitle = reg.test(input);
  if (isTitle) {
    const hashes = input.split(" ")[0].split("");
    const legal = hashes.every((e) => e === "#");
    if (!legal) {
      return input;
    } else {
      let n = hashes.length;
      if (n > MAX_TITLE) {
        alert(`暂不支持 ${n} 级标题`);
        throw Error(`暂不支持 ${n} 级标题`);
      }
      const titleStyle = `font-size: ${
        (MAX_TITLE - n) * STEP_FONT_SIZE + BASE_TITLE_FONT_SIZE
      }px;`;
      return input.replace(
        reg,
        `<p class="md-h${n}" style="${titleStyle}">$1</p>`
      );
    }
  } else {
    return input;
  }
}

function color(input = "") {
  const reg = RegExps.isColor;
  return input.replace(reg, '<span style="color: $1">$2</span>');
}

function makeSpan(input = "") {
  if (!input) {
    return "";
  }
  return `<p class="md-p">${input}</p>`;
}

function bold(input = "") {
  const reg = RegExps.isBold;
  return input.replace(reg, '<span class="md-bold" style="font-weight: bold;">$1</span>');
}

function italics(input = "") {
  const reg = RegExps.isItalics;
  return input.replace(reg, '<span class="md-italics" style="font-style: italic">$1</span>');
}

function deleteFn(input = '') {
  return input.replace(RegExps.isDelete, `<span class="md-delete" style="text-decoration: line-through;">$1</span>`)
}

function underLine(input = '') {
  return input.replace(RegExps.isUnder, `<span class="md-under" style="text-decoration: underline;">$1</span>`)
}

function image(input = "") {
  const match = input.match(new RegExp(RegExps.isImg.source));
  let alt = " ";
  let src = "";
  let width = 100;
  let height = 100;
  if (match) {
    alt = match[1] || " ";
    src = match[2];
    const groups = match.groups;
    if (groups) {
      if (groups.w) {
        width = groups.w.split("=")[1] - 0;
      }
      if (groups.h) {
        height = groups.h.split("=")[1] - 0;
      }
    }
  }
  return input.replace(
    RegExps.isImg,
    `<img src="${src}" alt="${alt}" width="${width}" height="${height}" />`
  );
}

function link(input = "") {
  const match = input.match(new RegExp(RegExps.isLink.source));
  let label = "";
  if (match) {
    label = match[1] || match[2] || "";
  }
  return input.replace(RegExps.isLink, `<a href="$2">${label}</a>`);
}

function tag(input = "") {
  return input.replace(RegExps.isTag, `<span class="md-tag">$1</span>`);
}

// ======================= utils

function range(from, to) {
  let ret = [];
  for (let i = from - 0; i <= to - 0; i++) {
    ret.push(i);
  }
  return ret;
}
