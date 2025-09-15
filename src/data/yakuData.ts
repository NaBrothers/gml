// 日本麻将役种数据结构和完整列表

export interface Yaku {
  id: string;
  name: string;
  nameJp: string;
  han: number;
  category: YakuCategory;
  description: string;
  conditions: string[];
  examples?: string[];
  isYakuman?: boolean;
  menzen?: boolean; // 是否需要门前清
}

export enum YakuCategory {
  ONE_HAN = '一番',
  TWO_HAN = '二番', 
  THREE_HAN = '三番',
  SIX_HAN = '六番',
  MANGAN = '满贯',
  YAKUMAN = '役满',
  DOUBLE_YAKUMAN = '双倍役满'
}

export const yakuList: Yaku[] = [
  // 一番役
  {
    id: 'riichi',
    name: '立直',
    nameJp: 'リーチ',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '门前清状态下宣告立直后和牌',
    conditions: ['门前清', '听牌时宣告立直', '立直后和牌'],
    examples: ['任何门前清听牌状态'],
    menzen: true
  },
  {
    id: 'tanyao',
    name: '断幺九',
    nameJp: 'タンヤオ',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '和牌时手牌全部由2-8的数牌组成',
    conditions: ['不含1、9的数牌', '不含字牌', '可以副露'],
    examples: ['22334455667788万']
  },
  {
    id: 'pinfu',
    name: '平和',
    nameJp: 'ピンフ',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '门前清，4组顺子+1组非役牌对子，两面听牌',
    conditions: ['门前清', '4组顺子', '非役牌对子', '两面听牌'],
    examples: ['123456789万11筒23索'],
    menzen: true
  },
  {
    id: 'iipeikou',
    name: '一盃口',
    nameJp: 'イーペーコー',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '门前清，同一花色的两组相同顺子',
    conditions: ['门前清', '同花色两组相同顺子'],
    examples: ['112233万456筒789索11字'],
    menzen: true
  },
  {
    id: 'menzen_tsumo',
    name: '门前清自摸和',
    nameJp: 'ツモ',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '门前清状态下自摸和牌',
    conditions: ['门前清', '自摸和牌'],
    examples: ['任何门前清自摸和牌'],
    menzen: true
  },
  {
    id: 'yakuhai_haku',
    name: '役牌·白',
    nameJp: '役牌·白',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '白板的刻子或杠子',
    conditions: ['包含白板的刻子或杠子'],
    examples: ['白白白 + 其他面子']
  },
  {
    id: 'yakuhai_hatsu',
    name: '役牌·发',
    nameJp: '役牌·發',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '发财的刻子或杠子',
    conditions: ['包含发财的刻子或杠子'],
    examples: ['发发发 + 其他面子']
  },
  {
    id: 'yakuhai_chun',
    name: '役牌·中',
    nameJp: '役牌·中',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '红中的刻子或杠子',
    conditions: ['包含红中的刻子或杠子'],
    examples: ['中中中 + 其他面子']
  },
  {
    id: 'yakuhai_ton',
    name: '役牌·东',
    nameJp: '役牌·東',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '场风或自风为东时，东风的刻子或杠子',
    conditions: ['场风或自风为东', '包含东风的刻子或杠子'],
    examples: ['东东东 + 其他面子']
  },
  {
    id: 'yakuhai_nan',
    name: '役牌·南',
    nameJp: '役牌·南',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '场风或自风为南时，南风的刻子或杠子',
    conditions: ['场风或自风为南', '包含南风的刻子或杠子'],
    examples: ['南南南 + 其他面子']
  },
  {
    id: 'yakuhai_sha',
    name: '役牌·西',
    nameJp: '役牌·西',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '场风或自风为西时，西风的刻子或杠子',
    conditions: ['场风或自风为西', '包含西风的刻子或杠子'],
    examples: ['西西西 + 其他面子']
  },
  {
    id: 'yakuhai_pei',
    name: '役牌·北',
    nameJp: '役牌·北',
    han: 1,
    category: YakuCategory.ONE_HAN,
    description: '场风或自风为北时，北风的刻子或杠子',
    conditions: ['场风或自风为北', '包含北风的刻子或杠子'],
    examples: ['北北北 + 其他面子']
  },

  // 二番役
  {
    id: 'sanshoku_doujun',
    name: '三色同顺',
    nameJp: 'サンショク',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '万筒索三种花色各有一组相同数字的顺子',
    conditions: ['三种花色各一组相同顺子', '副露时减1番'],
    examples: ['123万123筒123索 + 其他']
  },
  {
    id: 'ittsu',
    name: '一气通贯',
    nameJp: 'イッツー',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '同一花色的123、456、789三组顺子',
    conditions: ['同花色123、456、789顺子', '副露时减1番'],
    examples: ['123456789万 + 其他面子']
  },
  {
    id: 'chanta',
    name: '混全带幺九',
    nameJp: 'チャンタ',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '每组面子和对子都包含幺九牌或字牌',
    conditions: ['每组面子都含幺九牌或字牌', '副露时减1番'],
    examples: ['123万789筒东东东11索']
  },
  {
    id: 'chiitoi',
    name: '七对子',
    nameJp: 'チートイツ',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '7组不同的对子',
    conditions: ['门前清', '7组不同对子', '不能有4张相同牌'],
    examples: ['1122万3344筒5566索77字'],
    menzen: true
  },
  {
    id: 'toitoi',
    name: '对对和',
    nameJp: 'トイトイ',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '4组刻子（或杠子）+ 1组对子',
    conditions: ['4组刻子或杠子', '可以副露'],
    examples: ['111222333万44筒55索']
  },
  {
    id: 'sanankou',
    name: '三暗刻',
    nameJp: 'サンアンコー',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '3组暗刻（自摸形成的刻子）',
    conditions: ['3组暗刻', '第4组可以是明刻'],
    examples: ['111万222筒333索 + 明刻 + 对子']
  },
  {
    id: 'sankantsu',
    name: '三杠子',
    nameJp: 'サンカンツ',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '3组杠子（明杠或暗杠）',
    conditions: ['3组杠子', '明杠暗杠均可'],
    examples: ['1111万2222筒3333索 + 面子 + 对子']
  },
  {
    id: 'sanshoku_doukou',
    name: '三色同刻',
    nameJp: 'サンショクドーコー',
    han: 2,
    category: YakuCategory.TWO_HAN,
    description: '万筒索三种花色各有一组相同数字的刻子',
    conditions: ['三种花色各一组相同刻子'],
    examples: ['111万111筒111索 + 其他']
  },

  // 三番役
  {
    id: 'honitsu',
    name: '混一色',
    nameJp: 'ホンイツ',
    han: 3,
    category: YakuCategory.THREE_HAN,
    description: '手牌由一种数牌和字牌组成',
    conditions: ['一种数牌 + 字牌', '副露时减1番'],
    examples: ['11223344万东东南南白']
  },
  {
    id: 'junchan',
    name: '纯全带幺九',
    nameJp: 'ジュンチャン',
    han: 3,
    category: YakuCategory.THREE_HAN,
    description: '每组面子和对子都包含1或9的数牌',
    conditions: ['每组面子都含1或9', '不含字牌', '副露时减1番'],
    examples: ['123789万123789筒99索']
  },
  {
    id: 'ryanpeikou',
    name: '二盃口',
    nameJp: 'リャンペーコー',
    han: 3,
    category: YakuCategory.THREE_HAN,
    description: '门前清，两组一盃口（4组顺子为两对相同）',
    conditions: ['门前清', '两组一盃口'],
    examples: ['112233万445566筒77索'],
    menzen: true
  },

  // 六番役
  {
    id: 'chinitsu',
    name: '清一色',
    nameJp: 'チンイツ',
    han: 6,
    category: YakuCategory.SIX_HAN,
    description: '手牌全部由一种数牌组成',
    conditions: ['全部为一种数牌', '副露时减1番'],
    examples: ['11223344556677万']
  },

  // 役满
  {
    id: 'kokushi',
    name: '国士无双',
    nameJp: 'コクシムソウ',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '13种幺九牌各一张，其中一种成对',
    conditions: ['门前清', '13种幺九牌', '其中一种成对'],
    examples: ['19万19筒19索东南西北白发中 + 其中一张'],
    isYakuman: true,
    menzen: true
  },
  {
    id: 'suuankou',
    name: '四暗刻',
    nameJp: 'スーアンコー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '4组暗刻 + 1组对子',
    conditions: ['门前清', '4组暗刻', '自摸和牌'],
    examples: ['111222333万444筒55索'],
    isYakuman: true,
    menzen: true
  },
  {
    id: 'daisangen',
    name: '大三元',
    nameJp: 'ダイサンゲン',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '白发中三种字牌各成刻子',
    conditions: ['白发中各成刻子'],
    examples: ['白白白发发发中中中 + 其他'],
    isYakuman: true
  },
  {
    id: 'shousuushii',
    name: '小四喜',
    nameJp: 'ショウスーシー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '东南西北四种风牌，三组刻子一组对子',
    conditions: ['四种风牌', '三组刻子一组对子'],
    examples: ['东东东南南南西西西北北 + 其他'],
    isYakuman: true
  },
  {
    id: 'daisuushii',
    name: '大四喜',
    nameJp: 'ダイスーシー',
    han: 26,
    category: YakuCategory.DOUBLE_YAKUMAN,
    description: '东南西北四种风牌各成刻子',
    conditions: ['四种风牌各成刻子'],
    examples: ['东东东南南南西西西北北北 + 对子'],
    isYakuman: true
  },
  {
    id: 'tsuuiisou',
    name: '字一色',
    nameJp: 'ツーイーソー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '手牌全部由字牌组成',
    conditions: ['全部为字牌'],
    examples: ['东东东南南南白白白发发发中中'],
    isYakuman: true
  },
  {
    id: 'chinroutou',
    name: '清老头',
    nameJp: 'チンロートー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '手牌全部由1和9的数牌组成',
    conditions: ['全部为1和9的数牌'],
    examples: ['111999万111999筒11索'],
    isYakuman: true
  },
  {
    id: 'ryuuiisou',
    name: '绿一色',
    nameJp: 'リューイーソー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '手牌全部由绿色牌组成（23468索和发）',
    conditions: ['全部为绿色牌', '23468索和发'],
    examples: ['222333444666888索发发发'],
    isYakuman: true
  },
  {
    id: 'suukantsu',
    name: '四杠子',
    nameJp: 'スーカンツ',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '4组杠子 + 1组对子',
    conditions: ['4组杠子'],
    examples: ['1111万2222筒3333索4444万5万'],
    isYakuman: true
  },
  {
    id: 'chuurenpoutou',
    name: '九莲宝灯',
    nameJp: 'チューレンポートー',
    han: 13,
    category: YakuCategory.YAKUMAN,
    description: '门前清，同一花色1112345678999 + 任意一张',
    conditions: ['门前清', '同花色1112345678999形', '加任意一张同花色'],
    examples: ['1112345678999万 + 任意万子'],
    isYakuman: true,
    menzen: true
  }
];

