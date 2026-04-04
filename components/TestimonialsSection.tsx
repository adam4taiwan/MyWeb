'use client';
import Link from 'next/link';

const benefits = [
  {
    icon: '事',
    title: '事業與天賦',
    question: '我適合哪個行業？幾歲是事業轉折？',
    insight: '命書從先天格局判斷你的才能方向，點出事業高峰與轉換時機，讓每一步決策都有所依據。',
  },
  {
    icon: '姻',
    title: '姻緣與婚姻',
    question: '感情何時出現？婚姻潛在課題是什麼？',
    insight: '透過八字與紫微交叉驗證，論斷感情時機、婚配特質，以及需要經營的方向，而非泛泛吉凶。',
  },
  {
    icon: '財',
    title: '財富與時機',
    question: '我的財運屬於哪一類？何時宜投資、守成？',
    insight: '分辨本命財與運財的差異，指出財運起伏的流年節點，幫助你在對的時間做對的財務決策。',
  },
  {
    icon: '運',
    title: '流年與決策',
    question: '今年適合換工作嗎？重大決定的最佳時機？',
    insight: '流年命書逐月分析，讓你提前掌握每個月的能量走向，在最有利的時間點採取行動。',
  },
];

const books = [
  {
    name: '綜合命書',
    tag: '入門首選',
    tagColor: 'bg-amber-100 text-amber-700',
    desc: '八字紫微全面鑑定',
    points: [
      '先天格局與一生主軸',
      '個性特質與才能方向',
      '事業、感情、財運總覽',
      '當前大運走勢解讀',
    ],
    href: '/disk',
    border: 'border-amber-200',
  },
  {
    name: '八字命書',
    tag: '最深入',
    tagColor: 'bg-blue-100 text-blue-700',
    desc: '12 章科學化一生剖析',
    points: [
      '用神忌神完整分析',
      '六親宮位（父母/夫妻/子女）',
      '職業財運健康詳論',
      '大運逐期吉凶斷事',
    ],
    href: '/disk',
    border: 'border-blue-200',
  },
  {
    name: '大運命書',
    tag: '中長期規劃',
    tagColor: 'bg-green-100 text-green-700',
    desc: '5年逐年吉凶推演',
    points: [
      '八字×紫微交叉驗證',
      '逐年大吉/大凶/平判定',
      '每年重點事項與建議',
      '五年整體趨勢鳥瞰',
    ],
    href: '/disk',
    border: 'border-green-200',
  },
  {
    name: '流年命書',
    tag: '年度必備',
    tagColor: 'bg-purple-100 text-purple-700',
    desc: '五術合一年度全方位',
    points: [
      '八字・太歲・生肖・流星・紫微',
      '春夏秋冬四季重點',
      '逐月吉凶與宜忌分析',
      '趨吉避凶具體建議',
    ],
    href: '/disk',
    border: 'border-purple-200',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-container bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Part 1: 命書能為您照亮的方向 */}
        <div className="text-center mb-12">
          <h2 className="section-title">命書為您照亮的人生方向</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            每一份命書，都是對自己生命的一次深度認識。以下是命書最常為人解答的四個核心課題。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {benefits.map((b, i) => (
            <div key={i} className="card-base space-y-3 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{b.title}</p>
                  <p className="text-xs text-amber-600 mt-0.5">{b.question}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{b.insight}</p>
            </div>
          ))}
        </div>

        {/* Part 2: 四種命書介紹 */}
        <div className="text-center mb-12">
          <h2 className="section-title">選擇適合您的命書</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            四種命書各有側重，依您的需求選擇最合適的深度分析。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.map((book, i) => (
            <div key={i} className={`rounded-2xl border-2 ${book.border} bg-white p-5 flex flex-col hover:-translate-y-1 transition-transform duration-300`}>
              <div className="mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${book.tagColor}`}>{book.tag}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{book.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{book.desc}</p>
              <ul className="space-y-2 flex-grow">
                {book.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">·</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <Link href={book.href} className="mt-5 block text-center text-xs font-bold text-amber-700 border border-amber-300 rounded-xl py-2 hover:bg-amber-50 transition-colors">
                了解更多
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-gray-600 mb-6">準備好深入了解自己的命盤了嗎？</p>
          <Link href="/disk" className="btn-primary">
            立即啟動命書
          </Link>
        </div>

      </div>
    </section>
  );
}
