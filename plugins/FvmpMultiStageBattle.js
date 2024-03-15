//=============================================================================
// FvmpMultiStageBattle.js
//=============================================================================

/*:
 * @plugindesc Add a multitroop battle
 * @author fernandovmp
 *
 * @help Use the plugin command to start a battle with multiple troops, after a troop is completely defeated the next one of the
 * list shows up.
 *
 * Plugin Commands:
 *   Process - Process a multi stage battle
 * 
 * @command Process
 * @text Start a multistage battle
 * @desc Start a multistage battle
 * @arg Troops
 * @text
 * @type troop[]
 * @desc
 * @default []
 * 
 */

(function() {

    function toNumber(str, defaultValue) 
    {
        const value = Number(str);
        if(isNaN(value) || !str) {
            return defaultValue;
        }
        return value;
    }
    const pluginName = 'FvmpMultiStageBattle';

    let battleDefinition = {
        troops: [],
        currentIndex: -1,
    }

    let accumulatedExp

    PluginManager.registerCommand(pluginName, 'Process', args => {
        const troops = JSON.parse(args.Troops).map(Number);

        if(!troops.length) {
            return;
        }
        battleDefinition = {
            troops,
            currentIndex: -1
        };

        const troopId = advanceToNextBattle();
        BattleManager.setup(troopId, false, false);
        // BattleManager.setEventCallback(n => {
        // });
        $gamePlayer.makeEncounterCount();
        SceneManager.push(Scene_Battle_MultiStage);
    });

    function Scene_Battle_MultiStage() {
        this.initialize(...arguments);
    }

    Scene_Battle_MultiStage.prototype = Object.create(Scene_Battle.prototype);
    Scene_Battle_MultiStage.prototype.constructor = Scene_Battle_MultiStage;

    const _base_Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle_MultiStage.prototype.start = function() {
        _base_Scene_Battle_start.apply(this, arguments);
    }

    const _base_BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if (this._phase && SceneManager._scene.constructor === Scene_Battle_MultiStage) {
            if ($gameTroop.isAllDead() && hasPendentBattle()) {
                BattleManager.makeRewards();
                this._actionBattlers = [];
                advanceToNextBattle();
                BattleManager._spriteset.createEnemies();
                return false;
            }
        }
        return _base_BattleManager_checkBattleEnd.call(this);
    };

    function hasPendentBattle() {
        return (battleDefinition.currentIndex + 1) < battleDefinition.troops.length;
    }

    function advanceToNextBattle() {
        battleDefinition.currentIndex++;
        if(battleDefinition.currentIndex < battleDefinition.troops.length) {
            const id = battleDefinition.troops[battleDefinition.currentIndex];
            $gameTroop.setup(id);
            return id;
        }
        return -1;
    }

    const _base_BattleManager_makeRewards = BattleManager.makeRewards;
    BattleManager.makeRewards = function() {
        if(SceneManager._scene.constructor === Scene_Battle_MultiStage) {
            this._rewards = {
                gold: $gameTroop.goldTotal() + (this._rewards.gold ?? 0),
                exp: $gameTroop.expTotal() + (this._rewards.exp ?? 0),
                items: $gameTroop.makeDropItems().concat((this._rewards.items ?? []))
            };
        }
        else {
            _base_BattleManager_makeRewards.call(this);
        }
    };
  })();
  
  