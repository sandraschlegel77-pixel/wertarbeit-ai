import MiniSearch from "minisearch";
import db from "../db.server";

export interface MemoryDoc {
  id: string;
  shop: string;
  category: string;
  content: string;
  tokens: string;
  weight: number;
}

export class AiMemory {
  private index: MiniSearch<any>;
  private docs: MemoryDoc[] = [];
  private loaded = false;

  constructor() {
    this.index = new MiniSearch<any>({
      fields: ["tokens"],
      storeFields: ["id", "shop", "category", "content", "weight"],
      searchOptions: { boost: { tokens: 2 } },
    });
  }

  /** Lädt alle Wissens-Dokumente (einmal pro Server-Prozess). */
  async load() {
    if (this.loaded) return;
    const rows = await db.aiKnowledgeMemory.findMany();
    this.docs = rows.map((r) => ({
      id: r.id,
      shop: r.shop,
      category: r.category,
      content: r.content,
      tokens: r.tokens ?? "",
      weight: r.weight,
    }));
    if (this.docs.length) {
      this.index.addAll(this.docs as any);
    }
    this.loaded = true;
  }

  async add({
    shop,
    category,
    content,
    tokens,
    weight = 1,
  }: {
    shop: string;
    category: string;
    content: string;
    tokens: string;
    weight?: number;
  }) {
    const row = await db.aiKnowledgeMemory.create({
      data: { shop, category, content, tokens, weight },
    });
    const doc: MemoryDoc = {
      id: row.id,
      shop,
      category,
      content,
      tokens,
      weight,
    };
    this.docs.push(doc);
    this.index.add(doc as any);
    return row;
  }

  async search({
    shop,
    query,
    limit = 8,
  }: {
    shop: string;
    query: string;
    limit?: number;
  }) {
    await this.load();
    const hits = (this.index.search(query) as any[]).filter(
      (r) => r.shop === shop
    );
    return hits.slice(0, limit).map((r) => ({
      id: r.id,
      shop: r.shop,
      category: r.category,
      content: r.content,
      weight: r.weight,
      score: r.score,
    }));
  }
}

export const aiMemory = new AiMemory();

