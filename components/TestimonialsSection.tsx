'use client';

interface Testimonial {
  rating: number;
  text: string;
  author: string;
  role: string;
  age?: string;
}

const testimonials: Testimonial[] = [
  {
    rating: 5,
    text: '玉洞子的分析太準確了！特別是對我事業發展的建議，直接改變了我的人生方向。強烈推薦所有需要命理指引的人！',
    author: '王小姐',
    role: '企業高管',
    age: '40 歲',
  },
  {
    rating: 5,
    text: '命盤分析讓我更了解自己，也更清楚地看待人際關係。報告寫得非常詳細，每一句都很有啟發。',
    author: '李先生',
    role: '企業家',
    age: '35 歲',
  },
  {
    rating: 5,
    text: '婚配分析讓我和伴侶有了新的理解。這不只是算命，而是一種了解彼此的方式。感謝！',
    author: '張女士',
    role: '教師',
    age: '38 歲',
  },
  {
    rating: 5,
    text: '很少看到這麼專業的線上命理服務。交付速度快，分析內容深入，完全超出預期。',
    author: '陳先生',
    role: '工程師',
    age: '32 歲',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section-container bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">真實用戶的聲音</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            超過 5000+ 用戶已經通過 玉洞子古學堂 的命理分析改變了他們的人生決策。
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-base space-y-4 hover:-translate-y-2 transition-transform duration-350"
            >
              {/* Star rating */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <i
                    key={i}
                    className="ri-star-fill text-xl text-brand-300"
                  ></i>
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-gray-700 leading-relaxed italic">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">
                  {testimonial.role} {testimonial.age && `• ${testimonial.age}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA below testimonials */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">
            準備改變您的人生了嗎？
          </p>
          <button className="btn-primary">
            查看更多評論
          </button>
        </div>
      </div>
    </section>
  );
}
