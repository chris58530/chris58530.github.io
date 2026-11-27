(function () {
  var site = document.getElementById('site');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Language */
  var toggle = document.getElementById('lang-toggle');
  function applyLang(lang) {
    site.dataset.lang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
    toggle.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切換成中文');
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  var initial = (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  try { var saved = localStorage.getItem('lang'); if (saved === 'zh' || saved === 'en') initial = saved; } catch (e) {}
  applyLang(initial);
  toggle.addEventListener('click', function () { applyLang(site.dataset.lang === 'zh' ? 'en' : 'zh'); });

  /* Draggable stickers + parallax */
  var stage = document.getElementById('stage');
  var hero = document.getElementById('hero');
  var z = 10;
  if (stage && hero) {
  stage.querySelectorAll('.stk').forEach(function (el) {
    var sx = 0, sy = 0, ox = 0, oy = 0, moved = 0, dragging = false;
    el.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.dataset.dx || 0); oy = parseFloat(el.dataset.dy || 0);
      el.setPointerCapture(e.pointerId);
      el.classList.add('grab');
      el.style.zIndex = ++z;
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = ox + e.clientX - sx, dy = oy + e.clientY - sy;
      moved = Math.max(moved, Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy));
      el.dataset.dx = dx; el.dataset.dy = dy;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('grab');
      if (moved < 6 && el.dataset.go) {
        var target = document.querySelector(el.dataset.go);
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        else if (el.dataset.go.indexOf('.html') > 0) location.href = el.dataset.go;
      }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  });
  if (canHover && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      stage.style.setProperty('--px', px.toFixed(3));
      stage.style.setProperty('--py', py.toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      stage.style.setProperty('--px', 0);
      stage.style.setProperty('--py', 0);
    });
  }
  }

  /* Beaver quotes + confetti */
  var lines = {
    en: ['Ship it!', 'One more build, I promise.', 'App Review, please be nice…', 'Did you drink water today?', 'Psst, you can drag my apps around.', 'My GitHub is greener than my plants.', "Hi! I'm Chris. Poke my photo."],
    zh: ['上架囉！', '再一個 build 就好，真的。', 'App 審核大人請手下留情…', '今天喝水了嗎？', '偷偷說，我的 App 可以拖來拖去。', '我的 GitHub 比我的盆栽還綠。', '嗨！我是小仔，戳一下照片。']
  };
  var beaver = document.getElementById('poke');
  var bubble = document.getElementById('bubble');
  var li = 0;
  if (beaver && bubble) {
  var colors = ['#FF8A2B', '#D41F84', '#8ED2F2', '#FFCB3D', '#A8DDB0', '#FFFBF4'];
  beaver.addEventListener('click', function () {
    bubble.querySelector('.en').textContent = lines.en[li % lines.en.length];
    bubble.querySelector('.zh').textContent = lines.zh[li % lines.zh.length];
    li++;
    bubble.classList.remove('bump'); void bubble.offsetWidth; bubble.classList.add('bump');
    beaver.classList.remove('boing'); void beaver.offsetWidth; beaver.classList.add('boing');
    if (reduce) return;
    var r = stage.getBoundingClientRect();
    var cx = r.width * 0.47, cy = r.height * 0.42;
    for (var i = 0; i < 16; i++) {
      var p = document.createElement('span');
      p.className = 'burst';
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.background = colors[i % colors.length];
      if (i % 3 === 0) p.style.borderRadius = '4px';
      stage.appendChild(p);
      var a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 140;
      var anim = p.animate([
        { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(a) * d + 'px), calc(-50% + ' + Math.sin(a) * d + 'px)) scale(1) rotate(' + (Math.random() * 360) + 'deg)', opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' });
      anim.onfinish = (function (node) { return function () { node.remove(); }; })(p);
    }
  });
  }

  /* Phone screenshot carousels */
  var sets = document.querySelectorAll('.screen .set');
  var tick = 0;
  if (!reduce) {
    setInterval(function () {
      if (document.hidden) return;
      tick++;
      sets.forEach(function (set) {
        var imgs = set.querySelectorAll('img');
        imgs.forEach(function (img, k) { img.classList.toggle('on', k === tick % imgs.length); });
      });
    }, 2800);
  }

  /* 3D tilt on devices */
  if (canHover && !reduce) {
    document.querySelectorAll('.app').forEach(function (app) {
      var dev = app.querySelector('[data-tilt]');
      if (!dev) return;
      app.addEventListener('pointermove', function (e) {
        var r = app.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        dev.style.setProperty('--ry', (x * 26).toFixed(1) + 'deg');
        dev.style.setProperty('--rx', (-y * 18).toFixed(1) + 'deg');
        dev.style.setProperty('--rz', '0deg');
      });
      app.addEventListener('pointerleave', function () {
        dev.style.removeProperty('--ry'); dev.style.removeProperty('--rx'); dev.style.removeProperty('--rz');
      });
    });
  }

  /* Count-up numbers (they already show the final value at rest) */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = parseInt(el.dataset.to, 10), t0 = performance.now(), dur = 1300;
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur), v = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * v).toLocaleString('en-US') + (el.dataset.suffix || '');
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.num[data-to]').forEach(function (n) { io.observe(n); });
  }

  /* Today: status, log and a live-feeling post */
  (function () {
    if (!document.getElementById('today')) return;
    var lang = function () { return site.dataset.lang === 'zh' ? 'zh' : 'en'; };
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
    var both = function (o) { return '<span class="en">' + esc(o.en) + '</span><span class="zh" lang="zh-Hant">' + esc(o.zh) + '</span>'; };
    function ago(iso) {
      var d = Math.round((new Date(new Date().toDateString()) - new Date(iso + 'T00:00:00')) / 864e5);
      if (d <= 0) return { en: 'today', zh: '今天' };
      if (d === 1) return { en: 'yesterday', zh: '昨天' };
      if (d < 7) return { en: d + ' days ago', zh: d + ' 天前' };
      var m = iso.slice(5).replace('-', '/').replace(/^0/, '');
      return { en: m, zh: m };
    }
    var FEED = 'https://saidayapp.web.app';
    function nm(c) { return lang() === 'en' && c.name_en ? c.name_en : c.name; }
    function avatar(c) {
      return '<span class="av" style="--c:' + (c.color || 'var(--kraft)') + '">' + (c.avatar ? '<img src="' + FEED + c.avatar + '" alt="" width="30" height="30">' : esc(nm(c).charAt(0))) + '</span>';
    }
    function cmtHTML(c, text) {
      return avatar(c) + '<p style="margin:0"><b>' + (c.name_en ? both({ zh: c.name, en: c.name_en }) : esc(c.name)) + '</b>' + (text != null ? esc(text) : both(c)) + '</p>';
    }
    var list = document.getElementById('post-cmts');
    function addCmt(html, cls) { var li = document.createElement('li'); li.className = 'cmt' + (cls ? ' ' + cls : ''); li.innerHTML = html; list.appendChild(li); return li; }
    function typing(c) { return addCmt(avatar(c) + '<span class="typing" aria-label="typing"><i></i><i></i><i></i></span>'); }

    fetch(FEED + '/feed.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
      var w = ago(data.updated);
      var me = data.chris;
      document.getElementById('now-status').innerHTML = esc(me.status.emoji) + ' ' + both(me.status);
      document.getElementById('now-when').innerHTML = both({ en: 'Updated ' + w.en, zh: w.zh + '更新' });
      document.getElementById('now-log').innerHTML = me.log.map(function (it) {
        return '<li><time datetime="' + it.date + '">' + both(ago(it.date)) + '</time><span>' + both(it) + '</span></li>';
      }).join('');

      var p = data.posts[0];
      document.getElementById('post-open').href = p.url;
      document.getElementById('post-when').innerHTML = both(ago(p.date));
      var art = document.getElementById('post-art');
      art.classList.add('is-pic');
      art.innerHTML = '<img src="' + FEED + p.image + '" alt="' + esc(p.alt[lang()]) + '" width="800" height="1000" loading="lazy">';
      document.getElementById('post-cap').innerHTML = '<b>paopao.sai</b>' + both(p);

      var heart = document.getElementById('post-heart'), likes = document.getElementById('post-likes');
      var bots = p.comments.length;
      function renderLikes() {
        var on = heart.getAttribute('aria-pressed') === 'true';
        likes.innerHTML = on ? both({ en: 'You and ' + bots + ' friends like this', zh: '你和 ' + bots + ' 位朋友說讚' }) : both({ en: bots + ' likes', zh: bots + ' 個讚' });
      }
      function like(on) {
        heart.setAttribute('aria-pressed', on ? 'true' : 'false'); renderLikes();
        if (on && !reduce) { var b = document.createElement('span'); b.className = 'burst'; b.textContent = '❤️'; art.appendChild(b); setTimeout(function () { b.remove(); }, 900); }
      }
      renderLikes();
      heart.addEventListener('click', function () { like(heart.getAttribute('aria-pressed') !== 'true'); });
      art.addEventListener('dblclick', function () { like(true); });

      /* Comments arrive one by one once the post is on screen */
      var started = false;
      function play() {
        if (started) return; started = true;
        if (reduce) { p.comments.forEach(function (c) { addCmt(cmtHTML(c)); }); return; }
        var i = 0;
        (function next() {
          if (i >= p.comments.length) return;
          var c = p.comments[i++], t = typing(c);
          setTimeout(function () { t.innerHTML = cmtHTML(c); setTimeout(next, 700 + Math.random() * 900); }, 900 + Math.random() * 700);
        })();
      }
      if ('IntersectionObserver' in window) {
        var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); play(); } }, { threshold: 0.35 });
        o.observe(document.getElementById('now-post'));
      } else play();

      /* Visitor comments get a reply from a virtual friend */
      var replies = {
        zh: { hi: ['嗨嗨！歡迎來玩 👋', '哇有新朋友！你好你好 ✨'], praise: ['對吧！我也這樣覺得 🥹', '你很有眼光欸 ✨', '被你誇到開心轉圈 💫'], ask: ['好問題！問小仔本人最快，聯絡方式在最下面 👇', '這題我也想知道 🤔 直接傳訊息給他吧！'], get: ['App Store 搜「曬日子」就有，我在裡面等你 🫧'], any: ['哈哈哈這句我要截圖 📸', '收到！小仔看到一定很開心', '你的留言讓今天變好了一點 ☀️', '先幫你按個讚 ❤️', '我記住你了，下次再來玩 😆'] },
        en: { hi: ['Hiii! Welcome in 👋', 'Ooh, a new friend! Hello hello ✨'], praise: ['Right?! I think so too 🥹', 'You have great taste ✨', 'Doing a happy little spin 💫'], ask: ['Good question! Chris answers fastest. Contact info is at the bottom 👇', 'I want to know too 🤔 Send him a message!'], get: ['Search "SaiDay" on the App Store. I\'ll be waiting in there 🫧'], any: ['Haha, screenshotting this 📸', 'Got it! Chris is going to love this', 'Your comment just made today a little better ☀️', 'Liked it for you ❤️', 'I\'ll remember you. Come back soon 😆'] }
      };
      function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
      function kind(s) {
        s = s.toLowerCase();
        if (/下載|哪裡|載|download|where|get it|app store/.test(s)) return 'get';
        if (/[?？]|怎麼|為什麼|嗎|how|why|what/.test(s)) return 'ask';
        if (/讚|棒|好看|厲害|可愛|喜歡|愛|好笑|酷|nice|cool|love|great|cute|awesome|amazing|wow/.test(s)) return 'praise';
        if (/^(hi|hello|hey|嗨|哈囉|你好|安安)/.test(s)) return 'hi';
        return 'any';
      }
      var form = document.getElementById('say-form'), input = document.getElementById('say-in'), btn = form.querySelector('button');
      function ph() { input.placeholder = lang() === 'zh' ? '留個言，看誰會回你…' : 'Leave a comment, see who replies…'; input.setAttribute('aria-label', input.placeholder); }
      ph(); toggle.addEventListener('click', ph);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim(); if (!text) return;
        addCmt(cmtHTML({ name: lang() === 'zh' ? '你' : 'you', color: 'var(--sun)' }, text), 'mine');
        input.value = ''; btn.disabled = true;
        var friend = p.comments[Math.floor(Math.random() * p.comments.length)];
        var t = typing(friend);
        setTimeout(function () { t.innerHTML = cmtHTML(friend, pick(replies[lang()][kind(text)])); btn.disabled = false; }, reduce ? 300 : 1100 + Math.random() * 900);
      });
    }).catch(function () { document.getElementById('now-post').hidden = true; });
  })();

  /* Copy email */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.dataset.copy);
      var text = target.textContent.trim();
      function done() { btn.classList.add('is-done'); setTimeout(function () { btn.classList.remove('is-done'); }, 1600); }
      function selectText() { var range = document.createRange(); range.selectNodeContents(target); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, selectText); } else { selectText(); }
    });
  });
})();
