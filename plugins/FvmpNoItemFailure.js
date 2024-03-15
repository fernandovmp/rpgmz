//=============================================================================
// FvmpNoItemFailure.js
//=============================================================================

/*:
 * @plugindesc Force an action to be successful
 * @author fernandovmp
 *
 * @help
 * 
 * Add "<noFailure:true>" to an item or skill "meta" field.
 * 
 */


(function() {
    const _base_Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _base_Game_Action_applyItemUserEffect.call(this, target);
        const meta = this.item().meta;
        if(meta.noFailure === 'true') {
            this.makeSuccess(target);
        }
    };
})();
