'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '命盤分析需要多少時間？',
    answer:
      '基礎命盤通常在 1-2 小時內完成。進階深度分析會在 1 小時內交付。VIP 用戶享受優先處理，承諾 30 分鐘內交付。',
  },
  {
    question: '如何支付？安全嗎？',
    answer:
      '我們採用銀行轉帳方式，這是最安全的支付方式。我們不會儲存任何銀行敏感信息，對帳採用發票號匹配，完全透明。',
  },
  {
    question: '報告可以保存多久？',
    answer:
      '永遠。下載後您的報告屬於您，可以隨時查看、列印或分享。我們也會在您的會員帳戶中永久保存一份副本。',
  },
  {
    question: '如果我不相信命理，可以怎樣？',
    answer:
      '沒問題！我們提供 7 天退款保證。如果您對服務不滿意，可以無條件退款。我們要求的是您給我們一個機會。',
  },
  {
    question: '可以為他人購買嗎（例如作為禮物）？',
    answer:
      '當然可以！在購買時輸入收禮人的生日和基本信息即可。我們會為他們生成個人化的命盤和報告。',
  },
  {
    question: '命盤分析的準確率是多少？',
    answer:
      '基於用戶反饋，我們的分析準確率達到 95% 以上。但命理不是 100% 的命運預測，而是提供人生指引和決策參考。準確性因人而異。',
  },
  {
    question: '有免費試用嗎？',
    answer:
      '有！我們提供完整命盤的簡化版本，免費展示給您。這樣您可以先體驗服務品質，再決定是否購買完整版本。',
  },
  {
    question: '我購買的報告會被分享嗎？',
    answer:
      '絕對不會。您的命盤和分析報告完全私密，只有您能訪問。我們尊重您的隱私，符合所有數據保護規範。',
  },
];

export default function FAQSection() {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  return (
    <section className="section-container bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="section-title">常見問題</h2>
          <p className="text-gray-600 mt-4">
            有疑問？這裡有您需要知道的一切答案。
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-brand overflow-hidden bg-white hover:shadow-lg transition-shadow duration-250"
            >
              {/* Question button */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === index ? null : index)
                }
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <i
                  className={`ri-arrow-down-s-line text-brand-300 text-xl transition-transform duration-350 flex-shrink-0 ${
                    expandedId === index ? 'rotate-180' : ''
                  }`}
                ></i>
              </button>

              {/* Answer */}
              {expandedId === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 p-8 bg-brand-50 rounded-brand border border-brand-200 text-center">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-3">
            還有其他問題？
          </h3>
          <p className="text-gray-700 mb-6">
            歡迎聯繫 玉洞子古學堂 客服團隊，我們很樂意幫助您。
          </p>
          <button className="btn-primary">
            聯繫客服
          </button>
        </div>
      </div>
    </section>
  );
}
