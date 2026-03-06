'use client';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: 'ri-focus-3-line',
    title: '精準排盤',
    description: '結合天文曆法與現代計算，提供毫秒級精準的八字、紫微斗數命盤。',
  },
  {
    icon: 'ri-file-text-line',
    title: '深度分析報告',
    description: '基於數十年的命理經驗，生成包含格局、運勢、大運流年的詳細 Word 報告。',
  },
  {
    icon: 'ri-lightbulb-flash-line',
    title: '人生智慧指引',
    description: '不只是預測，更提供可行的建議幫助您把握機遇、趨吉避凶。',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-container bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">為什麼選擇 玉洞子古學堂</h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto"></div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-base group hover:shadow-brand-lg transition-all duration-350"
            >
              {/* Icon */}
              <div className="mb-6">
                <i
                  className={`${feature.icon} text-5xl text-brand-300 group-hover:scale-110 transition-transform duration-350`}
                ></i>
              </div>

              {/* Content */}
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Accent bar */}
              <div className="mt-6 pt-6 border-t-2 border-brand-300/20 group-hover:border-brand-300/50 transition-colors">
                <span className="text-brand-600 font-semibold text-sm">
                  了解更多 →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
