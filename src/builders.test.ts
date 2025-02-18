import { buildWordsLine, buildBlock } from "./builders";
import { GAP_SYM } from "./constants";
import type { IConfig, Transform } from "./types";
import { expect, describe, it } from "@jest/globals";

// Add Jest types
declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: string): R;
    }
  }
}

const SYM = "-";
const LINE_LEN = 20;
const FULL_LINE = `[ ${SYM.repeat(LINE_LEN - 4)} ]`;

describe("Builders - Multibyte Character Support", () => {
  const baseConfig: IConfig = {
    lineLen: LINE_LEN,
    sym: SYM,
    align: "center",
    limiters: {
      left: "[",
      right: "]",
    },
    height: "line",
    transform: ((str: string) => str) as unknown as Transform,
    includeIndent: false,
  };

  describe("buildWordsLine", () => {
    it("has correct line length", () => {
      expect(FULL_LINE.length).toBe(LINE_LEN);
    });

    it("handles empty characters correctly with center alignment", () => {
      const result = buildWordsLine(baseConfig, "", "");
      expect(result).toBe("[ -------  ------- ]");
    });

    it("handles ascii characters correctly with center alignment", () => {
      const result = buildWordsLine(baseConfig, "xxxx", "");
      expect(result).toBe("[ ----- xxxx ----- ]");
    });

    it("handles CJK characters correctly with center alignment", () => {
      const result = buildWordsLine(baseConfig, "你好世界", "");
      expect(result).toBe("[ ----- 你好世界 ----- ]");
    });

    it("handles emojis correctly with center alignment", () => {
      const result = buildWordsLine(baseConfig, "👋🌍", "");
      expect(result).toBe("[ ------ 👋🌍 ------ ]");
    });

    it("handles mixed ASCII and multibyte characters with left alignment", () => {
      const config: IConfig = { ...baseConfig, align: "left" };
      const result = buildWordsLine(config, "Hi 世界", "");
      expect(result).toBe("[ Hi 世界 ---------- ]");
    });

    it("handles mixed ASCII and multibyte characters with right alignment", () => {
      const config: IConfig = { ...baseConfig, align: "right" };
      const result = buildWordsLine(config, "Hi 世界", "");
      expect(result).toBe("[ ---------- Hi 世界 ]");
    });
  });

  describe("buildBlock", () => {
    const blockConfig: IConfig = {
      ...baseConfig,
      height: "block",
      sym: SYM,
    };

    it("creates block with CJK characters", () => {
      const result = buildBlock(blockConfig, "你好世界", "");
      const expected = `${FULL_LINE}\n[       你好世界       ]\n${FULL_LINE}`;
      expect(result).toBe(expected);
    });

    it("creates block with emojis", () => {
      const result = buildBlock(blockConfig, "👋🌍", "");
      const expected = `${FULL_LINE}\n[        👋🌍        ]\n${FULL_LINE}`;
      expect(result).toBe(expected);
    });

    it("creates block with mixed ASCII and multibyte characters", () => {
      const config: IConfig = { ...blockConfig, align: "left" };
      const result = buildBlock(config, "Hi 世界!", "");
      const expected = `${FULL_LINE}\n[ Hi 世界!           ]\n${FULL_LINE}`;
      expect(result).toBe(expected);
    });
  });

  describe("Edge cases", () => {
    it("handles zero-width characters correctly", () => {
      // no idea what the expected result should be here,
      //  currently it's counted as a single character,
      //  should it be counted as zero?
      const result = buildWordsLine(
        baseConfig,
        "a\u200bb", // zero-width space between 'a' and 'b'
        ""
      );
      expect(result).toBe("[ ------ a​b ----- ]");
    });

    it("handles combining characters correctly", () => {
      const result = buildWordsLine(
        baseConfig,
        "é", // 'e' with combining acute accent
        ""
      );
      expect(result).toBe("[ ------- é ------ ]");
    });

    it("handles surrogate pairs correctly", () => {
      const result = buildWordsLine(
        baseConfig,
        "🦄", // unicode surrogate pair
        ""
      );
      expect(result).toBe("[ ------- 🦄 ------ ]");
    });
  });
});
