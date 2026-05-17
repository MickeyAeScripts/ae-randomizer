// Auto-loaded by the CEP panel via manifest <ScriptPath>.
// Defines RND.* — called by client/main.js via evalScript.

var RND = (function () {

    function rand(min, max) { return min + Math.random() * (max - min); }

    function activeComp() {
        var it = app.project.activeItem;
        return (it && it instanceof CompItem) ? it : null;
    }
    function selectedLayers(comp) {
        var out = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var L = comp.selectedLayers[i];
            if (!L.locked) out.push(L);
        }
        return out;
    }
    function parse(json) { return eval("(" + json + ")"); }

    function _position(layers, o) {
        for (var i = 0; i < layers.length; i++) {
            var L = layers[i];
            var p = L.property("ADBE Transform Group").property("ADBE Position");
            if (!p) continue;
            var cur = p.value;
            var is3D = L.threeDLayer;
            var dx = rand(o.xmin, o.xmax);
            var dy = rand(o.ymin, o.ymax);
            var dz = is3D ? rand(o.zmin, o.zmax) : 0;
            if (o.mode === "Add") {
                p.setValue(is3D ? [cur[0] + dx, cur[1] + dy, cur[2] + dz]
                                : [cur[0] + dx, cur[1] + dy]);
            } else {
                p.setValue(is3D ? [dx, dy, dz] : [dx, dy]);
            }
        }
    }

    function _rotation(layers, o) {
        for (var i = 0; i < layers.length; i++) {
            var L = layers[i];
            var xform = L.property("ADBE Transform Group");
            if (L.threeDLayer) {
                var axes = ["ADBE Rotate X", "ADBE Rotate Y", "ADBE Rotate Z"];
                var on = [o.x, o.y, o.z];
                for (var a = 0; a < 3; a++) {
                    if (!on[a]) continue;
                    var rp = xform.property(axes[a]);
                    if (!rp) continue;
                    var v = rand(o.min, o.max);
                    rp.setValue(o.mode === "Add" ? rp.value + v : v);
                }
            } else {
                var rz = xform.property("ADBE Rotate Z");
                if (!rz) continue;
                var rv = rand(o.min, o.max);
                rz.setValue(o.mode === "Add" ? rz.value + rv : rv);
            }
        }
    }

    function _scale(layers, o) {
        for (var i = 0; i < layers.length; i++) {
            var L = layers[i];
            var sp = L.property("ADBE Transform Group").property("ADBE Scale");
            if (!sp) continue;
            var cur = sp.value;
            var is3D = L.threeDLayer;
            var sx, sy, sz;
            if (o.uniform) {
                sx = sy = sz = rand(o.min, o.max);
            } else {
                sx = rand(o.min, o.max);
                sy = rand(o.min, o.max);
                sz = is3D ? rand(o.min, o.max) : 100;
            }
            if (o.mode === "Multiply") {
                sx = cur[0] * (sx / 100);
                sy = cur[1] * (sy / 100);
                if (is3D) sz = cur[2] * (sz / 100);
            }
            sp.setValue(is3D ? [sx, sy, sz] : [sx, sy]);
        }
    }

    function _opacity(layers, o) {
        for (var i = 0; i < layers.length; i++) {
            var op = layers[i].property("ADBE Transform Group").property("ADBE Opacity");
            if (!op) continue;
            var v = rand(o.min, o.max);
            if (v < 0) v = 0; if (v > 100) v = 100;
            op.setValue(v);
        }
    }

    function _wrap(label, fn) {
        var c = activeComp();
        if (!c) return "ERR: No active comp.";
        var layers = selectedLayers(c);
        if (layers.length === 0) return "ERR: No (unlocked) layers selected.";
        app.beginUndoGroup("Randomize " + label);
        try { fn(layers); }
        catch (e) { app.endUndoGroup(); return "ERR: " + e.toString(); }
        app.endUndoGroup();
        return "Randomized " + label + " on " + layers.length + " layer(s).";
    }

    return {
        position: function (json) { var o = parse(json); return _wrap("Position", function (L) { _position(L, o); }); },
        rotation: function (json) { var o = parse(json); return _wrap("Rotation", function (L) { _rotation(L, o); }); },
        scale:    function (json) { var o = parse(json); return _wrap("Scale",    function (L) { _scale(L, o); }); },
        opacity:  function (json) { var o = parse(json); return _wrap("Opacity",  function (L) { _opacity(L, o); }); },
        all: function (json) {
            var o = parse(json);
            return _wrap("All", function (L) {
                if (o.position && o.position.enabled) _position(L, o.position);
                if (o.rotation && o.rotation.enabled) _rotation(L, o.rotation);
                if (o.scale    && o.scale.enabled)    _scale(L, o.scale);
                if (o.opacity  && o.opacity.enabled)  _opacity(L, o.opacity);
            });
        }
    };
})();
