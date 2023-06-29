const fs = require('fs')

const lines = fs.readFileSync('./src/txt2md.js').toString().split('\n')

const dist = lines.map(line => {
    if (line.includes('function compileMd')) {
        return 'export ' + line
    } else {
        return line
    }
}).join('\n')

fs.writeFileSync('./dist/dist.js', dist)