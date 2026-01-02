import reiwa3Vocab from "../assets/vocab/reiwa3_7/reiwa3.unigram.json";
import reiwa4Vocab from "../assets/vocab/reiwa3_7/reiwa4.unigram.json";
import reiwa5Vocab from "../assets/vocab/reiwa3_7/reiwa5.unigram.json";
import reiwa6Vocab from "../assets/vocab/reiwa3_7/reiwa6.unigram.json";
import reiwa7Vocab from "../assets/vocab/reiwa3_7/reiwa7.unigram.json";
import extraVocab from "../assets/vocab/extra/extra_translated_refined.json";

import type { VocabEntry } from "./vocabTypes";
import { shuffleItems } from "../utils/shuffleItems";

export interface StageTheme {
  accent: string;
  accentSoft: string;
  accentGlow: string;
}

// 年度の追加はこの配列に1件足すだけで済むようにする
export const defaultRegistry = [
  {
    key: "reiwa3",
    label: "Reiwa 3",
    sectionLabel: "令和3年",
    vocab: reiwa3Vocab as VocabEntry[],
    theme: {
      accent: "#63e6c0",
      accentSoft: "#a7f3db",
      accentGlow: "rgba(99, 230, 192, 0.35)",
    },
    defaultQuestionCount: 20,
  },
  {
    key: "reiwa4",
    label: "Reiwa 4",
    sectionLabel: "令和4年",
    vocab: reiwa4Vocab as VocabEntry[],
    theme: {
      accent: "#5aa9ff",
      accentSoft: "#f7b36b",
      accentGlow: "rgba(90, 169, 255, 0.35)",
    },
    defaultQuestionCount: 20,
  },
  {
    key: "reiwa5",
    label: "Reiwa 5",
    sectionLabel: "令和5年",
    vocab: reiwa5Vocab as VocabEntry[],
    theme: {
      accent: "#b77bff",
      accentSoft: "#6de7ff",
      accentGlow: "rgba(183, 123, 255, 0.35)",
    },
    defaultQuestionCount: 20,
  },
  {
    key: "reiwa6",
    label: "Reiwa 6",
    sectionLabel: "令和6年",
    vocab: reiwa6Vocab as VocabEntry[],
    theme: {
      accent: "#ff8ba7",
      accentSoft: "#ffd6a5",
      accentGlow: "rgba(255, 139, 167, 0.3)",
    },
    defaultQuestionCount: 20,
  },
  {
    key: "reiwa7",
    label: "Reiwa 7",
    sectionLabel: "令和7年",
    vocab: reiwa7Vocab as VocabEntry[],
    theme: {
      accent: "#b9f27c",
      accentSoft: "#74f0c2",
      accentGlow: "rgba(185, 242, 124, 0.3)",
    },
    defaultQuestionCount: 20,
  },
  {
    key: "extra",
    label: "Extra",
    sectionLabel: "追加単語",
    // extraは固定シードで一度シャッフルして、出題順の偏りを避ける
    vocab: shuffleItems(extraVocab as VocabEntry[], 20250101),
    theme: {
      accent: "#f2c97d",
      accentSoft: "#ffe7b0",
      accentGlow: "rgba(242, 201, 125, 0.35)",
    },
    defaultQuestionCount: 20,
  },
] as const;

// 既存コードとの互換のため、年データの別名を用意する
export const yearRegistry = defaultRegistry;

export type YearRegistryEntry = (typeof defaultRegistry)[number];
