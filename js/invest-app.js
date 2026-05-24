(function (global) {
  var MARKET_LABEL = { US: "\u7f8e\u80a1", A: "A\u80a1", HK: "\u6e2f\u80a1", KR: "\u97e9\u80a1" };

  var INDUSTRY_ARTICLE = {
    "storage-hbm": "article-memory.html",
  };

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
    if (!iso) return "\u2014";
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
      if (!r.ok) throw new Error("\u65e0\u6cd5\u52a0\u8f7d " + path);
      return r.json();
    });
  }

  function buildCatalog(topicsPayload, stocksPayload) {
    var stockMap = {};
    (stocksPayload.stocks || []).forEach(function (s) {
      stockMap[s.id] = s;
    });
    return { topics: topicsPayload, stocks: stocksPayload, stockMap: stockMap };
  }

  function loadCatalogFromSeed() {
    var seed = global.__CHAINMAP_CATALOG__;
    if (!seed || !seed.topics || !seed.stocks) {
      throw new Error("\u672c\u5730\u6570\u636e\u672a\u5c31\u7eea");
    }
    return buildCatalog(seed.topics, seed.stocks);
  }

  function loadCatalog() {
    if (window.location.protocol === "file:") {
      return Promise.resolve(loadCatalogFromSeed());
    }
    return Promise.all([fetchJson("data/hot-topics.json"), fetchJson("data/stocks.json")])
      .then(function (arr) {
        return buildCatalog(arr[0], arr[1]);
      })
      .catch(function () {
        return loadCatalogFromSeed();
      });
  }

  var LAYER_INTRO = {
    1: "\u7b97\u529b\u6838\u5fc3\uff1a\u5927\u6a21\u578b\u8bad\u7ec3\u4e0e\u63a8\u7406\u7684\u5f15\u64ce\uff0cGPU / ASIC \u4e0e\u751f\u6001\u6784\u6210\u6700\u9ad8\u58c1\u5792\u3002",
    2: "\u5b58\u50a8\u5c42\uff1aHBM\u3001DRAM \u7b49\u4e3a\u7b97\u529b\u4f9b\u6570\u636e\u4e0e\u53c2\u6570\uff0c\u5e26\u5bbd\u4e0e\u5bb9\u91cf\u51b3\u5b9a\u96c6\u7fa4\u6548\u7387\u3002",
    3: "\u4e92\u8fde\u5c42\uff1a\u5149\u6a21\u5757\u3001\u4ea4\u6362\u673a\u3001\u5149\u7f51\u7edc\uff0c\u8d1f\u8d23 GPU \u4e4b\u95f4\u4e0e\u6570\u636e\u4e2d\u5fc3\u4e4b\u95f4\u7684\u9ad8\u901f\u4f20\u8f93\u3002",
    4: "\u57fa\u7840\u8bbe\u65bd\uff1a\u673a\u623f\u3001\u7535\u529b\u3001\u6db2\u51b7\u4e0e\u4e0a\u67b6\uff0c\u667a\u7b97\u4e2d\u5fc3\u7269\u7406\u627f\u8f7d\u4e0e\u4e0a\u67b6\u7387\u3002",
    5: "\u80fd\u6e90\u5c42\uff1aAI \u7528\u7535\u4e0a\u884c\u63a8\u52a8\u7535\u7f51\u3001\u6838\u7535\u3001\u71c3\u6c14\u7b49\u957f\u7ebf\u8d44\u4ea7\u91cd\u4f30\u3002",
    6: "\u5e94\u7528\u5c42\uff1a\u57fa\u7840\u8bbe\u65bd\u6210\u719f\u540e\uff0c\u5229\u6da6\u6c60\u5411\u4f01\u4e1a\u8f6f\u4ef6\u3001Agent \u4e0e\u5782\u76f4\u573a\u666f\u8fc1\u79fb\u3002",
  };

  function groupTopicsByLayer(list) {
    var map = {};
    list.forEach(function (t) {
      var key = t.layer || 0;
      if (!map[key]) {
        map[key] = { layer: key, layerName: t.layerName, topics: [] };
      }
      map[key].topics.push(t);
    });
    return Object.keys(map)
      .sort(function (a, b) {
        return Number(a) - Number(b);
      })
      .map(function (k) {
        return map[k];
      });
  }

  function chainOverviewHtml() {
    return (
      '<section class="chain-overview" aria-labelledby="chain-overview-title">' +
      '<h2 class="chain-overview-title" id="chain-overview-title">AI \u4ea7\u4e1a\u94fe\u603b\u89c8\u56fe</h2>' +
      '<p class="chain-overview-lead">\u4ece\u4e91\u5382\u5546\u4e0b\u5355\u5230\u6570\u636e\u4e2d\u5fc3\u4e0a\u67b6\uff0c\u518d\u5230\u673a\u67b6\u5185 GPU \u96c6\u7fa4\u4e92\u8fde\u2014\u2014\u5148\u770b\u6e05\u695a\u7269\u7406\u4e0e\u7f51\u7edc\u7ed3\u6784\uff0c\u518d\u770b\u516d\u5c42\u73af\u8282\u3002</p>' +
      '<div class="chain-overview-diagram" role="img" aria-label="\u4e91\u5382\u5546\u3001\u6570\u636e\u4e2d\u5fc3\u3001AI \u670d\u52a1\u5668\u4e0e\u5149\u7f51\u7edc\u6784\u6210\u7684 AI \u8bad\u7ec3\u96c6\u7fa4\u603b\u89c8">' +
      '<svg class="chain-overview-svg" viewBox="0 0 920 520" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="co-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#eff6ff"/><stop offset="100%" stop-color="#f8fafc"/></linearGradient>' +
      '<linearGradient id="co-dc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0fdf4"/><stop offset="100%" stop-color="#f8fafc"/></linearGradient>' +
      '<marker id="co-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/></marker>' +
      '</defs>' +
      '<rect x="20" y="16" width="880" height="88" rx="12" fill="url(#co-bg)" stroke="#bfdbfe" stroke-width="1.5"/>' +
      '<text x="460" y="38" text-anchor="middle" class="co-label co-label--head">\u4e91\u5382\u5546 / AI \u79df\u6237</text>' +
      '<g class="co-chips">' +
      '<rect x="48" y="52" width="72" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="84" y="70" text-anchor="middle" class="co-chip">AWS</text>' +
      '<rect x="132" y="52" width="72" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="168" y="70" text-anchor="middle" class="co-chip">Azure</text>' +
      '<rect x="216" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="244" y="70" text-anchor="middle" class="co-chip">GCP</text>' +
      '<rect x="284" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="312" y="70" text-anchor="middle" class="co-chip">Meta</text>' +
      '<rect x="352" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="380" y="70" text-anchor="middle" class="co-chip">MSFT</text>' +
      '<rect x="420" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="448" y="70" text-anchor="middle" class="co-chip">\u5b57\u8282</text>' +
      '<rect x="488" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="516" y="70" text-anchor="middle" class="co-chip">\u817e\u8baf</text>' +
      '<rect x="556" y="52" width="56" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="584" y="70" text-anchor="middle" class="co-chip">\u963f\u91cc</text>' +
      '<rect x="624" y="52" width="72" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="660" y="70" text-anchor="middle" class="co-chip">OpenAI</text>' +
      '<rect x="708" y="52" width="88" height="28" rx="6" fill="#fff" stroke="#93c5fd"/><text x="752" y="70" text-anchor="middle" class="co-chip">\u81ea\u7814\u5927\u6a21\u578b</text>' +
      '</g>' +
      '<line x1="460" y1="104" x2="460" y2="128" stroke="#64748b" stroke-width="1.5" marker-end="url(#co-arrow)"/>' +
      '<text x="460" y="122" text-anchor="middle" class="co-caption">capex \u00b7 \u79df\u7b97\u529b \u00b7 \u81ea\u5efa\u667a\u7b97\u4e2d\u5fc3</text>' +
      '<rect x="20" y="136" width="880" height="200" rx="12" fill="url(#co-dc)" stroke="#bbf7d0" stroke-width="1.5"/>' +
      '<text x="460" y="158" text-anchor="middle" class="co-label co-label--head">\u6570\u636e\u4e2d\u5fc3 / \u667a\u7b97\u4e2d\u5fc3</text>' +
      '<rect x="48" y="172" width="340" height="72" rx="8" fill="#fff" stroke="#86efac" stroke-width="1.5"/>' +
      '<text x="218" y="196" text-anchor="middle" class="co-label">Region A \u00b7 \u667a\u7b97\u673a\u623f</text>' +
      '<text x="218" y="218" text-anchor="middle" class="co-caption">\u7535\u529b \u00b7 UPS \u00b7 \u6db2\u51b7 \u00b7 \u4e0a\u67b6\u7387</text>' +
      '<rect x="532" y="172" width="340" height="72" rx="8" fill="#fff" stroke="#86efac" stroke-width="1.5"/>' +
      '<text x="702" y="196" text-anchor="middle" class="co-label">Region B \u00b7 \u667a\u7b97\u673a\u623f</text>' +
      '<text x="702" y="218" text-anchor="middle" class="co-caption">\u7535\u529b \u00b7 UPS \u00b7 \u6db2\u51b7 \u00b7 \u4e0a\u67b6\u7387</text>' +
      '<line x1="388" y1="208" x2="532" y2="208" stroke="#0891b2" stroke-width="2.5" stroke-dasharray="6 4"/>' +
      '<text x="460" y="200" text-anchor="middle" class="co-caption co-caption--net">DCI \u5149\u7f51\u7edc</text>' +
      '<text x="460" y="248" text-anchor="middle" class="co-caption">\u957f\u8ddd\u5149\u4f20\u8f93 \u00b7 \u6570\u636e\u4e2d\u5fc3\u4e92\u8054 \u00b7 Spine-Leaf \u9aa8\u5e72</text>' +
      '<line x1="218" y1="244" x2="218" y2="268" stroke="#64748b" stroke-width="1.5" marker-end="url(#co-arrow)"/>' +
      '<line x1="702" y1="244" x2="702" y2="268" stroke="#64748b" stroke-width="1.5" marker-end="url(#co-arrow)"/>' +
      '<rect x="48" y="268" width="824" height="52" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' +
      '<text x="460" y="290" text-anchor="middle" class="co-label">\u673a\u67b6\u6392 \u00b7 AI \u670d\u52a1\u5668\u673a\u67b6\uff08\u5355\u673a 8\u201372 GPU \u7ea7\uff09</text>' +
      '<text x="460" y="308" text-anchor="middle" class="co-caption">\u673a\u67b6\u5185\u4ea4\u6362 \u00b7 NVLink / RoCE \u00b7 \u9ad8\u901f\u5149\u6a21\u5757</text>' +
      '<line x1="460" y1="336" x2="460" y2="358" stroke="#64748b" stroke-width="1.5" marker-end="url(#co-arrow)"/>' +
      '<rect x="20" y="358" width="880" height="140" rx="12" fill="#faf5ff" stroke="#ddd6fe" stroke-width="1.5"/>' +
      '<text x="460" y="380" text-anchor="middle" class="co-label co-label--head">\u5355\u53f0 AI \u670d\u52a1\u5668 \u00b7 \u96c6\u7fa4\u5185\u4e92\u8054</text>' +
      '<rect x="48" y="394" width="180" height="88" rx="8" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>' +
      '<text x="138" y="416" text-anchor="middle" class="co-label">GPU \u00d78</text>' +
      '<text x="138" y="436" text-anchor="middle" class="co-caption">HBM \u00b7 \u7b97\u529b\u6838\u5fc3</text>' +
      '<text x="138" y="454" text-anchor="middle" class="co-caption">L1 \u7b97\u529b + L2 \u5b58\u50a8</text>' +
      '<rect x="252" y="394" width="180" height="88" rx="8" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>' +
      '<text x="342" y="416" text-anchor="middle" class="co-label">GPU \u00d78</text>' +
      '<text x="342" y="436" text-anchor="middle" class="co-caption">HBM \u00b7 \u7b97\u529b\u6838\u5fc3</text>' +
      '<text x="342" y="454" text-anchor="middle" class="co-caption">L1 \u7b97\u529b + L2 \u5b58\u50a8</text>' +
      '<rect x="456" y="404" width="88" height="68" rx="8" fill="#ecfeff" stroke="#67e8f9" stroke-width="1.5"/>' +
      '<text x="500" y="430" text-anchor="middle" class="co-label">\u4ea4\u6362\u673a</text>' +
      '<text x="500" y="450" text-anchor="middle" class="co-caption">AI Fabric</text>' +
      '<text x="500" y="464" text-anchor="middle" class="co-caption">L3 \u4e92\u8fde</text>' +
      '<rect x="568" y="394" width="180" height="88" rx="8" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>' +
      '<text x="658" y="416" text-anchor="middle" class="co-label">GPU \u00d78</text>' +
      '<text x="658" y="436" text-anchor="middle" class="co-caption">HBM \u00b7 \u7b97\u529b\u6838\u5fc3</text>' +
      '<text x="658" y="454" text-anchor="middle" class="co-caption">L1 \u7b97\u529b + L2 \u5b58\u50a8</text>' +
      '<rect x="772" y="394" width="108" height="88" rx="8" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>' +
      '<text x="826" y="416" text-anchor="middle" class="co-label">\u5149\u6a21\u5757</text>' +
      '<text x="826" y="436" text-anchor="middle" class="co-caption">800G / 1.6T</text>' +
      '<text x="826" y="454" text-anchor="middle" class="co-caption">L3 \u4e92\u8fde</text>' +
      '<line x1="228" y1="438" x2="252" y2="438" stroke="#7c3aed" stroke-width="2"/>' +
      '<line x1="432" y1="438" x2="456" y2="438" stroke="#7c3aed" stroke-width="2"/>' +
      '<line x1="544" y1="438" x2="568" y2="438" stroke="#7c3aed" stroke-width="2"/>' +
      '<line x1="748" y1="438" x2="772" y2="438" stroke="#7c3aed" stroke-width="2"/>' +
      '</svg>' +
      '</div>' +
      '<ul class="chain-overview-legend">' +
      '<li><span class="chain-overview-dot chain-overview-dot--l1"></span>L1 \u7b97\u529b \u00b7 GPU / ASIC</li>' +
      '<li><span class="chain-overview-dot chain-overview-dot--l2"></span>L2 \u5b58\u50a8 \u00b7 HBM / DRAM</li>' +
      '<li><span class="chain-overview-dot chain-overview-dot--l3"></span>L3 \u4e92\u8fde \u00b7 \u5149\u6a21\u5757 / \u4ea4\u6362 / DCI</li>' +
      '<li><span class="chain-overview-dot chain-overview-dot--l4"></span>L4 \u57fa\u7840\u8bbe\u65bd \u00b7 \u673a\u623f / \u7535\u529b / \u6db2\u51b7</li>' +
      '</ul>' +
      '</section>'
    );
  }

  function chainFrameworkHtml() {
    return (
      '<aside class="chain-framework-box">' +
      "<h2 class=\"chain-framework-title\">AI \u4ea7\u4e1a\u94fe \u00b7 \u516d\u5c42\u8d44\u672c\u6269\u6563</h2>" +
      "<p>\u8d44\u91d1\u4e0e\u884c\u4e1a\u53d9\u4e8b\u5e38\u4ece <strong>L1 \u7b97\u529b</strong> \u5411 <strong>L2 \u5b58\u50a8</strong>\u3001<strong>L3 \u4e92\u8fde</strong> \u2026 \u9010\u6b65\u6269\u6563\u81f3 <strong>L6 \u5e94\u7528</strong>\u3002\u4e0b\u65b9\u6309\u5c42\u7ea7\u6574\u7406\u5404\u73af\u8282\u505a\u4ec0\u4e48\u3001\u5178\u578b\u7ec6\u5206\u6709\u54ea\u4e9b\u3002</p>" +
      "</aside>"
    );
  }

  function sortIndustryTopics(list) {
    return list
      .filter(function (t) {
        return !t.archived;
      })
      .sort(function (a, b) {
        var la = a.layer || 99;
        var lb = b.layer || 99;
        if (la !== lb) return la - lb;
        return (a.priority || 99) - (b.priority || 99);
      });
  }

  function industryHref(topic) {
    if (INDUSTRY_ARTICLE[topic.id]) return INDUSTRY_ARTICLE[topic.id];
    return "topic.html?id=" + encodeURIComponent(topic.id);
  }

  function industryTopicRowHtml(t) {
    var href = industryHref(t);
    var desc = t.logic || "";
    var sub = t.highlight || "";
    return (
      '<a class="industry-card" href="' +
      href +
      '">' +
      '<div class="industry-card-top">' +
      layerChip(t) +
      '<span class="industry-card-arrow" aria-hidden="true">\u2192</span>' +
      "</div>" +
      '<h3 class="industry-card-title">' +
      escapeHtml(t.title) +
      "</h3>" +
      '<p class="industry-card-desc">' +
      escapeHtml(desc) +
      "</p>" +
      (sub ? '<p class="industry-card-note">' + escapeHtml(sub) + "</p>" : "") +
      "</a>"
    );
  }

  function renderIndustryChain(container, catalog) {
    var sorted = sortIndustryTopics(catalog.topics.topics || []);
    var groups = groupTopicsByLayer(sorted);
    var html = chainOverviewHtml() + chainFrameworkHtml() + layerLegendHtml();
    html +=
      '<p class="feed-meta feed-meta--bar">\u5171 ' +
      sorted.length +
      " \u4e2a\u73af\u8282 \u00b7 \u6309 L1\u2192L6 \u4ea7\u4e1a\u94fe\u6392\u5e8f</p>";
    groups.forEach(function (g) {
      html += '<section class="industry-layer-block industry-layer-block--' + escapeHtml(g.layer) + '" id="layer-' + escapeHtml(g.layer) + '">';
      html +=
        '<header class="industry-layer-head">' +
        '<span class="layer-chip layer-chip--' +
        escapeHtml(g.layer) +
        '">L' +
        escapeHtml(g.layer) +
        " \u00b7 " +
        escapeHtml(g.layerName || "") +
        "</span>";
      if (LAYER_INTRO[g.layer]) {
        html += '<p class="industry-layer-desc">' + escapeHtml(LAYER_INTRO[g.layer]) + "</p>";
      }
      html += '</header><div class="industry-grid">';
      g.topics.forEach(function (t) {
        html += industryTopicRowHtml(t);
      });
      html += "</div></section>";
    });
    container.innerHTML = html;
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
    var out = '<span class="stars" aria-label="' + filled + ' \u661f">';
    for (var i = 0; i < max; i++) {
      out += '<span class="star' + (i < filled ? " is-on" : "") + '">\u2605</span>';
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

  function heatBar(score) {
    var w = Math.min(100, Math.max(0, score || 0));
    return (
      '<div class="heat-meter" role="presentation"><span class="heat-meter-fill" style="width:' +
      w +
      '%"></span></div>'
    );
  }

  function layerChip(t) {
    return (
      '<span class="layer-chip layer-chip--' +
      escapeHtml(t.layer) +
      '">L' +
      escapeHtml(t.layer) +
      " \u00b7 " +
      escapeHtml(t.layerName) +
      "</span>"
    );
  }

  function stockChipsHtml(catalog, topic) {
    var stocks = getStocksForTopic(catalog, topic).slice(0, 3);
    if (!stocks.length) return "";
    var html = '<div class="topic-stock-chips">';
    stocks.forEach(function (s) {
      html +=
        '<a class="stock-chip" href="stock.html?id=' +
        encodeURIComponent(s.id) +
        '">' +
        escapeHtml(s.symbol) +
        "</a>";
    });
    return html + "</div>";
  }

  function topicRowHtml(t, index, catalog, compact) {
    var isTop = index === 0 && !t.archived;
    var rank = String(index + 1).padStart(2, "0");
    var desc = compact ? t.highlight || t.logic : t.logic;
    if (compact && desc && desc.length > 140) {
      desc = desc.slice(0, 138) + "\u2026";
    }
    return (
      '<article class="topic-row' +
      (isTop ? " topic-row--hot" : "") +
      (t.archived ? " topic-row--archived" : "") +
      '">' +
      '<div class="topic-row-rank">' +
      rank +
      "</div>" +
      '<div class="topic-row-body">' +
      '<div class="topic-row-meta">' +
      layerChip(t) +
      '<span class="status-pill">' +
      escapeHtml(t.statusLabel) +
      "</span>" +
      (isTop ? '<span class="topic-flag-hot">\u5f53\u524d\u6700\u70ed</span>' : "") +
      "</div>" +
      '<h3 class="topic-row-title"><a href="topic.html?id=' +
      encodeURIComponent(t.id) +
      '">' +
      escapeHtml(t.title) +
      "</a></h3>" +
      '<p class="topic-row-desc">' +
      escapeHtml(desc) +
      "</p>" +
      stockChipsHtml(catalog, t) +
      '<p class="topic-times"><time datetime="' +
      escapeHtml(t.updatedAt) +
      '">\u66f4\u65b0 ' +
      escapeHtml(formatTime(t.updatedAt)) +
      "</time>" +
      (!compact
        ? ' \u00b7 <time datetime="' +
          escapeHtml(t.firstSeenAt) +
          '">\u6536\u5f55 ' +
          escapeHtml(formatTime(t.firstSeenAt)) +
          "</time>"
        : "") +
      "</p>" +
      "</div>" +
      '<div class="topic-row-stats">' +
      '<div class="heat-score"><span class="heat-score-num">' +
      escapeHtml(t.heatScore) +
      '</span><span class="heat-score-label">\u70ed\u5ea6</span></div>' +
      heatBar(t.heatScore) +
      starsHtml(t.stars) +
      '<a class="topic-row-link" href="topic.html?id=' +
      encodeURIComponent(t.id) +
      '">\u4f18\u9009\u6807\u7684 \u2192</a>' +
      "</div>" +
      "</article>"
    );
  }

  function layerLegendHtml() {
    return (
      '<div class="layer-legend">' +
      '<span class="layer-chip layer-chip--1">L1 \u7b97\u529b</span>' +
      '<span class="layer-chip layer-chip--2">L2 \u5b58\u50a8</span>' +
      '<span class="layer-chip layer-chip--3">L3 \u4e92\u8fde</span>' +
      '<span class="layer-chip layer-chip--4">L4 \u57fa\u7840\u8bbe\u65bd</span>' +
      '<span class="layer-chip layer-chip--5">L5 \u80fd\u6e90</span>' +
      '<span class="layer-chip layer-chip--6">L6 \u5e94\u7528</span>' +
      "</div>"
    );
  }

  function renderHomeTopics(container, catalog) {
    var sorted = sortTopics(catalog.topics.topics || []);
    var meta = catalog.topics.meta || {};
    var preview = sorted.slice(0, 5);
    var html = "";
    if (meta.updatedAt) {
      html +=
        '<p class="feed-meta feed-meta--bar">\u6570\u636e\u66f4\u65b0 ' +
        escapeHtml(formatTime(meta.updatedAt)) +
        " \u00b7 \u5171 " +
        sorted.length +
        " \u4e2a\u65b9\u5411</p>";
    }
    html += '<div class="topic-radar-list">';
    preview.forEach(function (t, i) {
      html += topicRowHtml(t, i, catalog, true);
    });
    html += "</div>";
    container.innerHTML = html;
  }

  function renderHotTopics(container, catalog) {
    var sorted = sortTopics(catalog.topics.topics || []);
    var meta = catalog.topics.meta || {};
    var html = layerLegendHtml();
    if (meta.updatedAt) {
      html +=
        '<p class="feed-meta feed-meta--bar">\u6570\u636e\u66f4\u65b0 ' +
        escapeHtml(formatTime(meta.updatedAt)) +
        " \u00b7 \u6392\u5e8f\uff1a\u66f4\u65b0\u65f6\u95f4 \u2193\uff0c\u70ed\u5ea6 \u2193</p>";
    }
    html += '<div class="topic-radar-list">';
    sorted.forEach(function (t, index) {
      html += topicRowHtml(t, index, catalog, false);
    });
    html += "</div>";
    container.innerHTML = html;
  }

  function renderTopicPage(container, catalog, id) {
    var topic = getTopic(catalog, id);
    if (!topic) {
      container.innerHTML =
        '<p class="error-msg">\u672a\u627e\u5230\u8be5\u73af\u8282\uff0c\u8bf7\u8fd4\u56de <a href="hot-topics.html">\u4ea7\u4e1a\u94fe\u79d1\u666e</a>\u3002</p>';
      return;
    }
    document.title = topic.title + " \u00b7 AI \u4ea7\u4e1a\u94fe\u79d1\u666e \u00b7 ChainMap AI";

    var articleLink = INDUSTRY_ARTICLE[topic.id];
    var html =
      '<nav class="breadcrumb"><a href="hot-topics.html">\u4ea7\u4e1a\u94fe\u79d1\u666e</a><span>/</span><span>' +
      escapeHtml(topic.title) +
      "</span></nav>" +
      '<header class="research-hero">' +
      layerChip(topic) +
      '<h1 class="research-h1">' +
      escapeHtml(topic.title) +
      "</h1>" +
      '<p class="research-lead">' +
      escapeHtml(topic.logic) +
      "</p>" +
      '<aside class="highlight-box"><strong>\u5173\u952e\u7406\u89e3</strong><p>' +
      escapeHtml(topic.highlight) +
      "</p></aside>" +
      "</header>" +
      '<section class="research-section"><h2 class="research-h2">\u8fd9\u4e00\u73af\u8282\u505a\u4ec0\u4e48</h2>' +
      '<p class="research-section-desc">\u4ece\u9700\u6c42\u6765\u6e90\u3001\u4ea7\u4e1a\u5206\u5de5\u5230\u5178\u578b\u7ec6\u5206\u54c1\u7c7b\uff08\u5982\u5b58\u50a8\u4e2d\u7684 HBM\u3001DRAM\uff09\uff0c\u628a\u6bcf\u4e00\u7c7b\u5728 AI \u94fe\u8def\u91cc\u53d1\u6325\u7684\u4f5c\u7528\u8bb2\u6e05\u695a\u3002</p>';

    if (articleLink) {
      html +=
        '<p class="research-note"><a href="' +
        articleLink +
        '">\u2192 \u9605\u8bfb\u5b8c\u6574\u79d1\u666e\uff1a' +
        escapeHtml(topic.title) +
        "</a></p>";
    } else {
      html += "<p>\u6df1\u5ea6\u6587\u7ae0\u6301\u7eed\u66f4\u65b0\u4e2d\u3002</p>";
    }

    html += "</section>";
    html += '<p class="footer-note footer-note--inline">\u5185\u5bb9\u4e3a\u4ea7\u4e1a\u79d1\u666e\uff0c\u4e0d\u6784\u6210\u6295\u8d44\u5efa\u8bae\u3002</p>';

    container.innerHTML = html;
  }

  function renderStockPage(container, catalog, id) {
    var s = catalog.stockMap[id];
    if (!s) {
      container.innerHTML =
        '<p class="error-msg">\u672a\u627e\u5230\u8be5\u516c\u53f8\uff0c\u8bf7\u8fd4\u56de <a href="companies.html">\u70ed\u95e8\u516c\u53f8\u5206\u6790</a>\u3002</p>';
      return;
    }
    document.title = s.name + " (" + s.symbol + ") \u00b7 \u70ed\u95e8\u516c\u53f8\u5206\u6790 \u00b7 ChainMap AI";
    var topicLinks = (s.topicIds || [])
      .map(function (tid) {
        var t = getTopic(catalog, tid);
        if (!t) return "";
        return (
          '<a href="topic.html?id=' + encodeURIComponent(tid) + '">' + escapeHtml(t.title) + "</a>"
        );
      })
      .filter(Boolean)
      .join(" \u00b7 ");

    var html =
      '<header class="research-hero stock-detail-header">' +
      '<p class="article-kicker">' +
      marketBadge(s.market) +
      " \u00b7 " +
      escapeHtml(s.symbol) +
      "</p>" +
      '<h1 class="research-h1">' +
      escapeHtml(s.name) +
      ' <span class="stock-symbol">' +
      escapeHtml(s.symbol) +
      "</span></h1>" +
      '<p class="stock-oneliner">' +
      escapeHtml(s.oneLiner) +
      "</p>" +
      "<p>\u5173\u8054\u4ea7\u4e1a\uff1a" +
      (topicLinks || "\u2014") +
      "</p>" +
      '<p class="topic-times"><time datetime="' +
      escapeHtml(s.updatedAt) +
      '">\u66f4\u65b0 ' +
      escapeHtml(formatTime(s.updatedAt)) +
      "</time></p>" +
      "</header>";
    if (s.moatTags && s.moatTags.length) {
      html += '<h2 class="research-h2">\u58c1\u5792\u6807\u7b7e</h2><ul class="moat-tags">';
      s.moatTags.forEach(function (tag) {
        html += "<li>" + escapeHtml(tag) + "</li>";
      });
      html += "</ul>";
    }

    if (s.moatDetail) {
      html += "<p>" + escapeHtml(s.moatDetail) + "</p>";
    }

    if (s.thesis && s.thesis.length) {
      html += '<h2 class="research-h2">\u7814\u7a76\u7ed3\u8bba</h2><ol class="thesis-list">';
      s.thesis.forEach(function (line) {
        html += "<li>" + escapeHtml(line) + "</li>";
      });
      html += "</ol>";
    }

    if (s.metrics && s.metrics.length) {
      html +=
        '<h2 class="research-h2">\u5173\u952e\u6570\u636e</h2><div class="article-table-wrap"><table class="article-table"><thead><tr><th>\u6307\u6807</th><th>\u6570\u503c</th><th>\u622a\u81f3</th><th>\u6765\u6e90</th></tr></thead><tbody>';
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
      html += '<h2 class="research-h2">\u53c2\u8003\u6765\u6e90</h2><ul class="evidence-list">';
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
      html += '<h2 class="research-h2">\u98ce\u9669\u4e0e\u53cd\u9762\u8bba\u8bc1</h2><ul class="risk-list">';
      s.risks.forEach(function (r) {
        html += "<li>" + escapeHtml(r) + "</li>";
      });
      html += "</ul>";
    }

    html +=
      '<div class="article-footer">' +
      '<a class="btn-secondary" href="companies.html">\u2190 \u70ed\u95e8\u516c\u53f8\u5206\u6790</a>' +
      (s.topicIds && s.topicIds[0]
        ? '<a class="btn-secondary" href="topic.html?id=' +
          encodeURIComponent(s.topicIds[0]) +
          '">\u2190 \u4ea7\u4e1a\u94fe\u79d1\u666e</a>'
        : "") +
      "</div>";

    html +=
      '<p class="invest-disclaimer-inline">\u672c\u7ad9\u4e3a\u4ea7\u4e1a\u4e0e\u6295\u8d44\u601d\u7ef4\u6846\u67b6\uff0c\u4e0d\u6784\u6210\u8bc1\u5238\u4e70\u5356\u5efa\u8bae\u3002\u8bf7\u67e5\u9605\u6700\u65b0\u516c\u544a\u5e76\u72ec\u7acb\u51b3\u7b56\u3002</p>';

    container.innerHTML = html;
  }

  function showError(container, err) {
    var msg = escapeHtml(err.message || String(err));
    container.innerHTML =
      '<p class="error-msg">\u52a0\u8f7d\u5931\u8d25\uff1a' +
      msg +
      "\u3002\u8bf7\u786e\u8ba4\u5df2\u5f15\u5165 <code>js/catalog-seed.js</code>\uff0c\u6216\u901a\u8fc7 <code>python -m http.server 8080</code> \u542f\u52a8\u672c\u5730\u670d\u52a1\u540e\u8bbf\u95ee\u3002</p>";
  }

  function initPage(page) {
    var root = document.getElementById("app-root");
    var homeRoot = document.getElementById("home-topics-root");
    var target = root || homeRoot;
    if (!target) return;

    loadCatalog()
      .then(function (catalog) {
        if (page === "home" && homeRoot) renderHomeTopics(homeRoot, catalog);
        else if ((page === "industry-chain" || page === "hot-topics") && root) renderIndustryChain(root, catalog);
        else if (page === "topic" && root) renderTopicPage(root, catalog, qs("id"));
        else if (page === "stock" && root) renderStockPage(root, catalog, qs("id"));
      })
      .catch(function (err) {
        showError(target, err);
      });
  }

  global.InvestApp = { initPage: initPage, loadCatalog: loadCatalog };
})(window);
