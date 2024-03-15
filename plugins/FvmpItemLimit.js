//=============================================================================
// FvmpItemLimit.js
//=============================================================================

/*
 * @plugindesc Limits the maximum amount of an item
 * @author fernandovmp
 *
 * @help
 * add <maxStack:number> to set an item limit
 * 
 * Exemplo: <maxStack:10> will set the item limit to 10.
 * 
 */

var Fvmp = Fvmp || {};
Fvmp.ItemLimit = {
    getLimit(item) {
        return +item.meta.maxStack;
    },
    isFull(itemId) {
        const amount = $gameParty._items[itemId] || 0;
        const item = $dataItems[itemId];
        return this.getLimit(item) === amount;
    },
    isNotFull(itemId) {
        return !this.isFull(itemId);
    }

};

(function() {

    const _base_Game_Party_maxItems = Game_Party.prototype.maxItems;
    Game_Party.prototype.maxItems = function(item) {
        const limit = ItemLimit.getLimit(item);
        if(limit) {
            return limit;
        }
        return _base_Game_Party_maxItems.call(this, item);
    };
})();
  
  