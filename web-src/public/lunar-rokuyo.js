/**
 * 旧暦変換 + 六曜計算（バイオリズム計算とは独立）
 * solar2lunar: solarlunar (1900-2100) ベース
 */
(function () {
  var lunarInfo = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    0x0d520
  ];
  var solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var ROKUYO = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"];

  function leapMonth(y) {
    return lunarInfo[y - 1900] & 0xf;
  }

  function leapDays(y) {
    return leapMonth(y) ? (lunarInfo[y - 1900] & 0x10000 ? 30 : 29) : 0;
  }

  function monthDays(y, m) {
    return lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29;
  }

  function lYearDays(y) {
    var info = lunarInfo[y - 1900];
    var sum = 348;
    for (var i = 0x8000; i > 0x8; i >>= 1) {
      sum += info & i ? 1 : 0;
    }
    return sum + leapDays(y);
  }

  function solarDays(y, m) {
    if (m === 2) {
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28;
    }
    return solarMonth[m - 1];
  }

  function solar2lunar(y, m, d) {
    if (y < 1900 || y > 2100) return null;
    if (y === 1900 && m === 1 && d < 31) return null;
    if (m < 1 || m > 12 || d < 1 || d > solarDays(y, m)) return null;

    var objDate = new Date(y, m - 1, d);
    y = objDate.getFullYear();
    m = objDate.getMonth() + 1;
    d = objDate.getDate();

    var offset =
      (Date.UTC(y, objDate.getMonth(), d) - Date.UTC(1900, 0, 31)) / 86400000;
    var i, temp = 0;

    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = lYearDays(i);
      offset -= temp;
    }
    if (offset < 0) {
      offset += temp;
      i--;
    }

    var year = i;
    var leap = leapMonth(year);
    var isLeap = false;

    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === leap + 1 && !isLeap) {
        i--;
        isLeap = true;
        temp = leapDays(year);
      } else {
        temp = monthDays(year, i);
      }
      if (isLeap && i === leap + 1) isLeap = false;
      offset -= temp;
    }

    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) isLeap = false;
      else {
        isLeap = true;
        i--;
      }
    }
    if (offset < 0) {
      offset += temp;
      i--;
    }

    return { lMonth: i, lDay: offset + 1 };
  }

  function getRokuyoFromSolar(y, m, d) {
    var lunar = solar2lunar(y, m, d);
    if (!lunar) return ROKUYO[0];
    return ROKUYO[(lunar.lDay + lunar.lMonth) % 6];
  }

  window.getRokuyoFromDate = function (date) {
    return getRokuyoFromSolar(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };

  var ROKUYO_COMMENTS = {
    大安: [
      "最高の日です。新しいことを始めるのに適しています。",
      "万事順調の兆し。挑戦するなら今日がチャンス。",
      "良い流れが来ています。心に留めたことを形にしてみましょう。",
      "穏やかで開運の日。買い物やおでかけにも向いています。",
    ],
    赤口: [
      "午前中は慎重に。午後からは運気上昇。",
      "朝はイレッキしないよう注意。昼過ぎから好転します。",
      "言葉選びに気をつけたい日。夕方以降はリラックスを。",
      "小さな摩擦に注意。午後は落ち着いて過ごせます。",
    ],
    先勝: [
      "物事は早めに取り掛かると吉。",
      "午前中を有効に使うと成果につながりやすい日。",
      "先に動いた人にチャンスが回ります。朝イチで仕掛けを。",
      "スピード感を大事に。朝のうちに決断を。",
    ],
    友引: [
      "交渉や話し合いに適した日。",
      "人とのつながりが鍵になる日。あいさつひとつ丁寧に。",
      "お付き合いごとに良い兆し。グループでの行動も吉。",
      "相手の話をよく聴くと、思わぬ良い返りがあります。",
    ],
    先負: [
      "慎重に進めれば良い結果に。",
      "急がば回れの日。段取りを整えてから動きましょう。",
      "午後から流れが良くなることも。焦らず進んで。",
      "細部まで確認すると安心。丁寧さが武器になります。",
    ],
    仏滅: [
      "静かに過ごすことをお勧めします。",
      "無理な新規は控えめに。休息と内省の日。",
      "大きな勝負は避け、日常を大切に過ごす日。",
      "シンプルな過ごし方が心を整えてくれます。",
    ],
  };

  window.getRokuyoComment = function (rokuyo, date, bio, hasProfile) {
    var d = date instanceof Date ? date : new Date(date);
    var seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();

    if (hasProfile && bio) {
      var dominant = pickDominantAspect(bio);
      var bucket = bioBucket(dominant.value);
      var list = buildBioComments(rokuyo, dominant.aspect, bucket);
      if (list && list.length) return list[seed % list.length];
    }

    var fallback = ROKUYO_COMMENTS[rokuyo];
    if (!fallback || !fallback.length) return "";
    return fallback[seed % fallback.length];
  };

  function bioBucket(value) {
    if (value >= 30) return "good";
    if (value <= -30) return "bad";
    return "neutral";
  }

  function pickDominantAspect(bio) {
    var items = [
      { aspect: "physical", value: bio.physical || 0 },
      { aspect: "emotional", value: bio.emotional || 0 },
      { aspect: "intellectual", value: bio.intellectual || 0 },
    ];
    items.sort(function (a, b) {
      var diff = Math.abs(b.value) - Math.abs(a.value);
      if (diff !== 0) return diff;
      var order = { physical: 0, emotional: 1, intellectual: 2 };
      return order[a.aspect] - order[b.aspect];
    });
    return items[0];
  }

  function buildBioComments(rokuyo, aspect, bucket) {
    var key = rokuyo + "|" + aspect + "|" + bucket;
    if (BIO_COMMENT_TWEAKS[key]) return BIO_COMMENT_TWEAKS[key];
    var opens = ROKUYO_OPEN[rokuyo];
    var tails = BIO_TAIL[aspect][bucket];
    return [opens[0] + tails[0], opens[1] + tails[1], opens[2] + tails[2]];
  }

  var ROKUYO_OPEN = {
    大安: ["大安の日。", "大吉の大安。", "良い流れの大安。"],
    赤口: ["赤口の日。", "赤口ながら", "口舌に気をつけたい赤口。"],
    先勝: ["先勝の日。", "午前勝負の先勝。", "早めが吉の先勝。"],
    友引: ["友引の日。", "人との縁の友引。", "話し合い向きの友引。"],
    先負: ["先負の日。", "慎重さが鍵の先負。", "急がば回れの先負。"],
    仏滅: ["仏滅の日。", "静かに過ごす仏滅。", "休息向きの仏滅。"],
  };

  var BIO_TAIL = {
    physical: {
      good: [
        "体力も充実し、動きやすい一日になりそう。",
        "からだが軽く、新しいことを始めやすい。",
        "エネルギッシュで、行動的に過ごせそう。",
      ],
      neutral: [
        "体力は標準的。無理のないペースで進んで。",
        "からだの調子は並。小休止を挟むと吉。",
        "体力に余裕は少なめ。平坦に過ごして。",
      ],
      bad: [
        "体力面は低調。休息を優先に。",
        "からだが重め。無理は禁物。",
        "エネルギー不足。早めに休むとよい。",
      ],
    },
    emotional: {
      good: [
        "感情面も安定し、前向きに過ごせそう。",
        "気分は上向き。人とのやりとりもスムーズ。",
        "心が穏やか。良い気持ちで動ける日。",
      ],
      neutral: [
        "感情は平坦。大きな起伏は少なそう。",
        "気分は並。穏やかに過ごすと吉。",
        "心の波は小さめ。静かに整える日。",
      ],
      bad: [
        "感情面は波あり。大きな決断は慎重に。",
        "気分が揺れやすい。一人の時間も大切に。",
        "心が疲れ気味。無理な衝突は避けて。",
      ],
    },
    intellectual: {
      good: [
        "知性も冴え、判断が冴える一日。",
        "頭がクリア。考えごとがはかどりやすい。",
        "集中力が高く、学びや企画に向く。",
      ],
      neutral: [
        "思考は標準的。油断せず確認を。",
        "頭の回転は並。丁寧さが味方に。",
        "集中は普通。一つずつ進めると吉。",
      ],
      bad: [
        "集中しにくい日。簡単な作業から始めて。",
        "頭が重め。複雑な判断は見送りを。",
        "思考が散漫になりやすい。休息を挟んで。",
      ],
    },
  };

  var BIO_COMMENT_TWEAKS = {
    "赤口|physical|good": [
      "赤口の日。体力は充実。午前だけ慎重に。",
      "赤口ながらからだは軽い。昼過ぎから本番。",
      "口舌に注意の日。体力は十分。午後に動くと吉。",
    ],
    "赤口|emotional|bad": [
      "赤口の日。感情は波あり。言葉選びに注意。",
      "赤口ながら心は揺れやすい。午前は控えめに。",
      "口舌と感情が重なりやすい。午後は落ち着いて。",
    ],
    "先勝|physical|good": [
      "先勝の日。体力も充実。午前中に仕掛けを。",
      "早めが吉の先勝。からだが軽く朝イチ向き。",
      "先勝に体力が味方。午前の行動が鍵。",
    ],
    "先勝|intellectual|good": [
      "先勝の日。頭も冴え、午前の判断が吉。",
      "早めが吉の先勝。集中力も高く午前向き。",
      "先勝に知性が味方。朝に決断を。",
    ],
    "友引|emotional|good": [
      "友引の日。気分も良く、人との縁に恵まれそう。",
      "話し合い向きの友引。心が開く一日。",
      "友引に感情が味方。あいさつが吉。",
    ],
    "友引|intellectual|good": [
      "友引の日。知性も冴え、交渉がはかどりやすい。",
      "人との縁の友引。頭も冴え話し合い向き。",
      "友引に知性が味方。相手の話を聴くと吉。",
    ],
    "先負|physical|bad": [
      "先負の日。体力も低調。段取りを整えてから。",
      "急がば回れの先負。からだが重め。焦らずに。",
      "先負に体力不足。午後に流れが良くなることも。",
    ],
    "仏滅|physical|bad": [
      "仏滅の日。体力も低調。休息を最優先に。",
      "静かに過ごす仏滅。からだが重め。無理は禁物。",
      "休息向きの仏滅。エネルギー不足。早めに休んで。",
    ],
    "仏滅|emotional|bad": [
      "仏滅の日。心も疲れ気味。静かに過ごして。",
      "静かに過ごす仏滅。感情は波あり。一人の時間を。",
      "休息向きの仏滅。気分が揺れやすい。穏やかに。",
    ],
  };
})();
