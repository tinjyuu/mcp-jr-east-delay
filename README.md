# JR東日本 遅延情報 MCPサーバー

## セットアップ

```sh
npm install
```

## ビルド

```sh
npm run build
```

## テスト

```sh
npx vitest run
```

## サーバーの起動

```sh
node build/index.js
```

または、package.jsonのbin設定により

```sh
npx jr-east-delay
```

でコマンドとしても実行できます。

## MCPクライアントからの利用

Claude DesktopやMCP InspectorなどのMCPクライアントから「getDelays」ツールを呼び出すことで、JR東日本の遅延情報を取得できます。

### MCPクライアント設定例

Claude DesktopやMCP Inspector等のクライアントで本サーバーを利用する場合、設定ファイル（例: `claude_desktop_config.json`）に以下のように記述してください。

#### 例1: `node` コマンドがパスに通っている場合

```json
"jr-east-delay": {
  "command": "node",
  "args": ["/Users/your-path/mcp-jr-east-delay/build/index.js"]
}
```

#### 例2: `node` の絶対パスを指定する場合

```json
"jr-east-delay": {
  "command": "/Users/your-username/.nodebrew/current/bin/node",
  "args": ["/Users/your-path/mcp-jr-east-delay/build/index.js"]
}
```

- `your-username` の部分はご自身の環境に合わせて変更してください。
- `your-path` の部分はご自身の環境に合わせて変更してください。
- `node` コマンドがパスに通っていない場合は絶対パスで指定してください。

---

### 開発用メモ
- テストは `src/index.test.ts` に記述
- MCPプロトコルの通信テストはMCP Inspector等のクライアントを利用
