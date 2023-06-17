# mymd

mymd -> my markdown

坚持编译简单的 markdown 语法成 HTML

## 支持的语法一览

```text
# #darkviolet{一级标题}
这是一个#lightgrey{** 重*_斜体_*点**}，次*重点*， #lightseagreen{颜色名}

*斜 **重点** 体*

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

用法：

```js
const html = compileMd(draft)
```