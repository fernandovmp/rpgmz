//=============================================================================
// FvmpTugOfWarBattleSystem.js
//=============================================================================

/*:
 * @plugindesc Add a tug of war mechanic to the battle.
 * @author fernandovmp
 *
 * @help
 * 
 * Add <towAddValue:number> to the meta field of an item or skill to add to the gauge value
 * the specified number when that skill or item is used
 *
 * Add <towRequireValue:number> along side with:
 *     - <towRequire:gte> to only enable the use of a skill when the gauge value is greater or equal the value
 *     - <towRequire:lte> to only enable the use of a skill when the gauge value is lower or equal the value
 *
 * In the damge formula, you can use the "g" variable to reference the current value of the gauge
 * 
 *    g.value -> references the current raw value of the gauge
 *    g.rate -> references the relative value (a number between 0 and 1) of the gauge
 *    g.each(step, base) -> returns how many steps of "step" the gauge has above the "base" value, example:
 *                          g.each(5, 50) returns 2 if the gauge value is between 60 and 64.
 *    g.ueach(step, base) -> returns how many steps of "step" the gauge has above the "base" value, example:
 *                          g.ueach(5, 50) returns 2 if the gauge value is between 40 and 36.
 *    g.mEach(times, step, base) -> returns times * g.each(step, base)
 *    g.mUeach(times, step, base) -> returns times * g.ueach(step, base)
 * 
 * @param name
 * @desc Name displayed in the battle gauge
 * @default ""
 * 
 * @param defaultStartValue
 * @desc Default value that the gauges starts with
 * @type number
 * @default 50
 * 
 * Plugin Commands:
 *   ForceTugOfWarStartPoint - Change the next battle start point for the gauge.
 *   Bind - Bind a game variable to the gauge value.
 * 
 * @command ForceTugOfWarStartPoint
 * @text Force Tug Of War start point
 * @desc Forces the next battle to start with the specified value on the Tug of War gauge
 * @arg Value
 * @text
 * @type number
 * @desc
 * @default 100
 * 
 * @command Bind
 * @text Bind variable
 * @desc
 * @arg Variable
 * @text
 * @type variable
 * @desc
 * @default 1
 * @arg Mode
 * @text
 * @type number
 * @desc Bind mode 0 => Default 1 => Reset on battle end
 * @default 0
 * 
 */

var Fvmp = Fvmp || {};
Fvmp.TugOfWar = Fvmp.TugOfWar || {};
Fvmp.TugOfWar.startGaugeValue = undefined;
Fvmp.TugOfWar.initGauge = () => {
    return { min: 0, max: 100, current: 0 };
}
Fvmp.TugOfWar.gauge = Fvmp.TugOfWar.initGauge();
Fvmp.TugOfWar.onGaugeChange = () => {};

Fvmp.TugOfWar.moveGauge = (value) => {
    const gauge = Fvmp.TugOfWar.gauge;
    gauge.current = Math.min(gauge.max, Math.max(gauge.current + value, gauge.min));
    if(Fvmp.TugOfWar.variableId) {
        $gameVariables.setValue(Fvmp.TugOfWar.variableId, gauge.current);
    }
    Fvmp.TugOfWar.onGaugeChange();
    return gauge.current;
}

let $currentGaugeValue;
let $getTowGauge;

