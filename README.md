# mymd

mymd -> my markdown

支持编译简单的 markdown 语法成 HTML

todo: 

- [ ] 解析成 ast
- [X] 样式采用 class
- [ ] table
- [X] code block
- [ ] code keywords highlight
- [ ] code block line number
- [X] 样式支持自定义
- [ ] TOC table of content

## 支持的语法一览

（具体效果参看 preview.html）

```text
# #darkviolet{一级标题}
这是一个#lightgrey{** 重*_斜体_*点**}，次*重点*， #lightseagreen{颜色名}

*斜 **重点** 体* [url](https://www.baidu.com)

\```js hl[2~4,6]
function hello() {
  console.log('hello')
  console.log('hello')
  console.log('hello')
  console.log('hello')
}
\```

> 引用**的内容**
> 
> 引用#red{aaa}

![image](https://cdn.freebiesupply.com/logos/large/2x/vue-9-logo-png-transparent.png)(w=120 h=200)

`tag`

- [ ] AA
- [X] BB
- [x] CC

## 二级标题
有序列表
1. **AA**
2. bb
3. #cyan{cc}

无序列表
- 1
- *2*
- 3

###### 六级标题 (最小)
正常文字
##95d475{16 进制 RBG 颜色用法}
#rgba(255,0,0,0.2){rgba 颜色用法}


```

## 用法

```
npm i --save txt2md
```

```js
import { compileMd } from 'txt2md'
import 'txt2md/theme/style.css'

const html = compileMd(txt)
```

## 在 ts 中使用

增加类型定义文件 txt2md.d.ts

```ts
declare module 'txt2md'

declare function compileMd(text:string):string
```