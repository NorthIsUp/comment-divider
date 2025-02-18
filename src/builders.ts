import { GAP_SYM, NEW_LINE_SYM } from "./constants";
import type { IWordsAnchors, IConfig, CharList, Align, Height } from "./types";

const buildBlankCharList = (lineLen: number, filler: string): CharList => Array(lineLen).fill(filler);

const charListToString = (charList: CharList) => charList.join("");

const isEven = (num: number) => num % 2 === 0;

const getCenterAlignedAnchors = (words: string, charList: CharList): IWordsAnchors => {
  const wordsArray = Array.from(words);
  const smartRound = !isEven(wordsArray.length) && !isEven(charList.length) ? Math.floor : Math.ceil;
  const halfLen = smartRound(charList.length / 2);
  const halfWord = Math.floor(wordsArray.length / 2);
  const leftAnchor = halfLen - halfWord;
  const rightAnchor = leftAnchor + (wordsArray.length - 1);

  return { leftAnchor, rightAnchor };
};

const getLeftAlignedAnchors = (words: string, charList: CharList): IWordsAnchors => {
  const wordsArray = Array.from(words);
  let leftAnchor: number;

  for (const idx of Object.keys(charList)) {
    if (charList[idx] === GAP_SYM) {
      leftAnchor = Number(idx) + 1;
      break;
    }
  }

  const rightAnchor = leftAnchor + (wordsArray.length - 1);

  return { leftAnchor, rightAnchor };
};

const getRightAlignedAnchors = (words: string, charList: CharList): IWordsAnchors => {
  const wordsArray = Array.from(words);
  let rightAnchor: number;

  const last = charList.length - 1;

  for (const idx of Object.keys(charList)) {
    if (charList[last - Number(idx)] === GAP_SYM) {
      rightAnchor = last - (Number(idx) + 1);
      break;
    }
  }

  const leftAnchor = rightAnchor - (wordsArray.length - 1);

  return { leftAnchor, rightAnchor };
};

const getWordsAnchors = (align: Align, words: string, charList: CharList): IWordsAnchors => {
  switch (align) {
    case "center":
      return getCenterAlignedAnchors(words, charList);
    case "left":
      return getLeftAlignedAnchors(words, charList);
    case "right":
      return getRightAlignedAnchors(words, charList);
  }
};

export const withLimiters =
  (leftLim: string, rightLim: string) =>
  (charList: CharList): CharList => {
    const rightLimAnchor = charList.length - rightLim.length;

    return charList.map((char, i) => {
      // Insert left limiter
      if (i < leftLim.length) return leftLim[i];
      // Insert right limiter
      if (i >= rightLimAnchor) return rightLim[i - rightLimAnchor];
      // Insert gaps after/before non-empty limiters
      if ((leftLim.length && i === leftLim.length) || (rightLim.length && i === rightLimAnchor - 1)) return GAP_SYM;
      // Pass other chars
      return char;
    });
  };

export const withWords =
  (align: Align, words: string) =>
  (charList: CharList): CharList => {
    const wordsArray = Array.from(words);
    const { leftAnchor, rightAnchor } = getWordsAnchors(align, words, charList);

    return charList.map((char, i) => {
      // Insert words
      if (i >= leftAnchor && i <= rightAnchor) return wordsArray[i - leftAnchor];
      // Insert gaps before/after words
      if (i === leftAnchor - 1 || i === rightAnchor + 1) return GAP_SYM;
      // Pass other chars
      return char;
    });
  };

const composeInjectors =
  (...injectors) =>
  (charList: CharList) =>
    injectors.reduce((res: CharList, injector) => injector(res), charList);

/**
 * Builder functions.
 */

export const buildSolidLine = (config: IConfig, leftIndent: string): string => {
  const injectLimiters = withLimiters(config.limiters.left, config.limiters.right);

  const blankCharList = buildBlankCharList(config.lineLen, config.sym);
  const computedCharList = composeInjectors(injectLimiters)(blankCharList);

  return leftIndent + charListToString(computedCharList);
};

export const buildWordsLine = (config: IConfig, transformedWords: string, leftIndent: string): string => {
  const injectLimiters = withLimiters(config.limiters.left, config.limiters.right);
  const injectWords = withWords(config.align, transformedWords);

  const blankCharList = buildBlankCharList(config.lineLen, config.sym);
  const computedCharList = composeInjectors(injectLimiters, injectWords)(blankCharList);

  return leftIndent + charListToString(computedCharList);
};

export const buildBlock = (config: IConfig, transformedWords: string, leftIndent: string): string => {
  const textConfig: IConfig = { ...config, sym: GAP_SYM };
  const topLine = buildSolidLine(config, leftIndent);
  const textLine = buildWordsLine(textConfig, transformedWords, leftIndent);
  const bottomLine = buildSolidLine(config, leftIndent);

  return topLine + NEW_LINE_SYM + textLine + NEW_LINE_SYM + bottomLine;
};

export const BUILDERS_MAP: {
  [key in Height]: (config: IConfig, transformedWords: string, leftIndent: string) => string;
} = {
  block: buildBlock,
  line: buildWordsLine,
};
