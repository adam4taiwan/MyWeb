declare module 'lunar-javascript' {
  class LunarTime {
    getZhiIndex(): number;
    getGanZhi(): string;
    getTianShen(): string;
    getTianShenType(): string;
    getTianShenLuck(): string;
    getYi(): string[];
    getJi(): string[];
    getChongDesc(): string;
    getSha(): string;
  }

  class Lunar {
    getYear(): number;
    getMonth(): number;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getJieQi(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayPositionXiDesc(): string;
    getDayPositionCaiDesc(): string;
    getDayPositionFuDesc(): string;
    getDayPositionYangGuiDesc(): string;
    getDayPositionYinGuiDesc(): string;
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayTianShen(): string;
    getDayTianShenLuck(): string;
    getDayTianShenType(): string;
    getTimes(): LunarTime[];
  }

  class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
  }

  export { Solar, Lunar, LunarTime };
}
