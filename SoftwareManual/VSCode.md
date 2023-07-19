### 将当前文件用新窗口打开(移到另一屏幕)

命令名（用Ctrl+Shift+P输入）：`Open Active File in New Window`

快捷键：`Ctrl+K, O`

### 将转码后的文本保存下来

点击下面那个切换编码格式的（比如GB-2312） → 会弹出框，选择Save with encoding, 选择UTF-8.

### 自动补全function括号(parentheses)

`Ctrl + Shift + P` =\> Settings.json 或 Ctrl+, 打开Preference Setting.

```json
"typescript.suggest.completeFunctionCalls": true,
"javascript.suggest.completeFunctionCalls": true,
"C_Cpp.autocompleteAddParentheses": true "python.analysis.completeFunctionParens": true,
```


## 快捷操作

### HTML

#### Emmet abbreviation

button =\> `<button><button\>`

button\#test =\> `<button id="test"><button\>`

button.test =\> `<button class="test"><button\>`
