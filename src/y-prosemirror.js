export {
  defaultAwarenessStateFilter,
  defaultCursorBuilder,
  defaultSelectionBuilder,
  createDecorations,
  yCursorPlugin,
} from "./plugins/cursor-plugin.js";

export {
  ySyncPlugin,
  isVisible,
  getRelativeSelection,
  ProsemirrorBinding,
  updateYFragment,
} from "./plugins/sync-plugin.js";

export {
  undo,
  redo,
  undoCommand,
  redoCommand,
  defaultProtectedNodes,
  defaultDeleteFilter,
  yUndoPlugin,
} from "./plugins/undo-plugin.js";

export {
  ySyncPluginKey,
  yUndoPluginKey,
  yCursorPluginKey,
} from "./plugins/keys.js";
export {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  setMeta,
  prosemirrorJSONToYDoc,
  yDocToProsemirrorJSON,
  yDocToProsemirror,
  prosemirrorToYDoc,
  prosemirrorJSONToYXmlFragment,
  yXmlFragmentToProsemirrorJSON,
  yXmlFragmentToProsemirror,
  prosemirrorToYXmlFragment,
  yXmlFragmentToProseMirrorRootNode,
  yXmlFragmentToProseMirrorFragment,
  initProseMirrorDoc,
} from "./lib.js";
