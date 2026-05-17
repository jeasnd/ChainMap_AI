(function (global) {
  var MARKET_LABEL = { US: "美股", A: "A股", HK: "港股", KR: "韩股" };

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function escapeHtml(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTime(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      return d.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return iso;
    }
  }

  function fetchJson(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("无法加载 " + path);
      return r.json();
    });
  }

  function loadCatalog() {
    return Promise.all([fetchJson("data/hot-topics.json"), fetchJson("data/stocks.json")]).then(function (arr) {
      var stockMap = {};
      (arr[1].stocks || []).forEach(function (s) {
        stockMap[s.id] = s;
      });
      return { topics: arr[0], stocks: arr[1], stockMap: stockMap };
    });
  }

  function sortTopics(list) {
    var active = [];
    var archived = [];
    list.forEach(function (t) {
      (t.archived ? archived : active).push(t);
    });
    function cmp(a, b) {
      var ta = new Date(a.updatedAt || 0).getTime();
      var tb = new Date(b.updatedAt || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b.heatScore || 0) - (a.heatScore || 0);
    }
    active.sort(cmp);
    archived.sort(cmp);
    return active.concat(archived);
  }

  function starsHtml(n) {
    var max = 5;
    var filled = Math.min(max, Math.max(0, n || 0));
    var out = '<span class="stars" aria-label="' + filled + ' 星">';
    for (var i = 0; i < max; i++) {
      out += '<span class="star' + (i < filled ? " is-on" : "") + '">★</span>';
    }
    return out + "</span>";
  }

  function marketBadge(market) {
    return (
      '<span class="market-badge market-badge--' +
      escapeHtml(market) +
      '">' +
      escapeHtml(MARKET_LABEL[market] || market) +
      "</span>"
    );
  }

  function renderHotTopics(container, catalog) {
    var sorted = sortTopics(catalog.topics.topics || []);
    var meta = catalog.topics.meta || {};
    var html = "";

    if (meta.updatedAt) {
      html += '<p class="feed-meta">数据更新：' + escapeHtml(formatTime(meta.updatedAt)) + "</p>";
    }

    sorted.forEach(function (t, index) {
      var isTop = index === 0 && !t.archived;
      html +=
        '<article class="topic-card' +
        (isTop ? " topic-card--hot" : "") +
        (t.archived ? " topic-card--archived" : "") +
        '">' +
        '<div class="topic-card-head">' +
        '<span class="topic-layer">L' +
        escapeHtml(t.layer) +
        " · " +
        escapeHtml(t.layerName) +
        "</span>" +
        '<span class="topic-heat">热度 ' +
        escapeHtml(t.heatScore) +
        "</span>" +
        "</div>" +
        '<h2 class="topic-card-title"><a href="topic.html?id=' +
        encodeURIComponent(t.id) +
        '">' +
        escapeHtml(t.title) +
        "</a></h2>" +
        '<p class="topic-status"><span class="status-pill">' +
        escapeHtml(t.statusLabel) +
        "</span> · 扩散优先级 " +
        escapeHtml(t.priority) +
        " · " +
        starsHtml(t.stars) +
        "</p>" +
        "<p>" +
        escapeHtml(t.logic) +
        "</p>" +
        '<p class="topic-times"><time datetime="' +
        escapeHtml(t.updatedAt) +
        '">更新 ' +
        escapeHtml(formatTime(t.updatedAt)) +
        '</time> · <time datetime="' +
        escapeHtml(t.firstSeenAt) +
        '">首次收录 ' +
        escapeHtml(formatTime(t.firstSeenAt)) +
        "</time></p>" +
        '<a class="btn-secondary" href="topic.html?id=' +
        encodeURIComponent(t.id) +
        '">查看优选标的 →</a>' +
        "</article>";
    });

    container.innerHTML = html;
  }

  function getTopic(catalog, id) {
    return (catalog.topics.topics || []).find(function (t) {
      return t.id === id;
    });
  }

  function getStocksForTopic(catalog, topic) {
    if (!topic || !topic.stockIds) return [];
    return topic.stockIds
      .map(function (sid) {
        return catalog.stockMap[sid];
      })
      .filter(Boolean)
      .sort(function (a, b) {
        return (a.rank || 99) - (b.rank || 99);
      });
  }

  function renderTopicPage(container, catalog, id) {
    var topic = getTopic(catalog, id);
    if (!topic) {
      container.innerHTML =
        '<p class="error-msg">未找到该方向，请返回 <a href="hot-topics.html">热门方向</a>。</p>';
      return;
    }
    document.title = topic.title + " · ChainMap AI";

    var picks = getStocksForTopic(catalog, topic);
    var html =
      '<header class="topic-detail-header">' +
      '<p class="article-kicker">L' +
      escapeHtml(topic.layer) +
      " " +
      escapeHtml(topic.layerName) +
      "</p>" +
      "<h1>" +
      escapeHtml(topic.title) +
      "</h1>" +
      '<p class="topic-status"><span class="status-pill">' +
      escapeHtml(topic.statusLabel) +
      "</span> · 热度 " +
      escapeHtml(topic.heatScore) +
      " · " +
      starsHtml(topic.stars) +
      "</p>" +
      "<p>" +
      escapeHtml(topic.logic) +
      "</p>" +
      "<p><strong>亮点：</strong>" +
      escapeHtml(topic.highlight) +
      "</p>" +
      '<p class="topic-times"><time datetime="' +
      escapeHtml(topic.updatedAt) +
      '">更新 ' +
      escapeHtml(formatTime(topic.updatedAt)) +
      "</time></p>" +
      "</header>";

    html += "<h2>框架内优选标的（1～3 只/方向）</h2>";
    html +=
      '<p class="section-subtitle">按壁垒、盈利与难替代性筛选，覆盖美股 / A股 / 港股（及必要时的韩股）。</p>';

    if (!picks.length) {
      html += "<p>暂无标的，待数据管道更新。</p>";
    } else {
      html += '<div class="stock-pick-grid">';
      picks.forEach(function (s) {
        html +=
          '<a class="stock-pick-card" href="stock.html?id=' +
          encodeURIComponent(s.id) +
          '">' +
          '<span class="stock-rank">#' +
          escapeHtml(s.rank) +
          "</span>" +
          marketBadge(s.market) +
          "<h3>" +
          escapeHtml(s.name) +
          " <code>" +
          escapeHtml(s.symbol) +
          "</code></h3>" +
          "<p>" +
          escapeHtml(s.oneLiner) +
          "</p>" +
          '<span class="article-card-cta">查看论证 →</span>' +
          "</a>";
      });
      html += "</div>";
    }

    container.innerHTML = html;
  }

  function renderStockPage(container, catalog, id) {
    var s = catalog.stockMap[id];
    if (!s) {
      container.innerHTML =
        '<p class="error-msg">未找到该标的，请返回 <a href="hot-topics.html">热门方向</a>。</p>';
      return;
    }
    document.title = s.name + " (" + s.symbol + ") · ChainMap AI";

    var topicLinks = (s.topicIds || [])
      .map(function (tid) {
        var t = getTopic(catalog, tid);
        if (!t) return "";
        return (
          '<a href="topic.html?id=' + encodeURIComponent(tid) + '">' + escapeHtml(t.title) + "</a>"
        );
      })
      .filter(Boolean)
      .join(" · ");

    var html =
      '<header class="stock-detail-header">' +
      '<p class="article-kicker">优选 #' +
      escapeHtml(s.rank) +
      " · " +
      marketBadge(s.market) +
      "</p>" +
      "<h1>" +
      escapeHtml(s.name) +
      ' <span class="stock-symbol">' +
      escapeHtml(s.symbol) +
      "</span></h1>" +
      "<p class="stock-oneliner"><strong>" +
      escapeHtml(s.oneLiner) +
      "</strong></p>" +
      "<p>关联方向：" +
      (topicLinks || "—") +
      "</p>" +
      '<p class="topic-times"><time datetime="' +
      escapeHtml(s.updatedAt) +
      '">论证更新 ' +
      escapeHtml(formatTime(s.updatedAt)) +
      "</time></p>" +
      "</header>";

    if (s.moatTags && s.moatTags.length) {
      html += '<h2>壁垒标签</h2><ul class="moat-tags">';
      s.moatTags.forEach(function (tag) {
        html += "<li>" + escapeHtml(tag) + "</li>";
      });
      html += "</ul>";
    }

    if (s.moatDetail) {
      html += "<p>" + escapeHtml(s.moatDetail) + "</p>";
    }

    if (s.thesis && s.thesis.length) {
      html += '<h2>选股理由</h2><ol class="thesis-list">';
      s.thesis.forEach(function (line) {
        html += "<li>" + escapeHtml(line) + "</li>";
      });
      html += "</ol>";
    }

    if (s.metrics && s.metrics.length) {
      html +=
        '<h2>关键数据</h2><div class="article-table-wrap"><table class="article-table"><thead><tr><th>指标</th><th>数值</th><th>截至</th><th>来源</th></tr></thead><tbody>';
      s.metrics.forEach(function (m) {
        html +=
          "<tr><td>" +
          escapeHtml(m.label) +
          "</td><td>" +
          escapeHtml(m.value) +
          "</td><td>" +
          escapeHtml(m.asOf) +
          "</td><td>" +
          escapeHtml(m.source) +
          "</td></tr>";
      });
      html += "</tbody></table></div>";
    }

    if (s.evidence && s.evidence.length) {
      html += '<h2>参考来源</h2><ul class="evidence-list">';
      s.evidence.forEach(function (e) {
        var link = e.url
          ? '<a href="' +
            escapeHtml(e.url) +
            '" rel="noopener noreferrer" target="_blank">' +
            escapeHtml(e.title) +
            "</a>"
          : escapeHtml(e.title);
        html +=
          '<li><span class="evidence-type">' +
          escapeHtml(e.type) +
          "</span> " +
          link +
          (e.date ? ' <span class="muted">(' + escapeHtml(e.date) + ")</span>" : "") +
          "</li>";
      });
      html += "</ul>";
    }

    if (s.risks && s.risks.length) {
      html += '<h2>风险与反面论证</h2><ul class="risk-list">';
      s.risks.forEach(function (r) {
        html += "<li>" + escapeHtml(r) + "</li>";
      });
      html += "</ul>";
    }

    html +=
      '<div class="article-footer">' +
      '<a class="btn-secondary" href="hot-topics.html">← 全部方向</a>' +
      (s.topicIds && s.topicIds[0]
        ? '<a class="btn-secondary" href="topic.html?id=' +
          encodeURIComponent(s.topicIds[0]) +
          '">← 返回该方向</a>'
        : "") +
      "</div>";

    html +=
      '<p class="invest-disclaimer-inline">本站为产业与投资思维框架，不构成证券买卖建议。请查阅最新公告并独立决策。</p>';

    container.innerHTML = html;
  }

  function showError(container, err) {
    container.innerHTML =
      '<p class="error-msg">加载失败：' +
      escapeHtml(err.message) +
      "。请通过本地 HTTP 服务打开本站（见 guide-hosting.html），不要直接用 file:// 打开。</p>";
  }

  function initPage(page) {
    var root = document.getElementById("app-root");
    if (!root) return;
    loadCatalog()
      .then(function (catalog) {
        if (page === "hot-topics") renderHotTopics(root, catalog);
        else if (page === "topic") renderTopicPage(root, catalog, qs("id"));
        else if (page === "stock") renderStockPage(root, catalog, qs("id"));
      })
      .catch(function (err) {
        showError(root, err);
      });
  }

  global.InvestApp = { initPage: initPage, loadCatalog: loadCatalog };
})(window);
