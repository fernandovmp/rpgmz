//=============================================================================
// FvmpGainMpOnAttack.js
//=============================================================================

/*:
 * @plugindesc Gain mp when attack
 * @author fernandovmp
 *
 * @help You need to modify the code to change the amount of gained MP
 * 
 *
 */

(function() {

    const _base_Game_Action_makeSuccess = Game_Action.prototype.makeSuccess;
    Game_Action.prototype.makeSuccess = function(target) {
        _base_Game_Action_makeSuccess.call(this, target);
        this._hasActionUsed = target.result().used;
        this._hasActionSucessful = target.result().sucess;
    };

    const _base_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        const action = this._action;
        if(action.isAttack() && action._hasActionUsed) {
            const mp = Math.floor(Math.random() * 3) + 1;
            action.subject().gainMp(mp);
        }
        _base_BattleManager_endAction.apply(this);
    }

  })();
  
  