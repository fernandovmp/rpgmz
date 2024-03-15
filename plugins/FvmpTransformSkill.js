//=============================================================================
// FvmpTransformSkill.js
//=============================================================================

/*:
 * @plugindesc Invoke the enemy transformation when use a skill
 * @author fernandovmp
 *
 * @help
 * 
 * Add to the enemy "meta" field "<transform:number>" to transform the enemy to the specified ID when the enemy use a transformation skill.
 *   Example: Add "<transform:10>" to an enemy will transform it when it uses a transformation skill.
 * 
 * Add to the skill "meta" field "<transform:true>" to make that skill a transformation skill.
 * 
 */


(function() {
    const _base_Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        _base_Game_Action_applyItemUserEffect.call(this);
        const meta = this.item().meta;
        const subject = this.subject();
        if(this.isSkill() && meta.transform === 'true' && subject.isEnemy()) {
            const enemy = subject.enemy();
            const id = (+enemy.meta.transform) || 0;
            if(!isNaN(id) && id > 0) {
                subject.transform(id);
                this.makeSuccess(target);
            }
        }
    };
})();
