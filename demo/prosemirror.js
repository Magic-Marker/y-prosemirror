/* eslint-env browser */
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo, initProseMirrorDoc, ySyncPluginKey, defaultDeleteFilter, defaultProtectedNodes } from '../src/y-prosemirror.js'
import { EditorState, PluginKey } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from './schema.js'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'

window.addEventListener('load', () => {
  const ydoc = new Y.Doc()
  const provider = new WebrtcProvider('prosemirror-debug', ydoc)
  const type = ydoc.getXmlFragment('prosemirror')
  const editor = document.createElement('div')
  editor.setAttribute('id', 'editor')
  const editorContainer = document.createElement('div')
  editorContainer.insertBefore(editor, null)
  const { doc, mapping } = initProseMirrorDoc(type, schema)
  const undoOrigin = new PluginKey('undo-origin');
  const trackedOrigins = [undoOrigin];
  const commentsType = ydoc.getMap('comments');

  const prosemirrorView = new EditorView(editor, {
    state: EditorState.create({
      doc,
      schema,
      plugins: [
        ySyncPlugin(type, { mapping }),
        yCursorPlugin(provider.awareness),
        yUndoPlugin({
          // We construct a custom UndoManager here
          undoManager: new Y.UndoManager(
            // The only different is that we add the additional scope here
            [type, commentsType], {
            // These are setting the exact same values as the ySyncPlugin already supports
            trackedOrigins: new Set([ySyncPluginKey].concat(trackedOrigins)),
            deleteFilter: (item) => defaultDeleteFilter(item, defaultProtectedNodes),
            captureTransaction: tr => tr.meta.get('addToHistory') !== false
          })
        }),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        })
      ].concat(exampleSetup({ schema, history: false }))
    })
  })
  document.body.insertBefore(editorContainer, null)

  setTimeout(() => {
    prosemirrorView.focus()
  })

  const connectBtn = /** @type {HTMLElement} */ (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textContent = 'Connect'
    } else {
      provider.connect()
      connectBtn.textContent = 'Disconnect'
    }
  })

  const undoBtn = /** @type {HTMLElement} */ (document.getElementById('y-undo-btn'))
  undoBtn.addEventListener('click', () => {
      // Append paragraph to the end of the editor:
      const now = new Date();
      const content = `Changes made at ${now.toISOString()}. Press Cmd+Z to undo this and the associated comment.`;
      const p = schema.nodes.paragraph.createAndFill({}, schema.text(content, [schema.marks.strong.create()]));
      if (p) {
        const tr = prosemirrorView.state.tr.insert(prosemirrorView.state.doc.content.size, p);
        prosemirrorView.dispatch(tr);
        requestAnimationFrame(() => {
          prosemirrorView.focus();
        });
      }

      // Add comment to the comments map. We wrap this in a transaction so that we can provide a custom origin
      ydoc.transact(() => {
        commentsType.set(now.getTime().toString(), 'Comment at: ' + now.toISOString());
      }, 
      // As long as the origin is listed in the trackedOrigins, the comment will be associated with the undo action
      undoOrigin);
    });

    commentsType.observeDeep(() => {
      const comments = commentsType.toJSON();
      const debugElement = document.getElementById('y-comments');
      if (debugElement) {
        debugElement.textContent = JSON.stringify(comments, null, 2) || "No comments yet.";
      }
    });

  // @ts-ignore
  window.example = { provider, ydoc, type, prosemirrorView }
})
