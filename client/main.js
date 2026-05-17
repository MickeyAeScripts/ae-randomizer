(function () {
  function evalEx(script, cb) {
    cb = cb || function () {};
    if (window.__adobe_cep__) {
      window.__adobe_cep__.evalScript(script, cb);
    } else {
      // Browser-preview fallback
      console.log("[evalScript]", script);
      cb("(no host)");
    }
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  function readCard(id) {
    var card = $('.card[data-id="' + id + '"]');
    var modeEl = $('[data-mode]', card);
    var opts = {
      enabled: $('[data-enable]', card).checked,
      mode: modeEl ? modeEl.value : null
    };
    $$('input[data-k]', card).forEach(function (el) {
      var k = el.getAttribute('data-k');
      if (el.type === 'checkbox') opts[k] = el.checked;
      else opts[k] = parseFloat(el.value);
    });
    if (id === 'rotation') {
      $$('input[data-axis]', card).forEach(function (el) {
        opts[el.getAttribute('data-axis')] = el.checked;
      });
    }
    return opts;
  }

  function syncDisabled() {
    $$('.card').forEach(function (c) {
      c.classList.toggle('disabled', !$('[data-enable]', c).checked);
    });
  }
  $$('.card [data-enable]').forEach(function (el) {
    el.addEventListener('change', syncDisabled);
  });
  syncDisabled();

  var status = $('#status');
  function setStatus(text, kind) {
    status.textContent = text;
    status.className = kind || '';
  }

  function call(fn, opts) {
    var json = JSON.stringify(opts).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    var script = 'RND.' + fn + "('" + json + "')";
    evalEx(script, function (r) {
      if (!r) { setStatus('No response from AE.', 'err'); return; }
      if (r.indexOf('ERR:') === 0) setStatus(r, 'err');
      else setStatus(r, 'ok');
    });
  }

  $$('.card').forEach(function (card) {
    var id = card.getAttribute('data-id');
    var btn = $('[data-go]', card);
    if (btn) btn.addEventListener('click', function () { call(id, readCard(id)); });
  });

  $('#all').addEventListener('click', function () {
    var payload = {
      position: readCard('position'),
      rotation: readCard('rotation'),
      scale:    readCard('scale'),
      opacity:  readCard('opacity')
    };
    call('all', payload);
  });
})();
