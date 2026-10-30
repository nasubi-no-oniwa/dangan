// =============================================
//  ことば（日本語・English・繁體中文・한국어）
//  ===========================================

(function () {
  var LANGS = ['ja', 'en', 'zh', 'ko'];
  var KEY = 'dangan-lang';
  var D = {
 "lang_label": [
  "ことば",
  "Language",
  "語言",
  "언어"
 ],
 "home": [
  "なすびのお庭へ",
  "Nasubi's Garden (more games)",
  "前往茄子的庭院",
  "가지의 정원으로"
 ],
 "howto": [
  "あそびかた",
  "How to play",
  "玩法",
  "플레이 방법"
 ],
 "close": [
  "とじる",
  "Close",
  "關閉",
  "닫기"
 ],
 "back": [
  "もどる",
  "Back",
  "返回",
  "돌아가기"
 ],
 "to_title": [
  "タイトルへ",
  "Back to title",
  "回到標題",
  "타이틀로"
 ],
 "again": [
  "もう一回",
  "Play again",
  "再來一局",
  "한 판 더"
 ],
 "easy": [
  "よわい",
  "Easy",
  "簡單",
  "약함"
 ],
 "normal": [
  "ふつう",
  "Normal",
  "普通",
  "보통"
 ],
 "hard": [
  "つよい",
  "Hard",
  "困難",
  "강함"
 ],
 "vs_cpu": [
  "CPUとたいせん",
  "VS CPU",
  "對戰CPU",
  "CPU와 대전"
 ],
 "online": [
  "あいことばで対戦",
  "Play with a passcode",
  "用暗號對戰",
  "암호로 대전"
 ],
 "passcode": [
  "あいことば",
  "Passcode",
  "暗號",
  "암호"
 ],
 "name": [
  "なまえ",
  "Name",
  "名字",
  "이름"
 ],
 "noname": [
  "ななし",
  "Anonymous",
  "無名氏",
  "익명"
 ],
 "online_hint": [
  "同じあいことばを入れた人と対戦。3人目からは観戦になります。",
  "Play against whoever enters the same passcode. From the 3rd person on, you watch.",
  "和輸入相同暗號的人對戰。第3個人開始為觀戰。",
  "같은 암호를 입력한 사람과 대전. 3번째 사람부터는 관전이 됩니다."
 ],
 "join": [
  "はいる",
  "Join",
  "進入",
  "입장"
 ],
 "wait_pre": [
  "あいことば「",
  "Passcode: ",
  "暗號「",
  "암호 「"
 ],
 "wait_post": [
  "」",
  "",
  "」",
  "」"
 ],
 "waiting": [
  "あいてを待っています…",
  "Waiting for an opponent…",
  "等待對手中…",
  "상대를 기다리는 중…"
 ],
 "copy_link": [
  "さそうリンクをコピー",
  "Copy invite link",
  "複製邀請連結",
  "초대 링크 복사"
 ],
 "copied": [
  "コピーしました！",
  "Copied!",
  "已複製！",
  "복사했어요!"
 ],
 "send_link": [
  "このリンクを送ってください",
  "Send this link",
  "請傳送這個連結",
  "이 링크를 보내 주세요"
 ],
 "err_code": [
  "あいことばを入れてください（. # $ / [ ] は使えません）",
  "Enter a passcode (. # $ / [ ] are not allowed)",
  "請輸入暗號（不能使用 . # $ / [ ]）",
  "암호를 입력해 주세요 (. # $ / [ ] 는 사용할 수 없어요)"
 ],
 "err_code_short": [
  "あいことばを入れてください",
  "Enter a passcode",
  "請輸入暗號",
  "암호를 입력해 주세요"
 ],
 "connecting": [
  "つないでいます…",
  "Connecting…",
  "連線中…",
  "연결 중…"
 ],
 "err_net": [
  "通信できませんでした。電波のよいところでもう一度ためしてください",
  "Couldn't connect. Please try again where the signal is better.",
  "無法連線。請在訊號好的地方再試一次。",
  "연결하지 못했어요. 신호가 좋은 곳에서 다시 시도해 주세요."
 ],
 "err_notready": [
  "オンライン対戦はまだ準備中です",
  "Online play isn't ready yet",
  "線上對戰還在準備中",
  "온라인 대전은 아직 준비 중이에요"
 ],
 "err_conn": [
  "つながりませんでした",
  "Couldn't connect",
  "無法連線",
  "연결되지 않았어요"
 ],
 "left_win": [
  "相手が抜けたので、あなたの勝ち！",
  "Your opponent left, so you win!",
  "對手離開了，你贏了！",
  "상대가 나가서 당신의 승리!"
 ],
 "left": [
  "あいてが退室しました",
  "Your opponent left",
  "對手已離開",
  "상대가 퇴장했어요"
 ],
 "watch_in": [
  "観戦で入りました。試合が始まるのを待っています…",
  "You joined as a spectator. Waiting for the game to start…",
  "已用觀戰身分進入。等待比賽開始…",
  "관전으로 입장했어요. 경기 시작을 기다리는 중…"
 ],
 "wait_next": [
  "次の試合が始まるのを待っています…",
  "Waiting for the next game…",
  "等待下一局開始…",
  "다음 경기를 기다리는 중…"
 ],
 "wait_rematch": [
  "あいての「もう一回」を待っています…",
  "Waiting for your opponent to choose \"Play again\"…",
  "等待對手按「再來一局」…",
  "상대의 '한 판 더'를 기다리는 중…"
 ],
 "you": [
  "あなた",
  "You",
  "你",
  "나"
 ],
 "cpu": [
  "CPU",
  "CPU",
  "CPU",
  "CPU"
 ],
 "your_turn": [
  "あなたの番",
  "Your turn",
  "輪到你",
  "내 차례"
 ],
 "cpu_wait_label": [
  "CPU（ふつう）と遊びながら待つ",
  "Play the CPU (Normal) while waiting",
  "一邊和CPU（普通）玩一邊等",
  "기다리는 동안 CPU(보통)와 플레이"
 ],
 "qm_btn": [
  "だれかと対戦",
  "Play someone online",
  "隨機對戰",
  "아무나와 대전"
 ],
 "qm_stat": [
  "対戦待ち <b>{w}</b>人・対戦中 <b>{p}</b>組",
  "<b>{w}</b> waiting · <b>{p}</b> playing",
  "等待中 <b>{w}</b>人・對戰中 <b>{p}</b>組",
  "대기 <b>{w}</b>명 · 대전 중 <b>{p}</b>쌍"
 ],
 "qm_prime_hot": [
  "🔥 いま対戦タイム！（22時まで）",
  "🔥 Battle time now! (until 22:00 JST)",
  "🔥 現在是對戰時間！（到日本時間22點）",
  "🔥 지금은 대전 타임! (일본 시간 22시까지)"
 ],
 "qm_prime": [
  "🌙 毎晩21時〜22時は対戦タイム",
  "🌙 Battle time every night 21:00–22:00 JST",
  "🌙 每晚日本時間21〜22點是對戰時間",
  "🌙 매일 밤 일본 시간 21~22시는 대전 타임"
 ],
 "qm_sub": [
  "いま待っている人と、自動でつながります。",
  "You'll be matched automatically with someone who's waiting.",
  "自動和正在等待的人配對。",
  "기다리고 있는 사람과 자동으로 연결돼요."
 ],
 "qm_go": [
  "さがす",
  "Find a match",
  "尋找",
  "찾기"
 ],
 "qm_badname": [
  "その名前は使えません。ほかの名前にしてね",
  "That name can't be used. Please choose another.",
  "這個名字不能使用，請換一個。",
  "그 이름은 사용할 수 없어요. 다른 이름으로 해 주세요."
 ],
 "qm_searching": [
  "相手をさがしています",
  "Looking for an opponent",
  "正在尋找對手",
  "상대를 찾는 중"
 ],
 "qm_wait_pre": [
  "いま対戦待ち ",
  "Waiting now: ",
  "目前等待中 ",
  "현재 대기 "
 ],
 "qm_wait_post": [
  "人",
  "",
  "人",
  "명"
 ],
 "qm_cpu": [
  "CPUと遊びながら待つ",
  "Play the CPU while waiting",
  "一邊和CPU玩一邊等",
  "기다리는 동안 CPU와 플레이"
 ],
 "qm_cancel": [
  "やめる",
  "Cancel",
  "取消",
  "그만두기"
 ],
 "qm_retry": [
  "もう一度さがす",
  "Search again",
  "再找一次",
  "다시 찾기"
 ],
 "qm_searching_t": [
  "相手をさがしています… {t}",
  "Looking for an opponent… {t}",
  "正在尋找對手… {t}",
  "상대를 찾는 중… {t}"
 ],
 "qm_calling": [
  "CPUと遊んでいる人に声をかけています…",
  "Inviting someone who is playing the CPU…",
  "正在邀請正在和CPU玩的人…",
  "CPU와 플레이 중인 사람에게 신청하는 중…"
 ],
 "qm_declined": [
  "相手が見送りました。ほかの人をさがします",
  "They passed. Looking for someone else.",
  "對方跳過了，改找其他人。",
  "상대가 넘겼어요. 다른 사람을 찾을게요."
 ],
 "qm_found": [
  "相手が見つかりました！",
  "Opponent found!",
  "找到對手了！",
  "상대를 찾았어요!"
 ],
 "qm_avail": [
  "対戦できる相手がいます！",
  "Someone is ready to play!",
  "有可以對戰的對手！",
  "대전할 수 있는 상대가 있어요!"
 ],
 "qm_play": [
  "対戦する",
  "Play",
  "對戰",
  "대전하기"
 ],
 "qm_pass": [
  "見送る",
  "Pass",
  "跳過",
  "넘기기"
 ],
 "qm_taken": [
  "さっきの相手は、ほかの人と対戦を始めました。もう少し待ってね",
  "That player started a match with someone else. Please wait a little longer.",
  "剛才的對手已經和別人開始對戰了。請再等一下。",
  "방금 상대는 다른 사람과 대전을 시작했어요. 조금만 더 기다려 주세요."
 ],
 "qm_fail": [
  "相手とつながりませんでした（{c}）",
  "Couldn't connect to your opponent ({c})",
  "無法和對手連線（{c}）",
  "상대와 연결되지 않았어요 ({c})"
 ],
 "qm_nojoin": [
  "入れませんでした",
  "Couldn't join",
  "無法進入",
  "들어가지 못했어요"
 ],
 "qm_next": [
  "次の相手をさがす",
  "Find next opponent",
  "尋找下一位對手",
  "다음 상대 찾기"
 ],
 "doc_title": [
  "弾丸合併",
  "Bullet Merger",
  "子彈合併",
  "탄환 합병"
 ],
 "doc_desc": [
  "市町村や国を3つ、1本の軸で串ざしにしてコマを作る。本物の形がはみ出してぶつかり、削れ合う。",
  "Skewer 3 real towns or countries on one axle to make a spinning top. Their real shapes stick out, clash and chip away.",
  "把3個市町村或國家用一根軸串起來做成陀螺。突出的真實形狀互相碰撞、削減。",
  "시정촌이나 나라 3개를 축 하나로 꿰어 팽이를 만든다. 튀어나온 진짜 모양이 부딪혀 서로 깎인다."
 ],
 "logo": [
  "<span class=\"l1\">弾丸</span><span class=\"l2\">合併</span>",
  "<span class=\"l1\">BULLET</span><span class=\"l2\">MERGER</span>",
  "<span class=\"l1\">子彈</span><span class=\"l2\">合併</span>",
  "<span class=\"l1\">탄환</span><span class=\"l2\">합병</span>"
 ],
 "logo1": [
  "弾丸",
  "BULLET ",
  "子彈",
  "탄환 "
 ],
 "logo2": [
  "合併",
  "MERGER",
  "合併",
  "합병"
 ],
 "tagline": [
  "市町村や国を<b>3つ</b>、1本の軸で<b>串ざし</b>。<br>はみ出した<b>本物の形</b>がぶつかって削れ合う。",
  "Skewer <b>3</b> real towns or countries on <b>one axle</b>.<br>Their <b>real shapes</b> stick out, clash and chip away.",
  "把<b>3個</b>市町村或國家用一根軸<b>串起來</b>。<br>突出的<b>真實形狀</b>互相碰撞、削減。",
  "시정촌이나 나라 <b>3개</b>를 축 하나로 <b>꼬치처럼</b> 꿴다.<br>튀어나온 <b>진짜 모양</b>이 부딪혀 서로 깎인다."
 ],
 "btn_build": [
  "コマを作る",
  "Build a top",
  "製作陀螺",
  "팽이 만들기"
 ],
 "btn_online": [
  "あいことば対戦",
  "Passcode battle",
  "暗號對戰",
  "암호 대전"
 ],
 "btn_vs": [
  "ひとりで対戦",
  "Solo battle",
  "單人對戰",
  "혼자 대전"
 ],
 "btn_chal": [
  "挑戦状と戦う",
  "Take a challenge",
  "迎戰挑戰書",
  "도전장과 싸우기"
 ],
 "btn_saved": [
  "保存したコマ",
  "Saved tops",
  "保存的陀螺",
  "저장한 팽이"
 ],
 "btn_mine": [
  "あなたの挑戦状",
  "Your challenges",
  "你的挑戰書",
  "내 도전장"
 ],
 "btn_bz": [
  "番付",
  "Rankings",
  "排行榜",
  "순위표"
 ],
 "snd": [
  "音：",
  "Sound: ",
  "聲音：",
  "소리: "
 ],
 "snd_on": [
  "あり",
  "On",
  "開",
  "켬"
 ],
 "snd_off": [
  "なし",
  "Off",
  "關",
  "끔"
 ],
 "jimoto_link": [
  "地元の最強で、形どうしを戦わせる →",
  "Pit shapes one-on-one in \"Hometown Champion\" →",
  "到「家鄉最強」讓形狀互相對戰 →",
  "「우리 동네 최강」에서 모양끼리 싸우기 →"
 ],
 "loading": [
  "市町村を読みこみ中…",
  "Loading places…",
  "正在讀取市町村…",
  "지명을 불러오는 중…"
 ],
 "loading_wait": [
  "市町村を読みこみ中です。少し待ってください",
  "Still loading places. Please wait a moment.",
  "正在讀取市町村，請稍候。",
  "지명을 불러오는 중이에요. 잠시 기다려 주세요."
 ],
 "load_err": [
  "読みこめませんでした。通信を確かめて、ページを読みこみなおしてください。",
  "Couldn't load. Check your connection and reload the page.",
  "無法讀取。請確認網路後重新整理頁面。",
  "불러오지 못했어요. 연결을 확인하고 페이지를 새로고침해 주세요."
 ],
 "back_arrow": [
  "← もどる",
  "← Back",
  "← 返回",
  "← 돌아가기"
 ],
 "auto_merge": [
  "おまかせ合併",
  "Random merge",
  "隨機合併",
  "랜덤 합병"
 ],
 "rot_l": [
  "左に45度",
  "Rotate left 45°",
  "向左轉45度",
  "왼쪽으로 45도"
 ],
 "rot_r": [
  "右に45度",
  "Rotate right 45°",
  "向右轉45度",
  "오른쪽으로 45도"
 ],
 "b_tip": [
  "形の上の<b>●</b>をおして、軸をさす所をえらぶ",
  "Tap a <b>●</b> on the shape to choose where the axle goes",
  "點形狀上的<b>●</b>，選擇插軸的位置",
  "모양 위의 <b>●</b>를 눌러 축을 꽂을 곳을 고르기"
 ],
 "ph_search": [
  "市町村・国をさがす（例：大垣市、チリ）",
  "Search towns & countries (e.g. Ogaki, Chile)",
  "搜尋市町村・國家（例：大垣市、智利）",
  "시정촌·나라 검색 (예: 오가키, 칠레)"
 ],
 "m_rec": [
  "おすすめ",
  "Picks",
  "推薦",
  "추천"
 ],
 "m_pop": [
  "人気",
  "Popular",
  "熱門",
  "인기"
 ],
 "m_sort": [
  "並べかえ",
  "Sort",
  "排序",
  "정렬"
 ],
 "sort_key": [
  "並べる数字",
  "Sort by",
  "排序依據",
  "정렬 기준"
 ],
 "filter": [
  "しぼりこみ",
  "Filter",
  "篩選",
  "필터"
 ],
 "dir_desc": [
  "多い順",
  "High→Low",
  "由多到少",
  "많은 순"
 ],
 "dir_asc": [
  "少ない順",
  "Low→High",
  "由少到多",
  "적은 순"
 ],
 "try_spin": [
  "試し回し",
  "Test spin",
  "試轉",
  "시운전"
 ],
 "save": [
  "保存",
  "Save",
  "保存",
  "저장"
 ],
 "fight_this": [
  "これで戦う",
  "Fight!",
  "用這個對戰",
  "출전!"
 ],
 "tier_top": [
  "上段",
  "Top",
  "上段",
  "상단"
 ],
 "tier_mid": [
  "中段",
  "Middle",
  "中段",
  "중단"
 ],
 "tier_bot": [
  "下段",
  "Bottom",
  "下段",
  "하단"
 ],
 "tier_top_s": [
  "上",
  "Top",
  "上",
  "상"
 ],
 "tier_mid_s": [
  "中",
  "Mid",
  "中",
  "중"
 ],
 "tier_bot_s": [
  "下",
  "Btm",
  "下",
  "하"
 ],
 "fit_tier": [
  "{t}向き",
  "For {t}",
  "適合{t}",
  "{t}형"
 ],
 "st_weight": [
  "重さ",
  "Weight",
  "重量",
  "무게"
 ],
 "st_reach": [
  "届く",
  "Reach",
  "觸及",
  "사거리"
 ],
 "st_power": [
  "攻め",
  "Attack",
  "攻擊",
  "공격"
 ],
 "st_guard": [
  "守り",
  "Defense",
  "防守",
  "방어"
 ],
 "st_wobble": [
  "暴れ",
  "Wobble",
  "亂甩",
  "날뜀"
 ],
 "st_speed": [
  "動き",
  "Moves",
  "移動",
  "움직임"
 ],
 "calc": [
  "計算中…",
  "Calculating…",
  "計算中…",
  "계산 중…"
 ],
 "overhang": [
  "はみ出し",
  "Overhang",
  "突出",
  "돌출"
 ],
 "cmp_prev": [
  "↑↓は前の作りとくらべて",
  "↑↓ = vs. your previous build",
  "↑↓ 是和上一個組合比較",
  "↑↓는 이전 구성과 비교"
 ],
 "overhang_note": [
  "外にはみ出した所が当たって削れる",
  "Parts that stick out hit and get chipped",
  "突出的部分會被撞到削掉",
  "튀어나온 부분이 부딪혀 깎인다"
 ],
 "shape_err": [
  "形を読みこめませんでした",
  "Couldn't load the shape",
  "無法讀取形狀",
  "모양을 불러오지 못했어요"
 ],
 "hole_lab": [
  "穴{n}：{k}（{c}個）",
  "Hole {n}: {k} ({c} total)",
  "孔{n}：{k}（共{c}個）",
  "구멍 {n}: {k} (총 {c}개)"
 ],
 "hk_com": [
  "重心",
  "center of mass",
  "重心",
  "무게중심"
 ],
 "hk_end": [
  "はし",
  "edge",
  "邊緣",
  "끝"
 ],
 "hk_tip": [
  "とがり",
  "spike",
  "尖端",
  "뾰족한 곳"
 ],
 "hk_fat": [
  "太い所",
  "thick part",
  "粗的部分",
  "두꺼운 곳"
 ],
 "hk_other": [
  "ほか",
  "other",
  "其他",
  "기타"
 ],
 "auto_merged": [
  "おまかせで合併しました",
  "Merged at random",
  "已隨機合併",
  "랜덤으로 합병했어요"
 ],
 "sk_hp": [
  "体力",
  "Stamina",
  "體力",
  "체력"
 ],
 "sk_mom": [
  "勢い",
  "Momentum",
  "氣勢",
  "기세"
 ],
 "sk_hard": [
  "かたさ",
  "Toughness",
  "硬度",
  "단단함"
 ],
 "sk_sharp": [
  "鋭さ",
  "Sharpness",
  "銳利",
  "날카로움"
 ],
 "sk_speed": [
  "速さ",
  "Speed",
  "速度",
  "속도"
 ],
 "sk_pop": [
  "人口",
  "Population",
  "人口",
  "인구"
 ],
 "fl_all": [
  "全部",
  "All",
  "全部",
  "전체"
 ],
 "fl_now": [
  "今ある",
  "Existing",
  "現存",
  "현존"
 ],
 "fl_old": [
  "なくなった",
  "Defunct",
  "已消失",
  "사라진"
 ],
 "fl_jp": [
  "日本",
  "Japan",
  "日本",
  "일본"
 ],
 "fl_world": [
  "世界",
  "World",
  "世界",
  "세계"
 ],
 "sort_desc": [
  "{what}を{k}の多い順（{n}件{top}）",
  "{what} by {k}, high to low ({n}{top})",
  "{what}依{k}由多到少（{n}筆{top}）",
  "{what} · {k} 많은 순 ({n}건{top})"
 ],
 "sort_asc": [
  "{what}を{k}の少ない順（{n}件{top}）",
  "{what} by {k}, low to high ({n}{top})",
  "{what}依{k}由少到多（{n}筆{top}）",
  "{what} · {k} 적은 순 ({n}건{top})"
 ],
 "top80": [
  "の上から80件",
  ", top 80 shown",
  "，顯示前80筆",
  ", 상위 80건"
 ],
 "all_items": [
  "全体",
  "All",
  "全部",
  "전체"
 ],
 "quoted": [
  "「{q}」",
  "\"{q}\"",
  "「{q}」",
  "\"{q}\""
 ],
 "n_of_m": [
  "{m}件中 {n}件",
  "{n} of {m}",
  "{m}筆中 {n}筆",
  "{m}건 중 {n}건"
 ],
 "n_items": [
  "{n}件",
  "{n} results",
  "{n}筆",
  "{n}건"
 ],
 "not_found": [
  "見つかりません",
  "No results",
  "找不到",
  "찾을 수 없어요"
 ],
 "loading_s": [
  "読みこみ中…",
  "Loading…",
  "讀取中…",
  "불러오는 중…"
 ],
 "pop_few": [
  "まだ挑戦状が少なくて、人気がわかりません。",
  "Not enough challenges yet to know what's popular.",
  "挑戰書還太少，看不出人氣。",
  "아직 도전장이 적어서 인기를 알 수 없어요."
 ],
 "pop_head": [
  "新しい挑戦状{n}枚で、{t}によく使われている",
  "Most used as {t} in {n} recent challenges",
  "在最新的{n}張挑戰書中，{t}常用的",
  "최근 도전장 {n}장에서 {t}에 많이 쓰인 것"
 ],
 "rec_head": [
  "{t}向きの候補（さがすと24,838から選べる）",
  "Good picks for {t} (search to choose from 24,838)",
  "適合{t}的候選（搜尋可從24,838個中選）",
  "{t}에 맞는 후보 (검색하면 24,838개 중에서 고를 수 있어요)"
 ],
 "more_cands": [
  "ほかの候補",
  "More",
  "其他候選",
  "다른 후보"
 ],
 "until_y": [
  " ・{y}年まで",
  " · until {y}",
  " ・到{y}年",
  " · {y}년까지"
 ],
 "n_times": [
  "{n}回",
  "{n}×",
  "{n}次",
  "{n}회"
 ],
 "saved_local": [
  "保存しました（この端末）",
  "Saved (on this device)",
  "已保存（此裝置）",
  "저장했어요 (이 기기)"
 ],
 "save_fail": [
  "保存できませんでした",
  "Couldn't save",
  "無法保存",
  "저장하지 못했어요"
 ],
 "lab_made": [
  "作ったコマ",
  "Your build",
  "你做的陀螺",
  "만든 팽이"
 ],
 "random": [
  "おまかせ",
  "Random",
  "隨機",
  "랜덤"
 ],
 "lab_saved": [
  "保存",
  "Saved",
  "已保存",
  "저장"
 ],
 "lab_recv": [
  "もらったコマ",
  "Received top",
  "收到的陀螺",
  "받은 팽이"
 ],
 "lab_this": [
  "このコマ",
  "This top",
  "這個陀螺",
  "이 팽이"
 ],
 "red": [
  "赤",
  "Red",
  "紅",
  "빨강"
 ],
 "blue": [
  "青",
  "Blue",
  "藍",
  "파랑"
 ],
 "dot": [
  "・",
  " · ",
  "・",
  " · "
 ],
 "colon": [
  "：",
  ": ",
  "：",
  ": "
 ],
 "parts_sep": [
  "　",
  " · ",
  "　",
  " · "
 ],
 "none_yet": [
  "まだない",
  "None yet",
  "還沒有",
  "아직 없음"
 ],
 "from_saved": [
  "保存から",
  "From saved",
  "從保存",
  "저장에서"
 ],
 "make": [
  "作る",
  "Build",
  "製作",
  "만들기"
 ],
 "vs_title": [
  "対戦",
  "Battle",
  "對戰",
  "대전"
 ],
 "vs_go": [
  "対戦！",
  "FIGHT!",
  "對戰！",
  "대전!"
 ],
 "revenge": [
  "仕返し",
  "Revenge",
  "報仇",
  "복수"
 ],
 "pick_top": [
  "{c}のコマをえらぶ",
  "Pick the {c} top",
  "選擇{c}方陀螺",
  "{c} 팽이 고르기"
 ],
 "use_this": [
  "これにする",
  "Use this",
  "就用這個",
  "이걸로"
 ],
 "fight": [
  "戦う",
  "Fight",
  "對戰",
  "싸우기"
 ],
 "rebuild": [
  "作り直す",
  "Rebuild",
  "重新製作",
  "다시 만들기"
 ],
 "send": [
  "送る",
  "Send",
  "傳送",
  "보내기"
 ],
 "make_chal": [
  "挑戦状にする",
  "Post as challenge",
  "設為挑戰書",
  "도전장으로"
 ],
 "del": [
  "消す",
  "Delete",
  "刪除",
  "삭제"
 ],
 "sv_empty": [
  "まだ保存したコマはありません。<br>「コマを作る」で作って「保存」をおしてください。",
  "No saved tops yet.<br>Make one with \"Build a top\" and press \"Save\".",
  "還沒有保存的陀螺。<br>請用「製作陀螺」做好後按「保存」。",
  "아직 저장한 팽이가 없어요.<br>\"팽이 만들기\"로 만들고 \"저장\"을 눌러 주세요."
 ],
 "deleted": [
  "消しました",
  "Deleted",
  "已刪除",
  "삭제했어요"
 ],
 "send_text": [
  "弾丸合併「{n}」と戦って！",
  "Fight my \"{n}\" in Bullet Merger!",
  "來和子彈合併的「{n}」對戰！",
  "탄환 합병에서 \"{n}\"랑 싸워 봐!"
 ],
 "link_copied": [
  "リンクをコピーしました",
  "Link copied",
  "已複製連結",
  "링크를 복사했어요"
 ],
 "speed": [
  "速さ",
  "Speed",
  "速度",
  "속도"
 ],
 "cam_auto": [
  "おまかせ視点",
  "Auto cam",
  "自動視角",
  "자동 시점"
 ],
 "cam_top": [
  "真上",
  "Top view",
  "正上方",
  "위에서"
 ],
 "quit": [
  "やめる",
  "Quit",
  "結束",
  "그만두기"
 ],
 "hint3d": [
  "ドラッグで回す・ピンチで寄る",
  "Drag to rotate · pinch to zoom",
  "拖曳旋轉・雙指縮放",
  "드래그로 회전 · 핀치로 확대"
 ],
 "light_view": [
  "軽い表示にしました",
  "Switched to a lighter display",
  "已切換為輕量顯示",
  "가벼운 화면으로 바꿨어요"
 ],
 "to2d": [
  "2Dの表示に切りかえました",
  "Switched to 2D view",
  "已切換為2D顯示",
  "2D 화면으로 바꿨어요"
 ],
 "co_burst": [
  "合併解消！",
  "DE-MERGED!",
  "解除合併！",
  "합병 해소!"
 ],
 "co_time": [
  "時間切れ！",
  "TIME UP!",
  "時間到！",
  "시간 종료!"
 ],
 "co_end": [
  "決着！",
  "FINISH!",
  "分出勝負！",
  "결판!"
 ],
 "co_spin": [
  "回せ！",
  "SPIN!",
  "轉起來！",
  "돌려라!"
 ],
 "r_left": [
  "残り",
  "Remaining",
  "剩餘",
  "남은 양"
 ],
 "r_dealt": [
  "削った量",
  "Dealt",
  "削掉的量",
  "깎은 양"
 ],
 "r_taken": [
  "削られた量",
  "Taken",
  "被削的量",
  "깎인 양"
 ],
 "r_best": [
  "最大の一撃",
  "Biggest hit",
  "最大一擊",
  "최대 일격"
 ],
 "r_wob": [
  "暴れ度",
  "Wobble",
  "亂甩度",
  "날뜀 정도"
 ],
 "r_burst": [
  "合併解消",
  "De-merged",
  "解除合併",
  "합병 해소"
 ],
 "none": [
  "なし",
  "None",
  "無",
  "없음"
 ],
 "paren": [
  "（{x}）",
  " ({x})",
  "（{x}）",
  " ({x})"
 ],
 "list_sep": [
  "・",
  ", ",
  "、",
  ", "
 ],
 "why_mirror": [
  "同じコマどうしは引き分け",
  "Identical tops always draw",
  "相同陀螺互鬥為平手",
  "같은 팽이끼리는 무승부"
 ],
 "why_same": [
  "残りが同じ",
  "Same amount left",
  "剩餘相同",
  "남은 양이 같음"
 ],
 "why_time": [
  "60秒たって、残りが多かった",
  "More left after 60 seconds",
  "60秒後剩餘較多",
  "60초 후 남은 양이 더 많음"
 ],
 "why_break": [
  "相手を65%削った",
  "Chipped 65% off the opponent",
  "削掉對手65%",
  "상대를 65% 깎음"
 ],
 "why_t": [
  "{w}（{t}秒）",
  "{w} ({t}s)",
  "{w}（{t}秒）",
  "{w} ({t}초)"
 ],
 "draw": [
  "引き分け",
  "Draw",
  "平手",
  "무승부"
 ],
 "wins_html": [
  "{n}の勝ち！",
  "{n} wins!",
  "{n}獲勝！",
  "{n} 승리!"
 ],
 "img_result": [
  "結果画像を出す",
  "Show result image",
  "顯示結果圖片",
  "결과 이미지 보기"
 ],
 "img_win": [
  "勝利画像を出す",
  "Show victory image",
  "顯示勝利圖片",
  "승리 이미지 보기"
 ],
 "leave_room": [
  "部屋を出る",
  "Leave room",
  "離開房間",
  "방 나가기"
 ],
 "one_more": [
  "もう一戦",
  "Rematch",
  "再一局",
  "한 판 더"
 ],
 "back_build": [
  "作る画面にもどる",
  "Back to builder",
  "回到製作畫面",
  "만들기 화면으로"
 ],
 "try_other": [
  "別の相手と試す",
  "Try another foe",
  "換對手試試",
  "다른 상대와 시험"
 ],
 "title_s": [
  "タイトル",
  "Title",
  "標題",
  "타이틀"
 ],
 "rebuild_retry": [
  "作り直して再挑戦",
  "Rebuild & retry",
  "重做再挑戰",
  "다시 만들어 재도전"
 ],
 "other_chal": [
  "別の挑戦状",
  "Another challenge",
  "其他挑戰書",
  "다른 도전장"
 ],
 "change_opp": [
  "相手を変える",
  "Change foe",
  "換對手",
  "상대 바꾸기"
 ],
 "save_red": [
  "赤を保存",
  "Save Red",
  "保存紅方",
  "빨강 저장"
 ],
 "put_chal": [
  "挑戦状を置く",
  "Post challenge",
  "發出挑戰書",
  "도전장 올리기"
 ],
 "tg_mirror": [
  "同じコマどうし",
  "Mirror match",
  "相同陀螺",
  "같은 팽이끼리"
 ],
 "tg_burst_n": [
  "合併解消×{n}！",
  "De-merged ×{n}!",
  "解除合併×{n}！",
  "합병 해소×{n}!"
 ],
 "tg_burst": [
  "合併解消させた！",
  "Forced a de-merge!",
  "讓對手解除合併！",
  "합병 해소시켰다!"
 ],
 "tg_rout": [
  "圧勝！",
  "Crushing win!",
  "壓倒性勝利！",
  "압승!"
 ],
 "tg_close": [
  "ギリギリの勝ち",
  "Narrow win",
  "險勝",
  "아슬아슬한 승리"
 ],
 "tg_fast": [
  "スピード決着",
  "Speedy finish",
  "速戰速決",
  "스피드 결판"
 ],
 "tg_time": [
  "時間切れ判定",
  "Won on time",
  "時間到判定",
  "시간 종료 판정"
 ],
 "tg_big": [
  "大きな一撃",
  "Big hit",
  "強力一擊",
  "큰 일격"
 ],
 "tg_chal": [
  "{n}さんの挑戦状",
  "{n}'s challenge",
  "{n}的挑戰書",
  "{n}님의 도전장"
 ],
 "sh_tags": [
  "【{t}】",
  "[{t}] ",
  "【{t}】",
  "[{t}] "
 ],
 "sh_draw": [
  "{a}と{b}は引き分け",
  "{a} and {b} drew",
  "{a}和{b}平手",
  "{a} vs {b} 무승부"
 ],
 "sh_win": [
  "{w}が{l}を破った！（HP{hp}残し）",
  "{w} beat {l}! ({hp} HP left)",
  "{w}打敗了{l}！（剩HP{hp}）",
  "{w}, {l} 격파! (HP {hp} 남음)"
 ],
 "sh_chal": [
  "\n{n}さんの挑戦状に挑戦！あなたも→ {u}",
  "\nTook on {n}'s challenge! Your turn → {u}",
  "\n挑戰了{n}的挑戰書！你也來→ {u}",
  "\n{n}님의 도전장에 도전! 당신도→ {u}"
 ],
 "sh_fight": [
  "\nこのコマと戦う→ {u}",
  "\nFight this top → {u}",
  "\n和這個陀螺對戰→ {u}",
  "\n이 팽이와 싸우기→ {u}"
 ],
 "hashtag": [
  "#弾丸合併",
  "#BulletMerger",
  "#子彈合併",
  "#탄환합병"
 ],
 "img_making": [
  "画像を作っています…",
  "Making image…",
  "正在製作圖片…",
  "이미지 만드는 중…"
 ],
 "img_fail": [
  "画像を作れませんでした",
  "Couldn't make the image",
  "無法製作圖片",
  "이미지를 만들지 못했어요"
 ],
 "img_saved_paste": [
  "画像を保存しました。投稿画面に貼りつけてください",
  "Image saved. Attach it to your post.",
  "圖片已儲存，請貼到發文畫面。",
  "이미지를 저장했어요. 게시 화면에 붙여 주세요."
 ],
 "res_img": [
  "結果画像",
  "Result image",
  "結果圖片",
  "결과 이미지"
 ],
 "post_x": [
  "Xに投稿",
  "Post to X",
  "發到X",
  "X에 올리기"
 ],
 "save_img": [
  "画像を保存",
  "Save image",
  "儲存圖片",
  "이미지 저장"
 ],
 "long_press": [
  "画像を長押しでも保存できます",
  "You can also long-press the image to save it",
  "長按圖片也可以儲存",
  "이미지를 길게 눌러도 저장할 수 있어요"
 ],
 "stamp_win": [
  "勝負|あり",
  "GAME|SET",
  "勝負|已分",
  "승부|결정"
 ],
 "stamp_draw": [
  "痛み|分け",
  "DEAD|HEAT",
  "不分|勝負",
  "무승부|"
 ],
 "img_and": [
  "{a} と {b}",
  "{a} & {b}",
  "{a} 與 {b}",
  "{a} · {b}"
 ],
 "img_wins": [
  "の勝ち！",
  "WINS!",
  "獲勝！",
  "승리!"
 ],
 "img_beat": [
  "{n} を破る",
  "beat {n}",
  "打敗 {n}",
  "{n} 격파"
 ],
 "cpu_wait_chal": [
  "挑戦状と戦いながら待つ",
  "Fight challenges while waiting",
  "一邊迎戰挑戰書一邊等",
  "기다리는 동안 도전장과 싸우기"
 ],
 "recv_toast": [
  "もらったコマと戦えます",
  "You can fight the top you received",
  "可以和收到的陀螺對戰",
  "받은 팽이와 싸울 수 있어요"
 ],
 "on_note": [
  "同じ「あいことば」を入れた人と1対1。保存したコマから30秒以内に1つえらんで、同時に公開します。3人目からは観戦です。",
  "Go 1-on-1 with whoever enters the same passcode. Each picks one saved top within 30 seconds; both are revealed at once. From the 3rd person on, you watch.",
  "和輸入相同「暗號」的人1對1。在30秒內從保存的陀螺中選一個，同時公開。第3個人開始為觀戰。",
  "같은 '암호'를 입력한 사람과 1대1. 저장한 팽이 중 하나를 30초 안에 골라 동시에 공개합니다. 3번째 사람부터는 관전입니다."
 ],
 "ph_name8": [
  "8文字まで",
  "Up to 8 chars",
  "最多8個字",
  "8자까지"
 ],
 "ex_code": [
  "例：だんがんたいけつ",
  "e.g. bulletduel",
  "例：bulletduel",
  "예: bulletduel"
 ],
 "join_in": [
  "入る",
  "Join",
  "進入",
  "입장"
 ],
 "leave_arrow": [
  "← 出る",
  "← Leave",
  "← 離開",
  "← 나가기"
 ],
 "room_full": [
  "この部屋は観戦の人でいっぱいです（10人まで）",
  "This room is full of spectators (max 10)",
  "這個房間的觀戰人數已滿（最多10人）",
  "이 방은 관전자가 가득 찼어요 (최대 10명)"
 ],
 "watching_vs": [
  "観戦中：{a} VS {b}",
  "Watching: {a} VS {b}",
  "觀戰中：{a} VS {b}",
  "관전 중: {a} VS {b}"
 ],
 "both_picking": [
  "ふたりがコマをえらんでいます…",
  "Both players are choosing tops…",
  "兩人正在選陀螺…",
  "두 사람이 팽이를 고르는 중…"
 ],
 "you_ready": [
  "あなたは準備OK。",
  "You're ready.",
  "你已準備好。",
  "준비 완료."
 ],
 "pick_left": [
  "のこり{n}秒でえらんでね。",
  "Choose within {n}s.",
  "請在{n}秒內選擇。",
  "{n}초 안에 골라 주세요."
 ],
 "opp_ready": [
  "　あいては準備OK！",
  " Opponent is ready!",
  "　對手已準備好！",
  " 상대는 준비 완료!"
 ],
 "opp_picking": [
  "　あいてはえらんでいます…",
  " Opponent is choosing…",
  "　對手正在選擇…",
  " 상대가 고르는 중…"
 ],
 "ready_re": [
  "準備OK（えらび直せます）",
  "Ready (you can still change)",
  "準備好（可重選）",
  "준비 완료 (다시 고를 수 있어요)"
 ],
 "ready": [
  "準備OK",
  "Ready",
  "準備好了",
  "준비 완료"
 ],
 "net_same": [
  "ふたりの画面で同じ結果になりました。",
  "Both screens got the same result.",
  "兩邊畫面的結果相同。",
  "두 화면의 결과가 같았어요."
 ],
 "net_diff": [
  "※ふたりの画面で結果がずれました（お知らせください）",
  "※ The two screens got different results (please let us know)",
  "※兩邊畫面的結果不同（請告訴我們）",
  "※두 화면의 결과가 달라요 (알려 주세요)"
 ],
 "opp_left_room": [
  "相手が部屋から出ました",
  "Your opponent left the room",
  "對手離開了房間",
  "상대가 방에서 나갔어요"
 ],
 "you_win": [
  "あなたの勝ち！",
  "You win!",
  "你贏了！",
  "당신의 승리!"
 ],
 "play_other": [
  "また別の人と対戦できます。",
  "You can play someone else.",
  "可以再和其他人對戰。",
  "다른 사람과 또 대전할 수 있어요."
 ],
 "opp_gone": [
  "あいてがいなくなりました",
  "Your opponent is gone",
  "對手不見了",
  "상대가 사라졌어요"
 ],
 "watch_wait": [
  "観戦します。試合を待っています…",
  "Spectating. Waiting for the match…",
  "觀戰中。等待比賽…",
  "관전합니다. 경기를 기다리는 중…"
 ],
 "wl": [
  "{w}勝{l}敗",
  "{w}W {l}L",
  "{w}勝{l}敗",
  "{w}승 {l}패"
 ],
 "no_chal_yet": [
  "まだだれも挑戦していない",
  "No challengers yet",
  "還沒有人挑戰",
  "아직 아무도 도전하지 않음"
 ],
 "w_region": [
  "世界の国・昔の国",
  "World countries & former countries",
  "世界各國・昔日國家",
  "세계의 나라·옛 나라"
 ],
 "chal_searching": [
  "挑戦状をさがしています…",
  "Finding a challenge…",
  "正在尋找挑戰書…",
  "도전장을 찾는 중…"
 ],
 "chal_allmine": [
  "いまある挑戦状は、ぜんぶあなたのものです",
  "All current challenges are yours",
  "目前的挑戰書都是你的",
  "지금 있는 도전장은 전부 당신 거예요"
 ],
 "chal_none": [
  "まだ挑戦状がありません。試合のあとに置いてみよう",
  "No challenges yet. Post one after a match!",
  "還沒有挑戰書。比賽後發一張吧！",
  "아직 도전장이 없어요. 경기 후에 올려 보세요!"
 ],
 "chal_loadfail": [
  "挑戦状を読みこめませんでした",
  "Couldn't load challenges",
  "無法讀取挑戰書",
  "도전장을 불러오지 못했어요"
 ],
 "lab_chal": [
  "{n}さんの挑戦状（{r}）",
  "{n}'s challenge ({r})",
  "{n}的挑戰書（{r}）",
  "{n}님의 도전장 ({r})"
 ],
 "chal_retired": [
  "この挑戦状は引退しました",
  "This challenge has been retired",
  "這張挑戰書已退役",
  "이 도전장은 은퇴했어요"
 ],
 "chal_notfound": [
  "この挑戦状は見つかりませんでした",
  "This challenge wasn't found",
  "找不到這張挑戰書",
  "이 도전장을 찾지 못했어요"
 ],
 "chal_arrived": [
  "{n}さんの挑戦状が届きました",
  "{n}'s challenge has arrived",
  "收到{n}的挑戰書",
  "{n}님의 도전장이 도착했어요"
 ],
 "chal_won": [
  "{n}さんの挑戦状に勝った！",
  "You beat {n}'s challenge!",
  "贏了{n}的挑戰書！",
  "{n}님의 도전장에 이겼다!"
 ],
 "chal_lost": [
  "{n}さんの挑戦状に負けた…",
  "Lost to {n}'s challenge…",
  "輸給{n}的挑戰書…",
  "{n}님의 도전장에 졌다…"
 ],
 "chal_draw": [
  "{n}さんの挑戦状と引き分け",
  "Drew with {n}'s challenge",
  "和{n}的挑戰書平手",
  "{n}님의 도전장과 무승부"
 ],
 "this_chal_rec": [
  "（この挑戦状：{r}）",
  " (This challenge: {r})",
  "（這張挑戰書：{r}）",
  " (이 도전장: {r})"
 ],
 "copy_fail": [
  "コピーできませんでした",
  "Couldn't copy",
  "無法複製",
  "복사하지 못했어요"
 ],
 "boshu": [
  "弾丸合併「{n}」で挑戦状を置きました。倒せるものなら倒してみて！\n{u}\n#弾丸合併",
  "I posted a challenge with \"{n}\" in Bullet Merger. Beat it if you can!\n{u}\n#BulletMerger",
  "我在子彈合併用「{n}」發出了挑戰書。有本事就來打倒它！\n{u}\n#子彈合併",
  "탄환 합병에서 \"{n}\"(으)로 도전장을 올렸어요. 이길 수 있으면 이겨 봐!\n{u}\n#탄환합병"
 ],
 "put_sub": [
  "えらんだコマが、そのまま挑戦状になります。だれかが挑戦すると成績がつき、挑戦者をたくさん倒すと番付にのります（中段の県・国の番付）。",
  "The top you choose becomes a challenge as-is. When people take it on it builds a record, and beating many challengers puts it in the Rankings (for its Middle tier's prefecture/country).",
  "選擇的陀螺會直接變成挑戰書。有人挑戰就會記錄戰績，打倒很多挑戰者就能登上排行榜（中段的縣・國家排行榜）。",
  "고른 팽이가 그대로 도전장이 됩니다. 누군가 도전하면 전적이 쌓이고, 도전자를 많이 쓰러뜨리면 순위표에 올라요 (중단의 현·나라 순위표)."
 ],
 "put_x": [
  "{l}：{n}を置く",
  "Post {l}: {n}",
  "發出{l}：{n}",
  "{l}: {n} 올리기"
 ],
 "putting": [
  "置いています…",
  "Posting…",
  "發出中…",
  "올리는 중…"
 ],
 "put_done": [
  "挑戦状を置きました！",
  "Challenge posted!",
  "挑戰書已發出！",
  "도전장을 올렸어요!"
 ],
 "put_done_sub": [
  "リンクを送ると、その人とすぐ勝負できます。成績はタイトルの「あなたの挑戦状」で見られます。",
  "Send the link to battle that person right away. See its record under \"Your challenges\" on the title screen.",
  "傳送連結就能馬上和對方對決。戰績可以在標題畫面的「你的挑戰書」查看。",
  "링크를 보내면 그 사람과 바로 승부할 수 있어요. 전적은 타이틀의 \"내 도전장\"에서 볼 수 있어요."
 ],
 "recruit_post": [
  "挑戦者を募集する（投稿）",
  "Find challengers (post)",
  "募集挑戰者（發文）",
  "도전자 모집 (게시)"
 ],
 "copy_link2": [
  "リンクをコピー",
  "Copy link",
  "複製連結",
  "링크 복사"
 ],
 "ok": [
  "OK",
  "OK",
  "OK",
  "OK"
 ],
 "put_fail": [
  "置けませんでした。通信を確認してね",
  "Couldn't post. Check your connection.",
  "無法發出。請確認網路。",
  "올리지 못했어요. 연결을 확인해 주세요."
 ],
 "mine_sum": [
  "あなたの挑戦状 {n}枚：{w}勝{l}敗",
  "Your challenges ({n}): {w}W {l}L",
  "你的挑戰書 {n}張：{w}勝{l}敗",
  "내 도전장 {n}장: {w}승 {l}패"
 ],
 "news_lost": [
  "🔔 挑戦状が<b>{n}回</b>破られました{x}",
  "🔔 Your challenges were beaten <b>{n}×</b>{x}",
  "🔔 挑戰書被打敗了<b>{n}次</b>{x}",
  "🔔 도전장이 <b>{n}번</b> 깨졌어요{x}"
 ],
 "news_wonx": [
  "・{w}勝",
  " · {w}W",
  "・{w}勝",
  " · {w}승"
 ],
 "news_won": [
  "🔔 挑戦状が<b>{n}回</b>勝ちました",
  "🔔 Your challenges won <b>{n}×</b>",
  "🔔 挑戰書贏了<b>{n}次</b>",
  "🔔 도전장이 <b>{n}번</b> 이겼어요"
 ],
 "no_top": [
  "コマが見つかりません",
  "Top not found",
  "找不到陀螺",
  "팽이를 찾을 수 없어요"
 ],
 "lab_mychal": [
  "あなたの挑戦状",
  "Your challenge",
  "你的挑戰書",
  "내 도전장"
 ],
 "lab_their": [
  "{n}さんのコマ",
  "{n}'s top",
  "{n}的陀螺",
  "{n}님의 팽이"
 ],
 "revenge_toast": [
  "仕返し！青が{n}さんのコマです。赤を作り直して勝ちにいこう",
  "Revenge! Blue is {n}'s top. Rebuild Red and go win!",
  "報仇！藍方是{n}的陀螺。重做紅方去贏回來吧",
  "복수! 파랑이 {n}님의 팽이예요. 빨강을 다시 만들어 이기러 가자"
 ],
 "min_ago": [
  "{n}分前",
  "{n}m ago",
  "{n}分鐘前",
  "{n}분 전"
 ],
 "hr_ago": [
  "{n}時間前",
  "{n}h ago",
  "{n}小時前",
  "{n}시간 전"
 ],
 "day_ago": [
  "{n}日前",
  "{n}d ago",
  "{n}天前",
  "{n}일 전"
 ],
 "mine_empty": [
  "まだ挑戦状を置いていません。<br>試合のあとや「保存したコマ」から置けます。",
  "You haven't posted a challenge yet.<br>Post one after a match or from \"Saved tops\".",
  "還沒有發出挑戰書。<br>可以在比賽後或從「保存的陀螺」發出。",
  "아직 도전장을 올리지 않았어요.<br>경기 후나 \"저장한 팽이\"에서 올릴 수 있어요."
 ],
 "load_fail_net": [
  "読みこめませんでした。通信を確認してね",
  "Couldn't load. Check your connection.",
  "無法讀取。請確認網路。",
  "불러오지 못했어요. 연결을 확인해 주세요."
 ],
 "n_w": [
  "{n}勝",
  "{n}W",
  "{n}勝",
  "{n}승"
 ],
 "n_l": [
  "{n}敗",
  "{n}L",
  "{n}敗",
  "{n}패"
 ],
 "retired": [
  "引退",
  "Retired",
  "已退役",
  "은퇴"
 ],
 "hidden_s": [
  "非表示",
  "Hidden",
  "隱藏",
  "숨김"
 ],
 "put_ago": [
  "{a}に置いた",
  "posted {a}",
  "{a}發出",
  "{a} 올림"
 ],
 "none_challenged": [
  "まだだれも挑戦していません",
  "No one has tried it yet",
  "還沒有人挑戰",
  "아직 아무도 도전하지 않았어요"
 ],
 "mk_w": [
  "勝",
  "W",
  "勝",
  "승"
 ],
 "mk_l": [
  "負",
  "L",
  "負",
  "패"
 ],
 "res_lost": [
  "<b>{n}</b>さんの{t}に破られた",
  "Beaten by <b>{n}</b>'s {t}",
  "被<b>{n}</b>的{t}打敗",
  "<b>{n}</b>님의 {t}에게 깨짐"
 ],
 "res_won": [
  "<b>{n}</b>さんの{t}を倒した",
  "Beat <b>{n}</b>'s {t}",
  "打倒了<b>{n}</b>的{t}",
  "<b>{n}</b>님의 {t} 격파"
 ],
 "unknown_top": [
  "（わからないコマ）",
  "(unknown top)",
  "（不明的陀螺）",
  "(알 수 없는 팽이)"
 ],
 "recruit": [
  "挑戦者を募集",
  "Find challengers",
  "募集挑戰者",
  "도전자 모집"
 ],
 "retire": [
  "引退させる",
  "Retire",
  "讓它退役",
  "은퇴시키기"
 ],
 "retire_q": [
  "引退させますか？",
  "Retire this challenge?",
  "要讓它退役嗎？",
  "은퇴시킬까요?"
 ],
 "retire_body": [
  "<b>{n}</b>の挑戦状は、もうだれとも戦わず、番付からも外れます。<br>もとにもどせません。",
  "The <b>{n}</b> challenge will no longer fight anyone and leaves the Rankings.<br>This can't be undone.",
  "<b>{n}</b>的挑戰書將不再和任何人對戰，也會從排行榜移除。<br>無法復原。",
  "<b>{n}</b> 도전장은 더 이상 누구와도 싸우지 않고 순위표에서도 빠져요.<br>되돌릴 수 없어요."
 ],
 "retired_toast": [
  "引退させました",
  "Retired",
  "已退役",
  "은퇴시켰어요"
 ],
 "fail_net": [
  "できませんでした。通信を確認してね",
  "Couldn't do it. Check your connection.",
  "無法完成。請確認網路。",
  "하지 못했어요. 연결을 확인해 주세요."
 ],
 "chal_none_s": [
  "まだ挑戦状がありません",
  "No challenges yet",
  "還沒有挑戰書",
  "아직 도전장이 없어요"
 ],
 "xf_h": [
  "ほかの端末に引き継ぐ",
  "Move to another device",
  "轉移到其他裝置",
  "다른 기기로 옮기기"
 ],
 "xf_note": [
  "機種変更のときは、コードを出して新しい端末で入れてください。",
  "When you change devices, get a code here and enter it on the new one.",
  "換手機時，請在這裡產生代碼，再到新裝置輸入。",
  "기기를 바꿀 때는 코드를 만들어 새 기기에서 입력해 주세요."
 ],
 "xf_out": [
  "コードを出す",
  "Get code",
  "產生代碼",
  "코드 만들기"
 ],
 "xf_in": [
  "コードを入れる",
  "Enter code",
  "輸入代碼",
  "코드 입력"
 ],
 "xf_code_h": [
  "引き継ぎコード",
  "Transfer code",
  "轉移代碼",
  "이전 코드"
 ],
 "xf_code_sub": [
  "新しい端末の「あなたの挑戦状」→「コードを入れる」に入力すると、挑戦状（{n}枚）を引き継げます。<br>コードは人に教えないでください（引退もできてしまいます）。",
  "On your new device, open \"Your challenges\" → \"Enter code\" to bring over your challenges ({n}).<br>Don't share this code (it can also retire them).",
  "在新裝置的「你的挑戰書」→「輸入代碼」輸入，就能轉移挑戰書（{n}張）。<br>請不要把代碼告訴別人（別人也能讓它退役）。",
  "새 기기의 \"내 도전장\" → \"코드 입력\"에 입력하면 도전장({n}장)을 옮길 수 있어요.<br>코드는 다른 사람에게 알려주지 마세요 (은퇴도 시킬 수 있어요)."
 ],
 "copy": [
  "コピー",
  "Copy",
  "複製",
  "복사"
 ],
 "xf_fail": [
  "コードを作れませんでした。通信を確認してね",
  "Couldn't create a code. Check your connection.",
  "無法產生代碼。請確認網路。",
  "코드를 만들지 못했어요. 연결을 확인해 주세요."
 ],
 "xf_in_sub": [
  "前の端末で出した引き継ぎコード（10文字）を入れてください。",
  "Enter the transfer code (10 characters) from your old device.",
  "請輸入在舊裝置產生的轉移代碼（10個字）。",
  "이전 기기에서 만든 이전 코드(10자)를 입력해 주세요."
 ],
 "code": [
  "コード",
  "Code",
  "代碼",
  "코드"
 ],
 "xf_go": [
  "引き継ぐ",
  "Transfer",
  "轉移",
  "옮기기"
 ],
 "xf_len": [
  "10文字のコードを入れてください",
  "Enter the 10-character code",
  "請輸入10個字的代碼",
  "10자 코드를 입력해 주세요"
 ],
 "xf_notfound": [
  "そのコードは見つかりませんでした",
  "That code wasn't found",
  "找不到這個代碼",
  "그 코드를 찾지 못했어요"
 ],
 "xf_added": [
  "{n}枚の挑戦状を引き継ぎました",
  "Transferred {n} challenge(s)",
  "已轉移{n}張挑戰書",
  "도전장 {n}장을 옮겼어요"
 ],
 "xf_already": [
  "もう全部この端末にあります",
  "They are all on this device already",
  "已經全部在這個裝置上了",
  "이미 전부 이 기기에 있어요"
 ],
 "bz_reg": [
  "県・国",
  "Prefecture / country",
  "縣・國家",
  "현·나라"
 ],
 "bz_note": [
  "中段の県・国ごとに、この30日で挑戦者を多く倒した挑戦状。勝ちは試合を計算しなおして確かめています。",
  "Challenges that beat the most challengers in the last 30 days, by the Middle tier's prefecture/country. Wins are verified by re-simulating each match.",
  "依中段的縣・國家，列出這30天內打倒最多挑戰者的挑戰書。勝場會重新計算比賽來確認。",
  "중단의 현·나라별로 최근 30일간 도전자를 많이 쓰러뜨린 도전장. 승리는 경기를 다시 계산해서 확인합니다."
 ],
 "rk0": [
  "横綱",
  "Yokozuna",
  "橫綱",
  "요코즈나"
 ],
 "rk1": [
  "大関",
  "Ozeki",
  "大關",
  "오제키"
 ],
 "rk2": [
  "関脇",
  "Sekiwake",
  "關脇",
  "세키와케"
 ],
 "rk3": [
  "小結",
  "Komusubi",
  "小結",
  "고무스비"
 ],
 "rk_mae": [
  "前頭{n}枚目",
  "Maegashira {n}",
  "前頭{n}",
  "마에가시라 {n}"
 ],
 "og_jp": [
  "日本（都道府県）",
  "Japan (prefectures)",
  "日本（都道府縣）",
  "일본 (도도부현)"
 ],
 "og_world": [
  "世界",
  "World",
  "世界",
  "세계"
 ],
 "bz_empty": [
  "まだ「{r}」の番付にのった挑戦状はありません。<br>中段に「{r}」の市町村・国を入れた挑戦状を置いて、挑戦者を倒すと番付にのります。",
  "No challenges in the \"{r}\" Rankings yet.<br>Post a challenge with a \"{r}\" place in the Middle tier and beat challengers to get listed.",
  "「{r}」的排行榜還沒有挑戰書。<br>發出中段放了「{r}」市町村・國家的挑戰書，打倒挑戰者就能上榜。",
  "아직 \"{r}\" 순위표에 오른 도전장이 없어요.<br>중단에 \"{r}\"의 지역을 넣은 도전장을 올리고 도전자를 쓰러뜨리면 순위표에 올라요."
 ],
 "bz_empty30": [
  "この30日、「{r}」で挑戦者を倒した挑戦状はまだありません。",
  "No \"{r}\" challenge has beaten a challenger in the last 30 days.",
  "這30天內，「{r}」還沒有打倒挑戰者的挑戰書。",
  "최근 30일간 \"{r}\"에서 도전자를 쓰러뜨린 도전장은 아직 없어요."
 ],
 "verifying": [
  "勝ちを確かめています… {k}/{n}",
  "Verifying wins… {k}/{n}",
  "正在確認勝場… {k}/{n}",
  "승리를 확인하는 중… {k}/{n}"
 ],
 "bz_whose": [
  "<b>{n}</b>さんの",
  "<b>{n}</b>'s",
  "<b>{n}</b>的",
  "<b>{n}</b>님의"
 ],
 "bz_30w": [
  "30日で<b>{w}勝</b>",
  "<b>{w} wins</b> in 30 days",
  "30天<b>{w}勝</b>",
  "30일간 <b>{w}승</b>"
 ],
 "bz_30wp": [
  "30日で<b>{w}勝以上</b>",
  "<b>{w}+ wins</b> in 30 days",
  "30天<b>{w}勝以上</b>",
  "30일간 <b>{w}승 이상</b>"
 ],
 "bz_total": [
  "通算{w}勝{l}敗",
  "Total {w}W {l}L",
  "累計{w}勝{l}敗",
  "통산 {w}승 {l}패"
 ],
 "checking": [
  "確認中",
  "checking",
  "確認中",
  "확인 중"
 ],
 "challenge": [
  "挑む",
  "Fight",
  "挑戰",
  "도전"
 ],
 "got_it": [
  "わかった",
  "Got it",
  "知道了",
  "알겠어"
 ],
 "h1": [
  "① <b>上段・中段・下段</b>に、市町村や国を1つずつえらぶ。中段がいちばん大きくなる。",
  "① Pick one town or country each for the <b>Top, Middle and Bottom</b> tiers. The Middle tier is the biggest.",
  "① 在<b>上段、中段、下段</b>各選一個市町村或國家。中段會是最大的。",
  "① <b>상단·중단·하단</b>에 시정촌이나 나라를 하나씩 고른다. 중단이 가장 커진다."
 ],
 "h2": [
  "② それぞれの形の<b>どこに軸をさすか</b>（●）と、<b>向き</b>（45°ずつ）を決める。",
  "② For each shape, choose <b>where the axle goes</b> (●) and its <b>angle</b> (45° steps).",
  "② 決定每個形狀<b>軸要插在哪裡</b>（●）和<b>方向</b>（每次45°）。",
  "② 각 모양의 <b>어디에 축을 꽂을지</b>(●)와 <b>방향</b>(45°씩)을 정한다."
 ],
 "h3": [
  "③ あとは全自動。<b>外にはみ出した所</b>が当たって削れていく。",
  "③ The rest is automatic. <b>Parts that stick out</b> collide and get chipped away.",
  "③ 之後全自動。<b>突出在外的部分</b>會互相撞擊並被削掉。",
  "③ 나머지는 전자동. <b>밖으로 튀어나온 부분</b>이 부딪혀 깎여 나간다."
 ],
 "h4": [
  "・形を<b>65%削られるとHPが0になって負け</b>。60秒たったらHPの多い方の勝ち。",
  "• <b>Lose 65% of your shape and your HP hits 0 — you lose</b>. After 60 seconds, whoever has more HP wins.",
  "・形狀<b>被削掉65%時HP歸0，判負</b>。60秒後HP較多的一方獲勝。",
  "・모양이 <b>65% 깎이면 HP가 0이 되어 패배</b>. 60초가 지나면 HP가 많은 쪽이 승리."
 ],
 "h5": [
  "・削れるほど軽くなって<b>速くなる</b>。重心からずれた所にさすと<b>暴れる</b>。",
  "• The more you're chipped, the lighter and <b>faster</b> you get. Put the axle off-center and it <b>wobbles wildly</b>.",
  "・越被削越輕，<b>速度越快</b>。插在偏離重心的地方會<b>亂甩</b>。",
  "・깎일수록 가벼워져 <b>빨라진다</b>. 무게중심에서 벗어난 곳에 꽂으면 <b>날뛴다</b>."
 ],
 "h6": [
  "・軸のまわりまで削れた段は<b>合併解消</b>（その段ごと外れる）。",
  "• A tier chipped down to the axle gets <b>de-merged</b> (the whole tier falls off).",
  "・被削到軸周圍的那一段會<b>解除合併</b>（整段脫落）。",
  "・축 주변까지 깎인 단은 <b>합병 해소</b>(그 단째로 빠진다)."
 ],
 "h7": [
  "・上段はとがり・強さ、中段は体力・守り、下段は速さがききやすい。",
  "• Top tier: spikiness & power. Middle: stamina & defense. Bottom: speed.",
  "・上段影響尖銳度與力量，中段影響體力與防守，下段影響速度。",
  "・상단은 뾰족함·힘, 중단은 체력·방어, 하단은 속도에 영향이 크다."
 ],
 "h8": [
  "・<b>だれかと対戦</b>・<b>あいことば対戦</b>：保存したコマから30秒以内にえらんで勝負。",
  "• <b>Play someone online</b> / <b>Passcode battle</b>: pick one of your saved tops within 30 seconds and fight.",
  "・<b>隨機對戰</b>・<b>暗號對戰</b>：在30秒內從保存的陀螺中選一個來對決。",
  "・<b>아무나와 대전</b>·<b>암호 대전</b>: 저장한 팽이 중에서 30초 안에 골라 승부."
 ],
 "h9": [
  "・<b>挑戦状</b>：試合のあとや「保存したコマ」から置ける。だれかが挑むと成績がつく。破られたら<b>仕返し</b>も。",
  "• <b>Challenges</b>: post one after a match or from \"Saved tops\". Each attempt adds to its record. If it gets beaten, take <b>revenge</b>.",
  "・<b>挑戰書</b>：可在比賽後或從「保存的陀螺」發出。有人挑戰就會記錄戰績。被打敗還能<b>報仇</b>。",
  "・<b>도전장</b>: 경기 후나 '저장한 팽이'에서 올릴 수 있다. 누군가 도전하면 전적이 쌓인다. 깨지면 <b>복수</b>도 가능."
 ],
 "h10": [
  "・<b>番付</b>：中段の県・国ごとに、この30日で挑戦者を多く倒した挑戦状が並ぶ。",
  "• <b>Rankings</b>: by the Middle tier's prefecture/country, the challenges that beat the most challengers in the last 30 days.",
  "・<b>排行榜</b>：依中段的縣・國家分類，列出這30天內打倒最多挑戰者的挑戰書。",
  "・<b>순위표</b>: 중단의 현·나라별로, 최근 30일간 도전자를 많이 쓰러뜨린 도전장이 나열된다."
 ]
};
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q && LANGS.indexOf(q) >= 0) { try { localStorage.setItem(KEY, q); } catch (e) {} return q; } } catch (e) {}
    try { var s = localStorage.getItem(KEY); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || 'ja').toLowerCase();
    if (n.indexOf('ja') === 0) return 'ja'; if (n.indexOf('ko') === 0) return 'ko'; if (n.indexOf('zh') === 0) return 'zh'; return 'en';
  }
  var L = pick();
  function t(k, v) {
    var row = D[k]; var i = LANGS.indexOf(L);
    var s = row ? (row[i] != null ? row[i] : row[0]) : k;
    if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  }
  function koFont() {
    if (L !== 'ko' || document.getElementById('ko-font')) return;
    var l = document.createElement('link'); l.id = 'ko-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap'; document.head.appendChild(l);
  }
  // 繁體中文の題字（Dela Gothic One にない字があるので、題字の4文字だけ Noto Sans TC を読む）
  function zhFont() {
    if (L !== 'zh' || document.getElementById('zh-font')) return;
    var l = document.createElement('link'); l.id = 'zh-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap&text=' + encodeURIComponent('子彈合併'); document.head.appendChild(l);
  }
  function apply() {
    koFont(); zhFont();
    var de = document.documentElement;
    de.lang = L === 'zh' ? 'zh-Hant' : L; de.setAttribute('data-lang', L);
    document.querySelectorAll('[data-i]').forEach(function (e) { e.textContent = t(e.dataset.i); });
    document.querySelectorAll('[data-ih]').forEach(function (e) { e.innerHTML = t(e.dataset.ih); });
    document.querySelectorAll('[data-ip]').forEach(function (e) { e.placeholder = t(e.dataset.ip); });
    document.querySelectorAll('[data-ia]').forEach(function (e) { e.setAttribute('aria-label', t(e.dataset.ia)); });
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === L ? 'true' : 'false'); });
    document.title = t('doc_title');
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', t('doc_desc'));
    try { document.dispatchEvent(new CustomEvent('langchange', { detail: L })); } catch (e) {}
  }
  function set(l) { if (LANGS.indexOf(l) < 0) return; L = l; try { localStorage.setItem(KEY, l); } catch (e) {} apply(); }
  function bind() {
    document.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    apply();
  }
  window.I18N = { t: t, set: set, apply: apply, get lang() { return L; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
