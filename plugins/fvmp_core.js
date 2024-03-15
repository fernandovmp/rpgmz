//=============================================================================
// fvmp_core.js
//=============================================================================

/*:
 * @plugindesc add core functionality to the others "Fvmp" plugins
 * @author fernandovmp
 *
 * @help
 * 
 * This plugin override the following behaviours
 * - DataManager > Save: Add to and reads from the save contents the values inside the Fvmp.State variable.
 * 
 * In this plugin is defined the folowing classes
 * - Sprite_Base_Gauge
 * 
 */

var Fvmp = Fvmp || {};
Fvmp.State = Fvmp.State || {};

Fvmp.getState = (key, defaultValue) => {
    const state = Fvmp.State || {};
    if(state[key] !== undefined) {
        return state[key];
    }
    return defaultValue;
}

Fvmp.setState = (key, value) => {
    Fvmp.State = Fvmp.State || {};
    Fvmp.State[key] = value;
}

Fvmp.defineStates = (o, states) => {
    const def = {};
    for(const key of Object.keys(states)) {
        const state = states[key];
        def[key] = {
            get() {
                return Fvmp.getState(state.key, state.defaultValue);
            },
            set(value) {
                Fvmp.setState(state.key, value);
            }
        };
    }
    Object.defineProperties(o, def);
}

const _base_DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    const contents = _base_DataManager_makeSaveContents();
    contents.FvmpState = Fvmp.State || {};
    return contents;
};

const _base_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    _base_DataManager_extractSaveContents(contents);
    Fvmp.State = contents.FvmpState || {};
};

//-----------------------------------------------------------------------------
// Sprite_Base_Gauge
//
// The sprite for displaying a basic gauge.

function Sprite_Base_Gauge() {
    this.initialize(...arguments);
}

Sprite_Base_Gauge.prototype = Object.create(Sprite.prototype);
Sprite_Base_Gauge.prototype.constructor = Sprite_Base_Gauge;

Sprite_Base_Gauge.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.initMembers();
    this.createBitmap();
};

Sprite_Base_Gauge.prototype.initMembers = function() {
    this._value = NaN;
    this._maxValue = NaN;
    this._targetValue = NaN;
    this._targetMaxValue = NaN;
    this._duration = 0;
};

Sprite_Base_Gauge.prototype.destroy = function(options) {
    this.bitmap.destroy();
    Sprite.prototype.destroy.call(this, options);
};

Sprite_Base_Gauge.prototype.createBitmap = function() {
    const width = this.bitmapWidth();
    const height = this.bitmapHeight();
    this.bitmap = new Bitmap(width, height);
};

Sprite_Base_Gauge.prototype.bitmapWidth = function() {
    return 128;
};

Sprite_Base_Gauge.prototype.bitmapHeight = function() {
    return 24;
};

Sprite_Base_Gauge.prototype.gaugeHeight = function() {
    return 12;
};

Sprite_Base_Gauge.prototype.gaugeX = function() {
    return 30;
};

Sprite_Base_Gauge.prototype.labelY = function() {
    return 3;
};

Sprite_Base_Gauge.prototype.labelFontFace = function() {
    return $gameSystem.mainFontFace();
};

Sprite_Base_Gauge.prototype.labelFontSize = function() {
    return $gameSystem.mainFontSize() - 2;
};

Sprite_Base_Gauge.prototype.valueFontFace = function() {
    return $gameSystem.numberFontFace();
};

Sprite_Base_Gauge.prototype.valueFontSize = function() {
    return $gameSystem.mainFontSize() - 6;
};

Sprite_Base_Gauge.prototype.setup = function(value, max) {
    this._value = value;
    this._maxValue = max;
    this.updateBitmap();
};

Sprite_Base_Gauge.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateBitmap();
};

Sprite_Base_Gauge.prototype.updateBitmap = function() {
    const value = this.currentValue();
    const maxValue = this.currentMaxValue();
    if (value !== this._targetValue || maxValue !== this._targetMaxValue) {
        this.updateTargetValue(value, maxValue);
    }
    this.updateGaugeAnimation();
};

Sprite_Base_Gauge.prototype.updateTargetValue = function(value, maxValue) {
    this._targetValue = value;
    this._targetMaxValue = maxValue;
    if (isNaN(this._value)) {
        this._value = value;
        this._maxValue = maxValue;
        this.redraw();
    } else {
        this._duration = this.smoothness();
    }
};

Sprite_Base_Gauge.prototype.smoothness = function() {
    return 20;
};

Sprite_Base_Gauge.prototype.updateGaugeAnimation = function() {
    if (this._duration > 0) {
        const d = this._duration;
        this._value = (this._value * (d - 1) + this._targetValue) / d;
        this._maxValue = (this._maxValue * (d - 1) + this._targetMaxValue) / d;
        this._duration--;
        this.redraw();
    }
};

