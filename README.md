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

---

### 開発用メモ
- テストは `src/index.test.ts` に記述
- MCPプロトコルの通信テストはMCP Inspector等のクライアントを利用
