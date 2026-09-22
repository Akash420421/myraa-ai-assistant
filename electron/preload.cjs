/* ===========================================================================
 * MYRAA — Electron preload
 * ---------------------------------------------------------------------------
 * Runs in an isolated context and exposes a minimal, explicit API surface to
 * the renderer via contextBridge. Only serializable metadata may cross this
 * boundary. Live MediaStream objects stay in the renderer and are supplied by
 * Electron's main-process display-media request handler.
 * ========================================================================= */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Get the list of capturable desktop sources (entire screen + individual
 * windows) from the main process. Returns an array of
 * `{ id, name, thumbnail, display_id, appIcon }` where `thumbnail` is a
 * data-URL string suitable for a preview UI.
 */
async function getDesktopCaptureSources() {
  try {
    const sources = await ipcRenderer.invoke('screen:get-sources');
    return Array.isArray(sources) ? sources : [];
  } catch (err) {
    console.error('[MYRAA preload] getDesktopCaptureSources failed:', err);
    return [];
  }
}

contextBridge.exposeInMainWorld('myraa', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  // Serializable source metadata only; MediaStreams cannot cross this bridge.
  getDesktopCaptureSources,
});
