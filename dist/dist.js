const RegExps = {
  isTitle: /#+\s(.*?)$/, // `# title`
  isColor: /#(.*?)\{(.*?)\}/g, // `#red{content}` `#ccc{content}` `#rgba(255,255,0,0.5){content}`
  isBold: /\*\*(.+?)\*\*/g, // `**bold**`
  isItalics: /\*(.+?)\*/g, // `*italic*`
  isOrderList: /^\d\.\s(.*?)$/, // `1. list`
  isUnOrderList: /^\-\s(.*?)$/, // `- un order list`
  isTaskList: /^\-\s\[([\s|X|x])\]\s(.*?)$/, // `- [ ] task`  or `- [X] task`
  isImg: /!\[(.*?)\]\((.*?)\)(\((?<w>w=\d+)?\s?(?<h>h=\d+)?\))?/g, // `![alt](src)(w= h=)`
  isLink: /\[(.*?)\]\((.*?)\)/g, // `[label](url)`
  isTag: /`(.*?)`/g, // ``tag``
  isQuote: /^>\s(.*?)$/, // `> quote`
};
const MAX_TITLE = 6;
const BASE_TITLE_FONT_SIZE = 5;
const STEP_FONT_SIZE = 3;

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
  return `<ol style="list-style: decimal; margin-left: 0px">${ret.join(
    ""
  )}</ol>`;
}

function unOrderList(list = []) {
  const ret = list.map((li) => {
    const c = li.match(RegExps.isUnOrderList);
    return c ? `<li>${simpleRow(c[1])}</li>` : li;
  });
  return `<ul style="list-style: disc; margin-left: 0px">${ret.join("")}</ul>`;
}

function quote(list = []) {
  const ret = list
    .map((li) => {
      const c = li.match(RegExps.isQuote);
      return c[1] || "";
    })
    .map((v) => `<p>${simpleRow(v)}</p>`);
  return `<div style="border-left: 4px solid lightgreen; padding-left: 8px">${ret.join(
    ""
  )}</div>`;
}

const simpleRowHandlers = {
  isTag: tag,
  isLink: link,
  isBold: bold,
  isItalics: italics,
  isColor: color,
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
      const borderWidth = n == 1 ? 2 : 1;
      const titleStyle = `font-weight: bold; font-size: ${
        (MAX_TITLE - n) * STEP_FONT_SIZE + BASE_TITLE_FONT_SIZE
      }px; border-bottom: ${borderWidth}px solid black; padding: 0px 0px 2px 2px;margin-bottom: 10px`;
      return input.replace(reg, `<p style="${titleStyle}">$1</p>`);
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
  return `<p style="margin: 5px 0px">${input}</p>`;
}

function bold(input = "") {
  const reg = RegExps.isBold;
  return input.replace(reg, '<span style="font-weight: bold">$1</span>');
}

function italics(input = "") {
  const reg = RegExps.isItalics;
  return input.replace(reg, '<span style="font-style: italic">$1</span>');
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
  return input.replace(
    RegExps.isTag,
    `<span style="background: lightcyan; border-radius:6px; padding: 3px">$1</span>`
  );
}
