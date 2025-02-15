import { window } from 'vscode';

import { handleError } from './errors';
import insertDividerAction from './actions';
import { PresetId } from './types';

const generateCommand = (type: PresetId) => () => {
  try {
    const editor = window.activeTextEditor;
    if (!editor) return;

    const lang = editor.document.languageId;

    insertDividerAction(type, lang);
  } catch (e) {
    handleError(e);
  }
};

export const mainHeaderCommand = generateCommand('mainHeader');
export const subHeaderCommand = generateCommand('subheader');
export const solidLineCommand = generateCommand('line');
