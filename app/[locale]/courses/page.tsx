'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

// Course data from PPT slides
const BAZI_LESSONS = [
  {
    id: 1,
    title: '八字命理第一課',
    subtitle: '基礎入門精講',
    topics: ['天干地支', '五行生剋', '十神・大運起法'],
    content: [
      {
        heading: '一、天干地支基礎',
        points: [
          '十天干：甲乙丙丁戊己庚辛壬癸，陽干（甲丙戊庚壬）剛強主動，陰干（乙丁己辛癸）柔和被動',
          '天干五行記法：甲乙木・丙丁火・戊己土・庚辛金・壬癸水',
          '十二地支：子丑寅卯辰巳午未申酉戌亥，各有五行屬性與生肖',
        ],
      },
      {
        heading: '二、四柱排盤方法',
        points: [
          '年柱（祖業環境）以立春換年；月柱（父母事業）以節令換月',
          '日柱天干為命主本人（日主）；時柱代表子女與晚運',
          '五虎遁月歌訣：甲己丙作首、乙庚戊為頭、丙辛庚起、丁壬壬位、戊癸甲寅起',
          '五鼠遁時口訣：甲己還加甲、乙庚丙作初、丙辛戊子起、丁壬庚子居、戊癸壬子起',
        ],
      },
      {
        heading: '三、五行生剋制化',
        points: [
          '相生：木生火・火生土・土生金・金生水・水生木',
          '相剋：金剋木・木剋土・土剋水・水剋火・火剋金',
        ],
      },
      {
        heading: '四、地支藏干（務必熟記）',
        points: [
          '子藏癸；丑藏己辛癸；寅藏甲丙戊；卯藏乙',
          '辰藏乙癸戊；巳藏丙戊庚；午藏丁己；未藏乙己丁',
          '申藏庚壬戊；酉藏辛；戌藏辛丁戊；亥藏壬甲',
          '藏干是推算十神、格局的根本依據',
        ],
      },
      {
        heading: '五、十神定義',
        points: [
          '判斷口訣：以日干為「我」——生我者為印，我生者為食傷，克我者為官殺，我克者為財，同我者為比劫',
          '同性為偏（偏印、偏財、七殺、食神、比肩），異性為正（正印、正財、正官、傷官、劫財）',
        ],
      },
      {
        heading: '六、大運起法',
        points: [
          '陽男陰女順行，陰男陽女逆行',
          '計算起運：三天折一歲；精確交運：每日=120天，每時=10天',
          '範例：陽男從月建順推，數至最近未來節，天數÷3=起運歲數',
        ],
      },
    ],
  },
  {
    id: 2,
    title: '八字命理第二課',
    subtitle: '天干精論・五行強弱・十神精義',
    topics: ['十天干長生表', '地支六情', '身強身弱・傷官・七殺'],
    content: [
      {
        heading: '一、十天干長生衰死表',
        points: [
          '甲（陽木）：長生亥，帝旺卯，墓未，絕申；甲己合化土',
          '乙（陰木）：長生午，帝旺寅，墓戌，絕酉；乙庚合化金',
          '丙/戊（陽火/土）：長生寅，帝旺午，墓戌，絕亥；丙辛合化水',
          '丁/己（陰火/土）：長生酉，帝旺巳，墓丑，絕子；丁壬合化木',
          '庚（陽金）：長生巳，帝旺酉，墓丑，絕寅；戊癸合化火',
          '壬（陽水）：長生申，帝旺子，墓辰，絕巳；癸（陰水）長生卯，帝旺亥',
        ],
      },
      {
        heading: '二、地支六情——合・刑・沖・害・三合・方合',
        points: [
          '六合：子丑合土、寅亥合木、卯戌合火、辰酉合金、巳申合水、午未合土',
          '三合局：申子辰水局、寅午戌火局、亥卯未木局、巳酉丑金局',
          '方合：寅卯辰東方木、巳午未南方火、申酉戌西方金、亥子丑北方水',
          '六沖：子午沖、丑未沖、寅申沖、卯酉沖、辰戌沖、巳亥沖',
          '六害：子未、丑午、寅巳、卯辰、申亥、酉戌',
          '三刑：寅巳申無恩刑、丑戌未持勢刑、子卯無禮刑；辰辰午午酉酉亥亥自刑',
        ],
      },
      {
        heading: '三、五行六類強弱喜忌',
        points: [
          '強：喜泄（食傷）、剋（官殺）、分力（財）；忌再生助',
          '弱：喜生（印）、幫（比劫）；忌剋泄財',
          '六類：強・弱・埋（土多）・沉（水多）・缺（木多）・熔（火多），各有救法',
          '口訣：身強喜抑，身弱喜扶——一切用神取捨，皆從此二字出發',
        ],
      },
      {
        heading: '四、身強身弱判斷三要素',
        points: [
          '月令旺相（如甲木生春冬為旺，生夏秋為弱）',
          '多幫扶（印綬比劫多）或多克泄（財官食傷多）',
          '地支得氣（臨官帝旺）或失氣（病死絕）',
        ],
      },
      {
        heading: '五、傷官精義',
        points: [
          '定義：我所生，且與我異性者（甲陽見丁陰，木生火，陰陽異→丁為甲之傷官）',
          '四大能力：泄身・生財・敵殺・損官',
          '「傷官見官，禍患百端」——最忌正官入局',
          '喜：身強財多，或殺重比劫食傷助；忌：身弱見財，或殺淺財助殺',
        ],
      },
      {
        heading: '六、七殺（偏官）精義',
        points: [
          '定義：克我且與我同性者（甲陽見庚陽，金克木，陽陽同→庚為甲之七殺）',
          '「有制謂之偏官，無制謂之七殺」——制化得宜成大富貴',
          '制化要訣：殺重喜食神制・傷官制殺；殺輕不宜再制；身弱見殺喜印化（殺印相生）',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '八字命理第三課',
    subtitle: '正官・食神・印財・比劫・格局總論',
    topics: ['六神精義完整', '八格取法', '格局成敗用神'],
    content: [
      {
        heading: '一、正官精義',
        points: [
          '定義：克我而與我異性者。正官為六格正氣，忠信之名，最忌損破',
          '四能力：引財・生印・拘身・制劫，利弊皆隨日主強弱而定',
          '喜：財旺以生官，印綬護官；忌：傷官見官，刑沖破害',
        ],
      },
      {
        heading: '二、食神精義（爵星壽星）',
        points: [
          '定義：我所生且與我同性者。又名爵星（子旺生財）・壽星（制伏七殺使壽元長）',
          '四能力：泄身・生財・制殺・損官',
          '「食神制殺」為最美配合；最忌梟神（偏印）奪食',
          '食神 vs 傷官：食神性溫和制殺，見梟印被奪；傷官性剛烈，見官必傷，見印受制',
        ],
      },
      {
        heading: '三、偏正印精義',
        points: [
          '生我同性為偏印（梟神）；生我異性為正印。印綬為我氣之源，能護官星',
          '四能力：生身・泄官殺・禦傷・挫食',
          '核心口訣：官印相生最美；殺印相生次之；最忌「財克印」（貪財壞印）',
        ],
      },
      {
        heading: '四、偏正財精義',
        points: [
          '我克同性為偏財（意外財・父）；我克異性為正財（妻財・穩定收入）',
          '衡命論財：首須身強，方堪任財。身弱財旺→如衰人雖有財，不堪享用',
          '四能力：生官殺・泄傷食・制梟・壞印',
          '核心口訣：財能生官殺；身弱最忌財重（財多身弱）',
        ],
      },
      {
        heading: '五、比劫祿刃',
        points: [
          '比肩同類同性，劫財同類異性；祿=日干臨官之地，刃=帝旺之地',
          '四能力：幫身・任官殺・代泄・制財',
          '刃剛烈暴戾宜有官殺制之；祿溫柔和暢，身弱得祿為美',
        ],
      },
      {
        heading: '六、八格取法精要',
        points: [
          '八格：正財・偏財・正官・七殺・正印・偏印・食神・傷官格',
          '取格步驟：①月支本氣透干先取；②本氣未透則取藏干透者；③兩神並透取有力且無克合者',
          '比劫不能取格；建祿・羊刃非在八格之內',
          '用神取法三步：①取格（月支藏干）→②論身強弱→③定用神（身強取洩克・身弱取生扶）',
        ],
      },
      {
        heading: '七、格局成敗總論',
        points: [
          '成格五條件：格神有力・日主適配・配合流通・格局清純・用神得地',
          '破格五原因：格神被合・格神被克・日主失配・喜忌混雜・根氣無依',
        ],
      },
    ],
  },
  {
    id: 4,
    title: '八字命理第四課',
    subtitle: '外格精論・行運理法・命局善惡斷',
    topics: ['五行專旺・從格・化氣格', '建祿月刃', '大運善惡斷法'],
    content: [
      {
        heading: '一、外格總論',
        points: [
          '凡越出八格常理者另立外格，名目繁多，但皆秉一氣之旺而成',
          '四類：五行專旺格・從格（棄命從神）・化氣格・月令特殊格（建祿・月刃）',
        ],
      },
      {
        heading: '二、五行專旺格',
        points: [
          '曲直格（甲乙日・春月・地支全寅卯辰或亥卯未）：以木為用，忌金克',
          '炎上格（丙丁日・夏月・地支全巳午未或寅午戌）：以火為用，忌水克',
          '稼穡格（戊己日・四季月・地支全辰戌丑未）：以土為用，忌木克',
          '從革格（庚辛日・秋月・地支全申酉戌或巳酉丑）：以金為用，忌火克',
          '潤下格（壬癸日・冬月・地支全亥子丑或申子辰）：以水為用，忌土克',
          '成格關鍵：日干同五行月令當旺 + 地支成方或三合局 + 無克神',
        ],
      },
      {
        heading: '三、從格六式',
        points: [
          '從財格：日主衰弱，財月當令，無生旺之氣，以財為用；喜傷食生財，忌比劫印救身',
          '從殺格：日主衰弱，殺官旺多，無印滋身，以殺（官）為用；喜財旺生殺，忌印泄殺',
          '從兒格：傷食當旺，無印生身，以傷食為用；喜財（兒生兒），忌官殺・印克制',
          '從旺格：四柱皆比劫，無官殺制，以比劫為用；最忌官殺犯旺',
          '從強格：印重比劫多，無財官之氣，印比並用；忌食傷財官觸怒強神',
          '從格鐵律：一旦從之，逆則必凶',
        ],
      },
      {
        heading: '四、化氣格精解',
        points: [
          '五合：甲己化土・乙庚化金・丙辛化水・丁壬化木・戊癸化火',
          '成格三要件：①日干與時干（或月干）緊貼合化 ②月令得化神 ③無忌字破化',
          '破敗三式：因克而破・因妒而破（兩相同干爭合）・因化而破',
          '救解：合絆忌字・克去忌字・生助化神',
        ],
      },
      {
        heading: '五、建祿格・月刃格',
        points: [
          '建祿格（月支為日干臨官）：甲寅・乙卯・丙戊巳・丁己午・庚申・辛酉・壬亥・癸子',
          '建祿格用神：財多身弱→比劫；官殺多身強→財；印多→財；比劫多→官殺',
          '月刃格（月支為帝旺）：甲卯・庚酉・壬子月，性剛烈，用神取財或官殺',
        ],
      },
      {
        heading: '六、大運行運理法與善惡斷',
        points: [
          '行運四式：八字純善行善運→善者益善；八字純惡行惡運→惡者愈惡',
          '行運原則：順用神則善，逆用神則惡。大運力強管十年，流年力弱管一年',
          '大運定方向，流年定時點；前五年天干占七分，後五年地支占七分（折衷法）',
          '各格善惡運：正官格日弱財重→喜印比運，忌財官鄉；七殺格日強→喜財殺運',
        ],
      },
    ],
  },
  {
    id: 5,
    title: '八字命理第五課',
    subtitle: '運限總綱・流年應期・六親・富貴吉壽',
    topics: ['行運雜綴口訣', '流年十二法', '六親・富貴吉壽'],
    content: [
      {
        heading: '一、行運雜綴精義——傷官・七殺運口訣',
        points: [
          '傷官多者宜印運；傷官見官（官星入局）→行官旺鄉禍不堪',
          '傷官帶印不宜財運（財克印）；傷官用財→行財得地發福',
          '七殺太重行食神制殺運吉；殺強身弱有印→最忌財運；制殺太過→行財運醒殺',
        ],
      },
      {
        heading: '二、正官・財・印・比劫運口訣',
        points: [
          '正官格：最大忌傷官之地，更忌刑沖破害之運；行殺運→殺來混官（最忌）',
          '財多身弱→畏入財鄉，身旺運以為榮；身旺財衰→財旺鄉而發福',
          '印綬：食神多宜行印運；身弱有印逢殺運何妨（殺印相生）；貪財壞印喜比劫運',
          '比劫：多劫遇劫運→守窮途；財多身弱遇劫為福；財弱身旺見劫為禍',
        ],
      },
      {
        heading: '三、流年應期斷法——十二種交互關係',
        points: [
          '流年善＋大運善→更妙（雙喜）；流年惡＋大運惡→更惡（禍上加禍）',
          '流年善＋大運惡→善惡互見（拉鋸）；流年惡＋大運善→善惡互見（緩衝）',
          '流年善但被局中克合，大運來解→仍佳；大運生助克合之神→凶多吉少',
          '干支細論：流年干支皆利→大吉；皆不利→大凶；干利支不利→吉凶參半',
        ],
      },
      {
        heading: '四、月建看法與時令五行',
        points: [
          '月干重於月支（干流動，支固定）；月建與流年互動同流年與大運之十二法',
          '春令木旺→甲乙月木更盛，庚辛月金被木挫；夏令火旺→壬癸水為火灼無力',
          '秋令金旺→甲乙木被金克；冬令水旺→丙丁火被水克；四立前18天土旺',
        ],
      },
      {
        heading: '五、六親判斷——妻夫父母子女兄弟',
        points: [
          '六親定位：父母=印星・夫=官殺・妻=財星・兄弟=比劫・子女=食傷',
          '妻星（財）：用神即是財→妻美富貴；財旺身強→多妻妾；日支被沖→妻室喪亡',
          '夫星（官殺）：比劫旺而無官→必克夫；印旺無財→必克夫；日支為官逢沖→夫難偕老',
          '子女（食傷）：日主旺無印有食傷→子必多；火炎土燥・水泛木浮→無子',
          '父母（印星）：印不遭沖克→父母俱全；印衰多財→父母早喪',
          '兄弟（比劫）：比劫為用神→尤得兄弟之力；比劫破壞用神→兄弟多累',
        ],
      },
      {
        heading: '六、富貴吉壽四綱',
        points: [
          '富：財星生官・官星衛財；身旺財旺有傷食或官殺；用神為財且不遭克破',
          '貴：官旺身旺・印綬衛官；用正官無偏官混雜；官印相生為上',
          '吉：標本平均・用神安頓；一生少險惡風波，穩就永之妙',
          '壽：印綬有力無財傷；無刑沖克害；行運順利不逆（運與命配合）',
          '女命：夫子自身三者兼顧最妙；夫星（官殺）切不可受挫，次顧子星',
        ],
      },
    ],
  },
  {
    id: 6,
    title: '八字命理第六課',
    subtitle: '論斷篇・貧賤凶夭・補充精華・評斷實戰',
    topics: ['貧賤凶夭四綱', '論命八步驟', '命例實戰解析'],
    content: [
      {
        heading: '一、貧賤凶夭四綱',
        points: [
          '貧：財輕官重・喜印而財壞印・喜財而財神被合・財為忌神・用財被沖破',
          '賤：官輕印重而身旺・官印兩平日主休囚・官殺重無印食傷強制',
          '賤之意：操行卑鄙思想齷齪（非階級），偽君子假小人最難辨',
          '凶：財旺身弱無劫印・殺重身輕無傷食印・滿局比劫無官殺・外格既成而又破',
          '夭：忌神用神雜而戰・喜沖而不沖・忌合而反合・日主失令用神淺薄忌神深重',
          '夭之本質：命局矛盾對立，用忌交戰，最忌喜而不喜、忌而反來',
        ],
      },
      {
        heading: '二、補充篇——干克・干合・支沖精義',
        points: [
          '干克：兩干相克→兩敗俱傷；克喜神→凶，克忌神→反解凶；年月緊貼克力最重',
          '干合：喜神被合→凶；忌神被合→反解凶；兩干緊貼合力最重；妒合（二女一夫）→情不專',
          '支沖：以本氣判勝敗；得令者勝；多寡決定勝負；寅申巳亥沖→兩敗俱傷',
          '辰戌丑未沖→同類土，衝動而已，土反愈旺；年時相沖（海底沖）→地位遠隔，無沖意',
        ],
      },
      {
        heading: '三、官殺並見去留法與初學捷徑',
        points: [
          '只有食神→去殺留官；只有傷官→去官留殺；食傷並見→官殺皆可去淨',
          '初學捷徑：用之官星不可傷，不用官星盡可傷；用之財官不可劫，不用財星盡可劫',
          '用之印綬不可壞，不用印綬盡可壞；用之食神不可奪，不用食神盡可奪',
          '五行顛倒：木多火熾→用金制木可生火；水多木浮→用土克水可生木',
        ],
      },
      {
        heading: '四、論命八步驟',
        points: [
          '①看強弱（日干・多寡・失時得令）→②定格局（月支為標準）→③取用神（助強扶弱）',
          '④論喜忌（利用神為喜，克用神為忌）→⑤查歲運（順喜忌則吉，逆喜忌則凶）',
          '⑥推六親（印=父母・官殺=夫・財=妻・食傷=子）→⑦評性情（木仁火禮金義水智土信）',
          '⑧斷事業：官印相生→行政政治；財官並美→財政金融；傷官傷盡・殺印相生→武備',
        ],
      },
      {
        heading: '五、命例實戰精義',
        points: [
          '陸姓乾命（正官格用印）：丙日弱，取月上甲木印為用，喜木火，最忌金（生水克木）',
          '潘姓坤命（傷官格）：庚日弱，水氾濫，取亥中甲木財為用，最忌金水',
          '詹姓乾命：三土二金財殺太旺，子辰成水局印化殺→由弱轉強，取子印為用，殺印相映登峰',
          '學命總綱：先通五行格局，次諳用神喜忌，再熟行運流年，終達論命如鏡',
        ],
      },
      {
        heading: '六、神煞補充與學術立場',
        points: [
          '天月德：日干值天德月德→命吉增吉，命凶減凶；忌遭克',
          '驛馬：吉神逢馬→超遷之喜；凶神逢馬→奔蹶之患；逢沖加鞭，逢合系足',
          '學術立場：《千里命稿》以五行格局用神為推命正宗，神煞僅作輔助參考',
          '正確次序：先通五行十神格局用神，再參考神煞作微調，切勿本末倒置',
        ],
      },
    ],
  },
];

function PdfViewer({ lessonId, token, isFree }: { lessonId: number; token: string | null; isFree: boolean }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setBlobUrl(null);

    const headers: HeadersInit = {};
    if (!isFree && token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/course-pdf/${lessonId}`, { headers })
      .then(r => {
        if (!r.ok) throw new Error();
        return r.blob();
      })
      .then(blob => {
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
        const url = URL.createObjectURL(blob);
        prevBlobUrl.current = url;
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });

    return () => {
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, [lessonId, token, isFree]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-950">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-amber-300 text-sm">載入課程簡報中...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center py-12 bg-gray-950">
        <p className="text-gray-400 text-sm">載入失敗，請重新整理頁面</p>
      </div>
    );
  }
  return (
    <div className="bg-black">
      <iframe
        src={`${blobUrl}#toolbar=0&navpanes=0`}
        className="w-full border-0"
        style={{ height: 'min(75vh, 720px)' }}
        title={`第${lessonId}課課程簡報`}
      />
    </div>
  );
}

export default function CoursesPage() {
  const t = useTranslations('Courses');
  const { token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }
    Promise.all([
      fetch(`${API_URL}/Subscription/status`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/Auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null),
    ])
      .then(([subData, profileData]) => {
        setIsSubscribed(!!subData?.isSubscribed);
        setIsAdmin(profileData?.isAdmin === true);
      })
      .catch(() => {})
      .finally(() => setLoadingAuth(false));
  }, [token]);

  const toggleLesson = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-300 text-sm font-medium mb-3 tracking-widest uppercase">
            {t('seriesBazi')} &nbsp;·&nbsp; {t('seriesLessonsCount')}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-amber-100 text-lg max-w-xl mx-auto">{t('heroDesc')}</p>
        </div>
      </section>

      {/* Course list */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="space-y-4">
          {BAZI_LESSONS.map(lesson => {
            const isOpen = expandedId === lesson.id;
            // Lesson 1 is free; lessons 2+ require subscription or admin
            const isFree = lesson.id === 1;
            const canAccess = isFree || isSubscribed || isAdmin;
            return (
              <div
                key={lesson.id}
                className="border border-amber-200 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Card header - always visible */}
                <button
                  className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-amber-50 transition-colors"
                  onClick={() => toggleLesson(lesson.id)}
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    {lesson.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base">{lesson.title}</p>
                    <p className="text-amber-700 text-sm">{lesson.subtitle}</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1 flex-shrink-0 max-w-xs">
                    {lesson.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  {!isFree && !isAdmin && !isSubscribed && !loadingAuth && (
                    <i className="ri-lock-2-line text-amber-400 text-lg flex-shrink-0" />
                  )}
                  <i
                    className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-amber-500 text-xl flex-shrink-0 ml-2`}
                  />
                </button>

                {/* Mobile topics */}
                <div className="sm:hidden flex flex-wrap gap-1 px-6 pb-3">
                  {lesson.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t border-amber-100">
                    {loadingAuth ? (
                      <div className="px-6 py-8 flex justify-center">
                        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : !canAccess ? (
                      // Lock overlay for non-subscribers (lesson 2+)
                      <div className="px-6 py-10 text-center bg-amber-50">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                          <i className="ri-lock-2-line text-amber-500 text-2xl" />
                        </div>
                        <p className="font-bold text-gray-800 mb-1">{t('lockedTitle')}</p>
                        <p className="text-gray-500 text-sm mb-5">{t('lockedDesc')}</p>
                        <Link href="/subscribe">
                          <button className="bg-amber-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-amber-700 transition-colors text-sm">
                            {t('subscribeCta')}
                          </button>
                        </Link>
                      </div>
                    ) : lesson.content ? (
                      <PdfViewer lessonId={lesson.id} token={token} isFree={isFree} />
                    ) : (
                      // Content not ready yet
                      <div className="px-6 py-8 text-center bg-gray-50">
                        <i className="ri-time-line text-gray-400 text-3xl mb-2 block" />
                        <p className="font-semibold text-gray-600 mb-1">{t('comingSoonLabel')}</p>
                        <p className="text-gray-400 text-sm">{t('comingSoonDesc')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Non-subscriber CTA banner */}
        {!loadingAuth && !isSubscribed && !isAdmin && (
          <div className="mt-10 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-2xl p-8 text-center">
            <p className="text-lg font-bold mb-2">{t('lockedTitle')}</p>
            <p className="text-amber-100 text-sm mb-5">{t('lockedDesc')}</p>
            <Link href="/subscribe">
              <button className="bg-white text-amber-700 font-bold px-8 py-3 rounded-full hover:bg-amber-50 transition-colors">
                {t('subscribeCta')}
              </button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
