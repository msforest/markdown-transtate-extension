import * as marked from "marked";
import * as vscode from "vscode";
import translate, { parseMultiple } from 'google-translate-open-api';

export default class TranslateMd {
  private disposables: vscode.Disposable[] = [];
  private panel: vscode.WebviewPanel | null | undefined;

   async doExec(words: string[]) {
     try {
      let response: any = await translate(words, {
        tld: "cn",
        to: "zh-CN",
      });
      return parseMultiple(response.data[0]);
     } catch (error) {
         console.error('translate error: ', error);
     }
    return [];
  }

  handleExecption(text: string) {
    return text.replace(/\s/g, '');
  }

  public async launch() {
    const editor: any = vscode.window.activeTextEditor;
    if (editor) {
      const document: any = editor.document;
      if (document) {
        const selectedText: any = document.getText();

        this.panel = vscode.window.createWebviewPanel(
          "Welcome", // viewType
          "翻译页面", // 视图标题
          vscode.ViewColumn.Two, // 显示在编辑器的哪个部位
          {
            enableScripts: true, // 启用JS，默认禁用
          },
        );

        const tokens: any = marked.lexer(selectedText); // 把text解析为一个marked.js的内部对象
        const words = [];
        for (const key of tokens) {
          const word: string = key.text;
          if (undefined !== word) {
            words.push(word);
          }
        }

        console.log('words', words); 
        
        let result: string[] = await this.doExec(words);
        for (const key of tokens) {
          const text: string = key.text;
          if (undefined !== text) {
            key.text = this.handleExecption(result.shift() || '');
          }
        }

        const renderToHTML: string = marked.parser(tokens); // 又把这个对象转化为html字符串。（<p>text</p>）

        this.panel.webview.html = renderToHTML;
        
        this.panel.webview.onDidReceiveMessage(
          (message) => {},
          null,
          this.disposables,
        );
      }
    }
  }
}
