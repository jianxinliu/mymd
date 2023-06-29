const fs = require("fs");

const srcFile = "./src/txt2md.js";
const moduleDistFile = "./dist/dist.js";
const htmlDistFile = "./dist/dist.html.js";
const requireReg = /(?<pre>.*?)require\((?<q>['"])(?<file>.+)\k<q>\)/

build();

function build() {
  const srcLines = readLines(srcFile).map(resolveLines);

  let distLines = srcLines;
  fs.writeFileSync(htmlDistFile, distLines.join("\n"));

  distLines = buildModule(srcLines);
  fs.writeFileSync(moduleDistFile, distLines.join("\n"));
}

function buildModule(lines = []) {
  const dist = lines.map((line) => {
    if (line.includes("function compileMd")) {
      return "export " + line;
    } else {
      return line;
    }
  });

  return dist;
}

function readLines(file) {
  return fs.readFileSync(file).toString().split("\n");
}


function resolveLines(line = '') {
    if (requireReg.test(line)) {
        const match = line.match(requireReg)
        if (!match) {
            throw new Error('error require: ' + line)
        }
        const {pre, file} = match.groups
        return pre + fs.readFileSync(file).toString();
    } else {
        return line
    }
}