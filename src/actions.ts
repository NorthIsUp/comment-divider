import { commands, TextEditorEdit, TextLine, window } from 'vscode';

import { render } from './renders';
import { checkEmptyLine } from './errors';
import { Action } from './types';

const insertDividerAction: Action = (type, lang) => {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const lines: TextLine[] = [];
  for (const selection of editor.selections) {
    if (!selection.isSingleLine) continue;

    const line = editor.document.lineAt(selection.active.line);
    lines.push(line);
  }

  if (type === 'mainHeader' || type === 'subheader') {
    for (const line of lines) {
      checkEmptyLine(line);
    }
  }

  window.activeTextEditor
    .edit((textEditorEdit: TextEditorEdit) => {
      for (const line of lines) {
        const content = render(type, line.text, lang);
        textEditorEdit.replace(line.range, content);
      }
    })
    .then(() => {
      commands.executeCommand('cursorEnd');
    });
};

export default insertDividerAction;