Sprite_Base_Gauge.prototype.isValid = function() {
    return true;
};

Sprite_Base_Gauge.prototype.currentValue = function() {
    return this._value;
};

Sprite_Base_Gauge.prototype.currentMaxValue = function() {
    return this._maxValue;
};

Sprite_Base_Gauge.prototype.label = function() {
    return "";
};

Sprite_Base_Gauge.prototype.gaugeBackColor = function() {
    return ColorManager.gaugeBackColor();
};

Sprite_Base_Gauge.prototype.gaugeColor1 = function() {
    return ColorManager.normalColor();
};

Sprite_Base_Gauge.prototype.gaugeColor2 = function() {
    return ColorManager.normalColor();
};

Sprite_Base_Gauge.prototype.labelColor = function() {
    return ColorManager.systemColor();
};

Sprite_Base_Gauge.prototype.labelOutlineColor = function() {
    return ColorManager.outlineColor();
};

Sprite_Base_Gauge.prototype.labelOutlineWidth = function() {
    return 3;
};

Sprite_Base_Gauge.prototype.valueColor = function() {
    return ColorManager.normalColor();
};

Sprite_Base_Gauge.prototype.valueOutlineColor = function() {
    return "rgba(0, 0, 0, 1)";
};

Sprite_Base_Gauge.prototype.valueOutlineWidth = function() {
    return 2;
};

Sprite_Base_Gauge.prototype.redraw = function() {
    this.bitmap.clear();
    const currentValue = this.currentValue();
    if (!isNaN(currentValue)) {
        this.drawGauge();
        if (this._statusType !== "time") {
            this.drawLabel();
            if (this.isValid()) {
                this.drawValue();
            }
        }
    }
};

Sprite_Base_Gauge.prototype.drawGauge = function() {
    const gaugeX = this.gaugeX();
    const gaugeY = this.bitmapHeight() - this.gaugeHeight();
    const gaugewidth = this.bitmapWidth() - gaugeX;
    const gaugeHeight = this.gaugeHeight();
    this.drawGaugeRect(gaugeX, gaugeY, gaugewidth, gaugeHeight);
};

Sprite_Base_Gauge.prototype.drawGaugeRect = function(x, y, width, height) {
    const rate = this.gaugeRate();
    const fillW = Math.floor((width - 2) * rate);
    const fillH = height - 2;
    const color0 = this.gaugeBackColor();
    const color1 = this.gaugeColor1();
    const color2 = this.gaugeColor2();
    this.bitmap.fillRect(x, y, width, height, color0);
    this.bitmap.gradientFillRect(x + 1, y + 1, fillW, fillH, color1, color2);
};

Sprite_Base_Gauge.prototype.gaugeRate = function() {
    if (this.isValid()) {
        const value = this._value;
        const maxValue = this._maxValue;
        return maxValue > 0 ? value / maxValue : 0;
    } else {
        return 0;
    }
};

Sprite_Base_Gauge.prototype.labelX = function() {
    return this.labelOutlineWidth() / 2;
}

Sprite_Base_Gauge.prototype.labelAlign = function() {
    return 'left';
}

Sprite_Base_Gauge.prototype.drawLabel = function() {
    const label = this.label();
    const x = this.labelX();
    const y = this.labelY();
    const width = this.bitmapWidth();
    const height = this.bitmapHeight();
    this.setupLabelFont();
    this.bitmap.paintOpacity = this.labelOpacity();
    this.bitmap.drawText(label, x, y, width, height, this.labelAlign());
    this.bitmap.paintOpacity = 255;
};

Sprite_Base_Gauge.prototype.setupLabelFont = function() {
    this.bitmap.fontFace = this.labelFontFace();
    this.bitmap.fontSize = this.labelFontSize();
    this.bitmap.textColor = this.labelColor();
    this.bitmap.outlineColor = this.labelOutlineColor();
    this.bitmap.outlineWidth = this.labelOutlineWidth();
};

Sprite_Base_Gauge.prototype.labelOpacity = function() {
    return this.isValid() ? 255 : 160;
};

Sprite_Base_Gauge.prototype.setValue = function(value) {
    this._targetValue = value;
};

Sprite_Base_Gauge.prototype.drawValue = function() {
    const currentValue = this.currentValue();
    const width = this.bitmapWidth();
    const height = this.bitmapHeight();
    this.setupValueFont();
    this.bitmap.drawText(currentValue, 0, 0, width, height, "right");
};

Sprite_Base_Gauge.prototype.setupValueFont = function() {
    this.bitmap.fontFace = this.valueFontFace();
    this.bitmap.fontSize = this.valueFontSize();
    this.bitmap.textColor = this.valueColor();
    this.bitmap.outlineColor = this.valueOutlineColor();
    this.bitmap.outlineWidth = this.valueOutlineWidth();
};
