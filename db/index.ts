import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config';
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URLが設定されていません。データベースの設定を確認してください。"
  );
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

// // エラーハンドリングを別途実装
// client.connect().catch((error) => {
//   console.error('データベース接続エラー:', error);
//   throw new Error('データベースへの接続に失敗しました。設定を確認してください。');
// });