// 按分类分组的役种
export const yakuByCategory = {
  [YakuCategory.ONE_HAN]: yakuList.filter(yaku => yaku.category === YakuCategory.ONE_HAN),
  [YakuCategory.TWO_HAN]: yakuList.filter(yaku => yaku.category === YakuCategory.TWO_HAN),
  [YakuCategory.THREE_HAN]: yakuList.filter(yaku => yaku.category === YakuCategory.THREE_HAN),
  [YakuCategory.SIX_HAN]: yakuList.filter(yaku => yaku.category === YakuCategory.SIX_HAN),
  [YakuCategory.YAKUMAN]: yakuList.filter(yaku => yaku.category === YakuCategory.YAKUMAN),
  [YakuCategory.DOUBLE_YAKUMAN]: yakuList.filter(yaku => yaku.category === YakuCategory.DOUBLE_YAKUMAN)
};

// 搜索役种的辅助函数
export const searchYaku = (query: string): Yaku[] => {
  const lowercaseQuery = query.toLowerCase();
  return yakuList.filter(yaku => 
    yaku.name.toLowerCase().includes(lowercaseQuery) ||
    yaku.nameJp.toLowerCase().includes(lowercaseQuery) ||
    yaku.description.toLowerCase().includes(lowercaseQuery)
  );
};

// 获取役种的番数显示文本
export const getHanText = (yaku: Yaku): string => {
  if (yaku.isYakuman) {
    return yaku.han === 26 ? '双倍役满' : '役满';
  }
  return `${yaku.han}番`;
};