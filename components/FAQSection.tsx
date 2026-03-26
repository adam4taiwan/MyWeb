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
      '系統採用 AI 即時運算，送出資料後數秒內即可取得完整命書報告，無需等待。',
  },
  {
    question: '如何支付？',
    answer:
      '目前採用 ECPay 信用卡線上付款，交易安全由綠界科技處理，我們不儲存任何信用卡資訊。',
  },
  {
    question: '報告可以保存多久？',
    answer:
      '下載後永久屬於您，可隨時查看、列印或分享。請於取得報告後自行下載保存，系統不提供帳戶內備份查詢。',
  },
  {
    question: '購買前需要注意什麼？',
    answer:
      '本服務為數位命理報告，一經生成即無法退款，請確認了解服務內容後再下單。如有任何疑問，歡迎先透過線上諮詢聯繫我們。',
  },
  {
    question: '命盤分析的準確率是多少？',
    answer:
      '基於用戶反饋，我們的分析準確率達到 95% 以上。命理提供的是人生指引與決策參考，而非百分之百的命運預測，準確性因人而異。',
  },
  {
    question: '如何了解服務內容？',
    answer:
      '歡迎先透過線上諮詢與我們聯繫，詳細說明您的需求，由玉洞子為您說明適合的方案後再下單。',
  },
  {
    question: '我的資料會被分享嗎？',
    answer:
      '絕對不會。您的生辰資料與命書報告完全私密，僅供您本人使用，我們嚴格保護用戶隱私。',
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
