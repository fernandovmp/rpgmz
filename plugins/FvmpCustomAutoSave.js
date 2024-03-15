//=============================================================================
// FvmpCustomAutoSave.js
//=============================================================================

/*:
 * @plugindesc Custom AutoSave Manager
 * @author fernandovmp
 *
 * @help Call the plugin command to perform an auto save.
 *
 * @param useSystemAutoSave
 * @desc To use or not the system auto save
 * @default true
 * 
 * 
 * Plugin Commands:
 *   PerformAutoSave - Performs a save in the auto save slot.
 * 
 * @command PerformAutoSave
 * @text PerformAutoSave
 * @desc Performs a save in the auto save slot
 * 
 */

(function() {

    const pluginName = 'FvmpCustomAutoSave';
    const parameters = PluginManager.parameters(pluginName);
    const useSystemAutoSave = parameters['useSystemAutoSave'] === 'true';

    PluginManager.registerCommand(pluginName, 'PerformAutoSave', args => {
        if(SceneManager._scene) {
            SceneManager._scene.executeAutosave();
        }
    });

    const base_Scene_File_needsAutosave = Scene_File.prototype.needsAutosave;
    Scene_File.prototype.needsAutosave = function() {
        return base_Scene_File_needsAutosave.call(this) || !useSystemAutoSave;
    };
  
  })();
  
  