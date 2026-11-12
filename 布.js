// 码布（第三个，第 18 天）。照 ~/碰/码布/码布.py 搬的，规矩、字一样。
var N = 7, DAYS = 7;
var NOTE = { 1: '多', 2: '来', 3: '咪', 4: '发', 5: '索', 6: '拉', 7: '西' };
var COL = { 1: '青', 2: '褐', 3: '褐', 4: '青', 5: '灰', 6: '灰', 7: '灰' };
var START = [2, 6, 1, 7, 3, 5, 4];

var OPEN = '夏天，淡季，店里一整天没几个人。你是这家布店的老板，雅各。\n' +
  '靠墙那一格架子上，从上到下码着七匹布，一匹比一匹粗。老派的规矩是：码对了，手指从上往下一溜，\n' +
  '要像按过一排琴键，出一串音阶：多 来 咪 发 索 拉 西。现在的伙计没一个懂这个。\n' +
  '你那封给纺织厂的回信，最后一句已经好几天想不出来了。你觉得架子一码对，那一句就有了。\n\n' +
  '每天早上你搬得动一下：把挨着的两匹换个上下（换1 是第 1、2 匹换，换6 是第 6、7 匹换），或者不动。\n' +
  '中午太热，你上楼躺着，楼下归伙计们。晚上你下来，手指一溜。一共七天。';

function isTarget(s) { for (var i = 0; i < N; i++) if (s[i] !== i + 1) return false; return true; }
function runText(s) { return s.map(function (b) { return NOTE[b]; }).join(' '); }

function noon(s) {
  s = s.slice(); var ev = [];
  if (COL[s[3]] === '灰') { var b = s.splice(3, 1)[0]; s.unshift(b); ev.push(['泰', b]); }
  if (s[0] >= 5) { var c = s.shift(); s.push(c); ev.push(['莱', c]); }
  return { s: s, ev: ev };
}

function newGame() {
  return { s: START.slice(), day: 1, log: [], scaleNights: [], over: false };
}

// k: 0 = 不动，1..6 = 换k。返回这一下的字。
function act(g, k) {
  if (g.over) return '';
  var out = [];
  var before = g.s.slice();
  if (k) { var t = g.s[k - 1]; g.s[k - 1] = g.s[k]; g.s[k] = t; }
  var morning = g.s.slice();
  out.push(k ? '你把第 ' + k + '、' + (k + 1) + ' 匹换了个上下。' : '你没动架子。');
  out.push('中午你上楼躺下。');
  var r = noon(g.s); g.s = r.s; var ev = r.ev;
  var whos = ev.map(function (e) { return e[0]; });
  if (!ev.length) out.push('  楼下伙计们在柜台后头打牌，一下午没人碰那格架子。');
  if (whos.indexOf('泰') >= 0) out.push('  楼下好半天一点动静没有，像有人拿布把自己从头到脚裹起来睡着了。后来架子顶上咚的一声。');
  if (whos.indexOf('莱') >= 0) out.push('  楼下吱呀吱呀荡了一阵，有人在笑。后来架子底下嗵的一声。');
  g.log.push({ day: g.day, k: k, morning: morning, ev: ev });
  g.evening = { day: g.day, scale: isTarget(g.s) };
  if (g.evening.scale) g.scaleNights.push(g.day);
  g.day += 1;
  if (g.day > DAYS) g.over = true;
  return out.join('\n');
}

function endText(g) {
  var out = [];
  if (isTarget(g.s)) out.push('第七天夜里你坐在柜台后头，手指又溜了一遍。天快亮的时候，那封信的最后一句有了。');
  else if (g.scaleNights.length) out.push('那串音阶响过（第 ' + g.scaleNights.join('、') + ' 天晚上），可第七天晚上它又散了。那封信的最后一句，这个夏天没写出来。');
  else out.push('七天里架子一回也没溜出音阶。那封信的最后一句，这个夏天没写出来。');
  out.push('\n这七天中午楼下是这样的：');
  g.log.forEach(function (L) {
    out.push('  第 ' + L.day + ' 天：' + (L.k ? '你早上换了第 ' + L.k + '、' + (L.k + 1) + ' 匹。' : '你早上没动。'));
    var cur = L.morning.slice();
    if (!L.ev.length) out.push('      伙计们打牌，没碰架子。');
    L.ev.forEach(function (e) {
      var who = e[0], b = e[1], pos = cur.indexOf(b) + 1, name, what, why = '';
      if (who === '泰') {
        name = '泰奥多尔';
        what = '拿第 ' + pos + ' 格那匹' + COL[b] + '的（' + NOTE[b] + '）裹着睡了午觉，起来扔到了架顶';
        cur.splice(pos - 1, 1); cur.unshift(b);
        if (L.k && L.morning.indexOf(b) === 3 && (L.k - 1 === 3 || L.k === 3)) why = '——它在第 4 格，是你早上换过去的';
      } else {
        name = '莱昂';
        what = '把架顶那匹（' + NOTE[b] + '）拿下来打秋千，玩完塞到了最底下';
        cur.shift(); cur.push(b);
        if (L.ev.some(function (x) { return x[0] === '泰' && x[1] === b; })) why = '——它在架顶，是泰奥多尔刚扔上去的';
        else if (L.k === 1 && L.morning[0] === b) why = '——它在架顶，是你早上换上去的';
      }
      out.push('      ' + name + what + why + '。');
    });
  });
  return out.join('\n');
}

if (typeof module !== 'undefined') module.exports = { newGame: newGame, act: act, endText: endText, runText: runText, isTarget: isTarget, NOTE: NOTE, COL: COL, N: N, OPEN: OPEN };
