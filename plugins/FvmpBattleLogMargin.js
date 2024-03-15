//=============================================================================
// FvmpBattleLogMargin.js
//=============================================================================

/*:
 * @plugindesc Add custom margin to Battle_Log Window
 * @author fernandovmp
 *
 * @help Configure the margin values in the plugins parameters.
 * 
 * @param marginX
 * @desc
 * @default 0
 * 
 * @param marginY
 * @desc
 * @default 0
 */

(function() {

    const parameters = PluginManager.parameters('FvmpPaddBattleLog');
    const marginX = Number(parameters['marginX'], 0);
    const marginY = Number(parameters['marginY'], 0);

    Scene_Battle.prototype.logWindowRect = function() {
        const wx = marginX;
        const wy = marginY;
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(10, false);
        return new Rectangle(wx, wy, ww, wh);
    };

  })();
  
  