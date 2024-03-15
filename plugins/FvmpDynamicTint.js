//=============================================================================
// FvmpDynamicTint.js
//=============================================================================

/*:
 * @plugindesc Dynamic tint the screen based on a variable
 * @author fernandovmp
 *
 * @help
 * 
 * Plugin Commands:
 *   Enable - Enable the dynamic tint
 *   Disable - Disable the dynamic tint
 *   Bind - Bind a variable to determine the dynamic tint
 * 
 * States:
 *   Enabled: If the dynamic tint is enabled or not
 *   VariableId: The id of the binded variable
 *   MinValue: The minimum value of the binded variable
 *   MaxValue: The maximum value of the binded variable
 *   ToneStart: The tone colors that the tint start when the variable is in the minimum value
 *   ToneEnd: The tone colors that the tint ends when the variable is in the maximum value
 * 
 * /*~struct~Tone:
 * @param Red
 * @type number
 * @min 0
 * @max 255
 * 
 * @param Green
 * @type number
 * @min 0
 * @max 255
 * 
 * @param Blue
 * @type number
 * @min 0
 * @max 255
 * 
 * @param Alpha
 * @type number
 * @min 0
 * @max 255
 * 
 * @command Enable
 * @text Enable
 * @desc Enable the dynamic tint
 * 
 * @command Disable
 * @text Disable
 * @desc Disable the dynamic tint
 * 
 * @command Bind
 * @text Bind variable
 * @desc Bind variable
 * 
 * @arg Variable
 * @text
 * @type variable
 * @desc
 * @default 1
 * 
 * @arg MinValue
 * @text
 * @type number
 * @desc The minimum value the binded variable can be
 * @default 0
 * 
 * @arg MaxValue
 * @text
 * @type number
 * @desc The maximum value the binded variable can be
 * @default 100
 * 
 * @arg TintStart
 * @text
 * @type struct<Tone>
 * @desc The start tone the screen will be tinted when the variable is at the minimum value
 * 
 * @arg TintEnd
 * @text
 * @type struct<Tone>
 * @desc The end tone the screen will be tinted when the variable is at the maximum value
 * 
 */

var Fvmp = Fvmp || {};
Fvmp.DynamicTint = Fvmp.DynamicTint || {};

Fvmp.DynamicTint.calculateToneNormalizedValue = (start, end, value) => {
    return Math.ceil(start + ((end - start) * value))
}

Fvmp.DynamicTint.calculateTone = ({ toneStart, toneEnd, value, minValue, maxValue }) => {
    const _value = Math.min(maxValue, Math.max(minValue, value));
    const normalized = (_value - minValue) / (maxValue - minValue);
    const tone = [
        Fvmp.DynamicTint.calculateToneNormalizedValue(toneStart[0], toneEnd[0], normalized),
        Fvmp.DynamicTint.calculateToneNormalizedValue(toneStart[1], toneEnd[1], normalized),
        Fvmp.DynamicTint.calculateToneNormalizedValue(toneStart[2], toneEnd[2], normalized),
        Fvmp.DynamicTint.calculateToneNormalizedValue(toneStart[3], toneEnd[3], normalized),
    ];
    return tone;
}

(function() {
    const DURATION = 30;

    Fvmp.defineStates(Fvmp.DynamicTint, {
        enabled: {
            key: 'DynamicTint:Enabled',
            defaultValue: false
        },
        variableId: {
            key: 'DynamicTint:VariableId',
            defaultValue: 0
        },
        minValue: {
            key: 'DynamicTint:MinValue',
            defaultValue: 100
        },
        maxValue: {
            key: 'DynamicTint:MaxValue',
            defaultValue: 100
        },
        toneStart: {
            key: 'DynamicTint:ToneStart',
            defaultValue: [0,0,0,0]
        },
        toneEnd: {
            key: 'DynamicTint:ToneEnd',
            defaultValue: [0,0,0,0]
        },
    })

    const pluginName = 'FvmpDynamicTint';

    PluginManager.registerCommand(pluginName, 'Bind', args => {
        Fvmp.DynamicTint.variableId = Number(args.Variable);
        Fvmp.DynamicTint.minValue = Number(args.MinValue);
        Fvmp.DynamicTint.maxValue = Number(args.MaxValue);
        Fvmp.DynamicTint.toneStart = parseTone(args.TintStart);
        Fvmp.DynamicTint.toneEnd = parseTone(args.TintEnd);
    });

    function parseTone(text) {
        if(!text.startsWith("[") && !text.startsWith("{")) {
            return text.split(',').map(Number);
        }
        const tone = JSON.parse(text);
        if(Array.isArray(tone)) {
            return tone;
        }
        return [tone.Red, tone.Green, tone.Blue, tone.Alpha];
    }

    function calculateTone() {
        const value = $gameVariables.value(Fvmp.DynamicTint.variableId);
        const minValue = Fvmp.DynamicTint.minValue;
        const maxValue = Fvmp.DynamicTint.maxValue;
        return Fvmp.DynamicTint.calculateTone({
            toneStart: Fvmp.DynamicTint.toneStart,
            toneEnd: Fvmp.DynamicTint.toneEnd,
            value,
            minValue,
            maxValue
        });
    }

    PluginManager.registerCommand(pluginName, 'Enable', args => {
        Fvmp.DynamicTint.enabled = true;
    });

    PluginManager.registerCommand(pluginName, 'Disable', args => {
        Fvmp.DynamicTint.enabled = false;
    });


    const _base_Game_Variables_onChange = Game_Variables.prototype.onChange;
    Game_Variables.prototype.onChange = function() {
        _base_Game_Variables_onChange.call(this);
        if(Fvmp.DynamicTint.enabled)
            $gameScreen.startTint(calculateTone(), DURATION);
    };

})();