(function() {

    function toNumber(str, defaultValue) 
    {
        const value = Number(str);
        if(isNaN(value) || !str) {
            return defaultValue;
        }
        return value;
    }
    const pluginName = 'FvmpTugOfWarBattleSystem';
    const parameters = PluginManager.parameters(pluginName);
    const gaugeName = parameters['name'] || "";
    const defaultStartValue = toNumber(parameters['defaultStartValue'], 50);

    Fvmp.defineStates(Fvmp.TugOfWar, {
        variableId: {
            key: 'TugOfWar:VariableId',
            defaultValue: 0
        },
        bindMode: {
            key: 'TugOfWar:BindMode',
            defaultStartValue: 0,
        }
    });

    let startGaugeValue = undefined;
    let resetValue = defaultStartValue;

    PluginManager.registerCommand(pluginName, 'ForceTugOfWarStartPoint', args => {
        startGaugeValue = toNumber(args.Value, undefined);
    });

    PluginManager.registerCommand(pluginName, 'Bind', args => {
        Fvmp.TugOfWar.variableId = toNumber(args.Variable, 0);
        Fvmp.TugOfWar.bindMode = toNumber(args.Mode, 0);
    });

    PluginManager.registerCommand(pluginName, 'Unbind', args => {
        Fvmp.TugOfWar.variableId = 0;
        Fvmp.TugOfWar.bindMode = 0;
    });

    const gauge = Fvmp.TugOfWar.gauge;

    $currentGaugeValue = function() {
        return gauge.current;
    }

    $getTowGauge = function() {
        return gauge;
    }

    const _base_Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _base_Scene_Battle_start.apply(this, arguments);
        initGauge();
        this.createTugOfWarWindow();
    }

    Scene_Battle.prototype.createTugOfWarWindow = function() {
        this._tugOfWarWindow = new Window_TugOfWar_Status();
        this.addWindow(this._tugOfWarWindow);
        BattleManager.setTowWindowStatus(this._tugOfWarWindow);
    }


    function initGauge() {
        let start = defaultStartValue;
        if(startGaugeValue !== undefined) {
            start = startGaugeValue;
            startGaugeValue = undefined;
        }
        if(Fvmp.TugOfWar.variableId) {
            start = $gameVariables.value(Fvmp.TugOfWar.variableId);
            if(Fvmp.TugOfWar.bindMode === 1) {
                resetValue = start;
            }
        }
        gauge.current = Math.max(0, Math.min(start, 100));
        Fvmp.TugOfWar.onGaugeChange();
    }

    const _base_Scene_Battle_stop = Scene_Battle.prototype.stop;
    Scene_Battle.prototype.stop = function () {
        _base_Scene_Battle_stop.call(this);
        if(Fvmp.TugOfWar.bindMode === 1) {
            $gameVariables.setValue(Fvmp.TugOfWar.variableId, resetValue);
        }
    }


    const _base_BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _base_BattleManager_initMembers.apply(this);
        this._towWindowStatus = null;
    }


    BattleManager.setTowWindowStatus = function(window) {
        this._towWindowStatus = window;
    }

    const _base_BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        const action = this._action;
        const value = action.item().meta.towAddValue;
        if(value) {
            const numValue = Number(value);
            Fvmp.TugOfWar.moveGauge(numValue);
            this._towWindowStatus.refresh();
        }
        _base_BattleManager_endAction.apply(this);
    }

    const _base_Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;

    Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
        return _base_Game_BattlerBase_meetsSkillConditions.call(this, skill) && canUseGaugeSkill(skill);
    };

    const comparers = {
        lte: function (val, gauge) { return gauge.current <= val },
        gte: function (val, gauge) { return gauge.current >= val }
    };

    function canUseGaugeSkill(skill) {
        const comparer = skill.meta.towRequire;
        const value = toNumber(skill.meta.towRequireValue, undefined);
        if(!comparer || !comparers[comparer] || value === undefined) return true;

        return comparers[comparer](value, gauge);
    }

    Game_Action.prototype.evalDamageFormula = function(target) {
        try {
            const item = this.item();
            const a = this.subject();
            const b = target;
            const v = $gameVariables._data;
            const g = {
                value: gauge.current,
                rate: gauge.current / gauge.max,
                each(step, base) {
                    return Math.round(Math.max(0, gauge.current - base) / step)
                },
                ueach(step, base) {
                    return Math.round(Math.max(0, base - gauge.current) / step)
                },
                mEach(times, step, base) {
                    return times * this.each(step, base);
                },
                mUeach(times, step, base) {
                    return times * this.ueach(step, base);
                },
            }
            const sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
            const value = Math.max(eval(item.damage.formula), 0) * sign;
            if (isNaN(value)) value = 0;
            return value;
        } catch (e) {
            return 0;
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_Tow_Gauge
    //
    // The sprite for displaying a status gauge.

    function Sprite_Tow_Gauge() {
        this.initialize(...arguments);
    }

    Sprite_Tow_Gauge.prototype = Object.create(Sprite_Base_Gauge.prototype);
    Sprite_Tow_Gauge.prototype.constructor = Sprite_Tow_Gauge;
    
    Sprite_Tow_Gauge.prototype.currentValue = function() {
        return gauge.current;
    };

    Sprite_Tow_Gauge.prototype.currentMaxValue = function() {
        return gauge.max;
    };

    Sprite_Tow_Gauge.prototype.bitmapWidth = function() {
        return 400;
    };

    Sprite_Tow_Gauge.prototype.bitmapHeight = function() {
        return 42;
    };

    Sprite_Tow_Gauge.prototype.label = function() {
        return `${gaugeName} ${this.currentValue()}/${this.currentMaxValue()}`;
    };

    Sprite_Tow_Gauge.prototype.labelAlign = function() {
        return 'center';
    };

    Sprite_Tow_Gauge.prototype.gaugeColor1 = function() {
        return ColorManager.mpGaugeColor1();
    };

    Sprite_Tow_Gauge.prototype.gaugeColor2 = function() {
        return ColorManager.mpGaugeColor2();
    };

    Sprite_Tow_Gauge.prototype.labelColor = function() {
        return ColorManager.systemColor();
    };

    Sprite_Tow_Gauge.prototype.gaugeX = function() {
        return 0;
    };

    Sprite_Tow_Gauge.prototype.labelY = function() {
        return 0;
    };

    Sprite_Tow_Gauge.prototype.drawValue = function () {}

    function Window_TugOfWar_Status() {
        this.initialize.apply(this, arguments);
    }

    Window_TugOfWar_Status.prototype = Object.create(Window_Base.prototype);
    Window_TugOfWar_Status.prototype.constructor = Window_TugOfWar_Status;
    Window_TugOfWar_Status.prototype.initialize = function() {
        const width = 400;
        const x = Graphics.boxWidth / 2 - width / 2;
        const rect =  new Rectangle(x, 0, width, 70);
        Window_Base.prototype.initialize.call(this, rect)
        this._gauge = this.drawTugOfWarGauge(0, 0);
    }

    Window_TugOfWar_Status.prototype.refresh = function() {
        this._gauge.update();
    };

    Window_TugOfWar_Status.prototype.drawTugOfWarGauge = function(x, y) {
        const sprite = new Sprite_Tow_Gauge();
        sprite.setup(gauge.current, gauge.max);
        sprite.move(x, y);
        sprite.show();
        this.addInnerChild(sprite);
        return sprite;
    }
  
  })();
  
  