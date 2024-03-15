//=============================================================================
// FvmpVariableGauge.js
//=============================================================================

/*:
 * @plugindesc Window to display a variable value in the map
 * @author fernandovmp
 *
 * @help
 * 
 * 
 * Plugin Commands:
 *   Show - Show gauge
 *   Hide - Hide gauge
 * 
 * @command Show
 * @text Show gauge
 * @desc Show gauge
 * 
 * @command Hide
 * @text Hide gauge
 * @desc Hide gauge
 * 
 * @command Bind
 * @text Bind variable
 * @desc Bind variable
 * 
 * @arg Variable
 * @text
 * @type variable
 * @desc
 * 
 * @arg Name
 * @text
 * @type text
 * @desc
 * @default 
 * 
 * @arg MaxValue
 * @text
 * @type number
 * @desc
 * @default 100
 * 
 */

var Fvmp = Fvmp || {};
Fvmp.State.VariableGauge = Fvmp.State.VariableGauge || {};

(function() {

    const keyEnabled = 'VariableGauge:Enabled';
    const keyVariableId = 'VariableGauge:VariableId';
    const keyDisplayName = 'VariableGauge:DisplayName';
    const keyMaxValue = 'VariableGauge:MaxValue';

    const pluginName = 'VariableGauge';

    PluginManager.registerCommand(pluginName, 'Bind', args => {
        Fvmp.setState(keyVariableId, Number(args.Variable));
        Fvmp.setState(keyDisplayName, args.Name);
        Fvmp.setState(keyMaxValue, Number(args.MaxValue));
    });


    PluginManager.registerCommand(pluginName, 'Show', args => {
        if(SceneManager._scene && SceneManager._scene.constructor === Scene_Map) {
            Fvmp.setState(keyEnabled, true);
            SceneManager._scene._variableGaugeWindow.show();
        }
    });

    PluginManager.registerCommand(pluginName, 'Hide', args => {
        if(SceneManager._scene && SceneManager._scene.constructor === Scene_Map) {
            Fvmp.setState(keyEnabled, false);
            SceneManager._scene._variableGaugeWindow.hide();
        }
    });

    //-----------------------------------------------------------------------------
    // Sprite_Variable_Gauge
    //
    // The sprite for displaying a status gauge.

    function Sprite_Variable_Gauge() {
        this.initialize(...arguments);
    }

    Sprite_Variable_Gauge.prototype = Object.create(Sprite_Base_Gauge.prototype);
    Sprite_Variable_Gauge.prototype.constructor = Sprite_Variable_Gauge;
    
    Sprite_Variable_Gauge.prototype.currentValue = function() {
        const value = $gameVariables.value(Fvmp.getState(keyVariableId, 0));
        const maxValue = Fvmp.getState(keyMaxValue, 100);
        return value < 0 ? 0 : value > maxValue ? maxValue : value;
    };

    Sprite_Variable_Gauge.prototype.currentMaxValue = function() {
        return Fvmp.getState(keyMaxValue, 100);
    };

    Sprite_Variable_Gauge.prototype.bitmapWidth = function() {
        return 180;
    };

    Sprite_Variable_Gauge.prototype.bitmapHeight = function() {
        return 42;
    };

    Sprite_Variable_Gauge.prototype.label = function() {
        return `${Fvmp.getState(keyDisplayName, "")} ${this.currentValue()}/${this.currentMaxValue()}`;
    };

    Sprite_Variable_Gauge.prototype.labelAlign = function() {
        return 'center';
    };

    Sprite_Variable_Gauge.prototype.gaugeColor1 = function() {
        return ColorManager.mpGaugeColor1();
    };

    Sprite_Variable_Gauge.prototype.gaugeColor2 = function() {
        return ColorManager.mpGaugeColor2();
    };

    Sprite_Variable_Gauge.prototype.labelColor = function() {
        return ColorManager.systemColor();
    };

    Sprite_Variable_Gauge.prototype.gaugeX = function() {
        return 0;
    };

    Sprite_Variable_Gauge.prototype.labelY = function() {
        return 0;
    };

    Sprite_Variable_Gauge.prototype.drawValue = function () {}

    function Window_Variable_Status() {
        this.initialize.apply(this, arguments);
    }

    Window_Variable_Status.prototype = Object.create(Window_Base.prototype);
    Window_Variable_Status.prototype.constructor = Window_Variable_Status;
    Window_Variable_Status.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect)
        this._gauge = this.drawVariable(0, 0);
    }

    Window_Variable_Status.prototype.refresh = function() {
        this._gauge.update();
    };

    Window_Variable_Status.prototype.drawVariable = function(x, y) {
        const sprite = new Sprite_Variable_Gauge();
        sprite.setup($gameVariables.value(Fvmp.getState(keyVariableId, 0)), Fvmp.getState(keyMaxValue, 100));
        sprite.move(x, y);
        sprite.show();
        this.addInnerChild(sprite);
        return sprite;
    }

    const _base_Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _base_Scene_Map_createAllWindows.call(this);
        this.createVariableGaugeWindow();   
    };
    
    Scene_Map.prototype.createVariableGaugeWindow = function() {
        const rect = this.variableGaugeWindowRect();
        this._variableGaugeWindow = new Window_Variable_Status(rect);
        this.addWindow(this._variableGaugeWindow);
        if(!Fvmp.getState(keyEnabled, false))
            this._variableGaugeWindow.hide();
    };

    Scene_Map.prototype.variableGaugeWindowRect = function() {
        const width = 200;
        const height = 70;
        const x = Graphics.boxWidth / 2 - width / 2;
        const y = 0;
        return new Rectangle(x, y, width, height);
    };
})();