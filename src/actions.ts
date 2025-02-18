import { commands, type TextEditorEdit, type TextLine, window } from 'vscode';

import { render } from './renders';
import { checkEmptyLine } from './errors';
import type { Action } from './types';

const insertDividerAction: Action = (type, lang) => {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const lines: TextLine[] = [];
  for (const selection of editor.selections) {
    // check that each selection is a single line
    if (!selection.isSingleLine) throw new Error('MULTI_LINE');

    // get the line at the active position of the selection
    const line = editor.document.lineAt(selection.active.line);

    // check that the line is not empty if the preset is mainHeader or subheader
    if (type === 'mainHeader' || type === 'subheader') checkEmptyLine(line);

    // add the line to the lines array
    lines.push(line);
  }

  window.activeTextEditor
    .edit((textEditorEdit: TextEditorEdit) => {
      for (const line of lines) {
        // render the content and replace the line with the rendered content
        const content = render(type, line.text, lang);
        textEditorEdit.replace(line.range, content);
      }
    })
    .then(() => {
      commands.executeCommand('cursorEnd');
    });
};

export default insertDividerAction;
