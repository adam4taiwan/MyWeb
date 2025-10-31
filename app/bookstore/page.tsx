'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BookCategories from './BookCategories';
import SearchSection from './SearchSection';
import ContactInfo from './ContactInfo';
import CharityService from './CharityService';

export default function BookstorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{
          //backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://readdy.ai/api/search-image?query=traditional%20chinese%20bookstore%20with%20antique%20books%20stacked%20on%20wooden%20shelves%20ancient%20scrolls%20and%20calligraphy%20manuscripts%20warm%20amber%20lighting%20vintage%20atmosphere%20scholarly%20environment%20with%20traditional%20chinese%20elements&width=1920&height=800&seq=bookstore-hero&orientation=landscape')`
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/image/bookstore-hero.jpg')`  
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              姜軍府老書店
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              專營古文化典籍、藝術書法二手書收藏，傳承中華文化瑰寶
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://tw.bid.yahoo.com/search/ac?p=姜軍府" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:scale-105"
              >
                前往奇摩拍賣
              </a>
              <a 
                href="https://www.ruten.com.tw/find/?q=姜軍府" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer transform hover:scale-105"
              >
                前往露天拍賣
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <SearchSection />

      {/* Contact Info */}
      <ContactInfo />

      {/* Book Categories */}
      <BookCategories />

      {/* Charity Service */}
      <CharityService />

      {/* Google Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              書店位置
            </h2>
            <p className="text-xl text-gray-600">
              歡迎親臨書店挑選珍藏古籍
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 md:h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.8234567890123!2d121.5234567!3d25.0234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDAzJzI4LjciTiAxMjHCsDMxJzI0LjQiRQ!5e0!3m2!1szh-TW!2stw!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="姜軍府老書店位置"
                />
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="ri-map-pin-line text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">地址</div>
                      <div className="text-gray-600">台北市農安街125巷6號1樓</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="ri-phone-line text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">聯絡電話</div>
                      <div className="text-gray-600">(02)25851238</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="ri-time-line text-white"></i>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">營業時間</div>
                      <div className="text-gray-600">週一至週日 10:00-20:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}