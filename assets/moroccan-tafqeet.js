/**
 * Moroccan Curriculum Tafqeet & Arabic Number Engine (Educational Edition)
 * Complies with Moroccan Primary & Middle School Curriculum (المنهاج المغربي)
 * Rules:
 *  - Uses "مئة" instead of "مائة"
 *  - Uses separated hundreds: "ثلاث مئة", "أربع مئة", etc. instead of "ثلاثمئة"
 *  - Generates both with-tashkeel and without-tashkeel simultaneously
 *  - Supports Nominative (مرفوع) and Accusative/Genitive (منصوب ومجرور)
 *  - Place-value breakdown for primary mathematics (الوحدات، العشرات، المئات، الآلاف، الملايين، الملايير)
 *  - Bidirectional: Number -> Arabic Text & Arabic Text -> Number
 */

(function (global) {
  'use strict';

  // Base digits (1 - 9)
  const ONES = {
    masculine: {
      tashkeel: {
        nom: ['', 'وَاحِدٌ', 'اثْنَانِ', 'ثَلَاثَةٌ', 'أَرْبَعَةٌ', 'خَمْسَةٌ', 'سِتَّةٌ', 'سَبْعَةٌ', 'ثَمَانِيَةٌ', 'تِسْعَةٌ'],
        acc: ['', 'وَاحِدًا', 'اثْنَيْنِ', 'ثَلَاثَةً', 'أَرْبَعَةً', 'خَمْسَةً', 'سِتَّةً', 'سَبْعَةً', 'ثَمَانِيَةً', 'تِسْعَةً']
      },
      plain: {
        nom: ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'],
        acc: ['', 'واحدا', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
      }
    },
    feminine: {
      tashkeel: {
        nom: ['', 'إِحْدَى', 'اثْنَتَانِ', 'ثَلَاثٌ', 'أَرْبَعٌ', 'خَمْسٌ', 'سِتٌّ', 'سَبْعٌ', 'ثَمَانٍ', 'تِسْعٌ'],
        acc: ['', 'إِحْدَى', 'اثْنَتَيْنِ', 'ثَلَاثًا', 'أَرْبَعًا', 'خَمْسًا', 'سِتًّا', 'سَبْعًا', 'ثَمَانِيًا', 'تِسْعًا']
      },
      plain: {
        nom: ['', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'],
        acc: ['', 'إحدى', 'اثنتين', 'ثلاثا', 'أربعا', 'خمسا', 'ستا', 'سبعا', 'ثمانيا', 'تسعا']
      }
    }
  };

  // Compound 11 - 19
  const TEENS = {
    masculine: {
      tashkeel: {
        nom: [
          'عَشَرَةٌ',
          'أَحَدَ عَشَرَ',
          'اثْنَا عَشَرَ',
          'ثَلَاثَةَ عَشَرَ',
          'أَرْبَعَةَ عَشَرَ',
          'خَمْسَةَ عَشَرَ',
          'سِتَّةَ عَشَرَ',
          'سَبْعَةَ عَشَرَ',
          'ثَمَانِيَةَ عَشَرَ',
          'تِسْعَةَ عَشَرَ'
        ],
        acc: [
          'عَشَرَةً',
          'أَحَدَ عَشَرَ',
          'اثْنَيْ عَشَرَ',
          'ثَلَاثَةَ عَشَرَ',
          'أَرْبَعَةَ عَشَرَ',
          'خَمْسَةَ عَشَرَ',
          'سِتَّةَ عَشَرَ',
          'سَبْعَةَ عَشَرَ',
          'ثَمَانِيَةَ عَشَرَ',
          'تِسْعَةَ عَشَرَ'
        ]
      },
      plain: {
        nom: [
          'عشرة',
          'أحد عشر',
          'اثنا عشر',
          'ثلاثة عشر',
          'أربعة عشر',
          'خمسة عشر',
          'ستة عشر',
          'سبعة عشر',
          'ثمانية عشر',
          'تسعة عشر'
        ],
        acc: [
          'عشرة',
          'أحد عشر',
          'اثني عشر',
          'ثلاثة عشر',
          'أربعة عشر',
          'خمسة عشر',
          'ستة عشر',
          'سبعة عشر',
          'ثمانية عشر',
          'تسعة عشر'
        ]
      }
    },
    feminine: {
      tashkeel: {
        nom: [
          'عَشْرٌ',
          'إِحْدَى عَشْرَةَ',
          'اثْنَتَا عَشْرَةَ',
          'ثَلَاثَ عَشْرَةَ',
          'أَرْبَعَ عَشْرَةَ',
          'خَمْسَ عَشْرَةَ',
          'سِتَّ عَشْرَةَ',
          'سَبْعَ عَشْرَةَ',
          'ثَمَانِيَ عَشْرَةَ',
          'تِسْعَ عَشْرَةَ'
        ],
        acc: [
          'عَشْرًا',
          'إِحْدَى عَشْرَةَ',
          'اثْنَتَيْ عَشْرَةَ',
          'ثَلَاثَ عَشْرَةَ',
          'أَرْبَعَ عَشْرَةَ',
          'خَمْسَ عَشْرَةَ',
          'سِتَّ عَشْرَةَ',
          'سَبْعَ عَشْرَةَ',
          'ثَمَانِيَ عَشْرَةَ',
          'تِسْعَ عَشْرَةَ'
        ]
      },
      plain: {
        nom: [
          'عشر',
          'إحدى عشرة',
          'اثنتا عشرة',
          'ثلاث عشرة',
          'أربع عشرة',
          'خمس عشرة',
          'ست عشرة',
          'سبع عشرة',
          'ثماني عشرة',
          'تسع عشرة'
        ],
        acc: [
          'عشرا',
          'إحدى عشرة',
          'اثنتي عشرة',
          'ثلاث عشرة',
          'أربع عشرة',
          'خمس عشرة',
          'ست عشرة',
          'سبع عشرة',
          'ثماني عشرة',
          'تسع عشرة'
        ]
      }
    }
  };

  // Tens (العقود: 20 - 90)
  const TENS = {
    tashkeel: {
      nom: ['', '', 'عِشْرُونَ', 'ثَلَاثُونَ', 'أَرْبَعُونَ', 'خَمْسُونَ', 'سِتُّونَ', 'سَبْعُونَ', 'ثَمَانُونَ', 'تِسْعُونَ'],
      acc: ['', '', 'عِشْرِينَ', 'ثَلَاثِينَ', 'أَرْبَعِينَ', 'خَمْسِينَ', 'سِتِّينَ', 'سَبْعِينَ', 'ثَمَانِينَ', 'تِسْعِينَ']
    },
    plain: {
      nom: ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'],
      acc: ['', '', 'عشرين', 'ثلاثين', 'أربعين', 'خمسين', 'ستين', 'سبعين', 'ثمانين', 'تسعين']
    }
  };

  // Hundreds (المئات)
  // In Moroccan Curriculum: "مئة" (not مائة) and separated: "ثلاث مئة"
  const HUNDREDS = {
    moroccan: {
      tashkeel: {
        nom: [
          '',
          'مِئَةٌ',
          'مِئَتَانِ',
          'ثَلَاثُ مِئَةٍ',
          'أَرْبَعُ مِئَةٍ',
          'خَمْسُ مِئَةٍ',
          'سِتُّ مِئَةٍ',
          'سَبْعُ مِئَةٍ',
          'ثَمَانِي مِئَةٍ',
          'تِسْعُ مِئَةٍ'
        ],
        acc: [
          'مِئَةً',
          'مِئَتَيْنِ',
          'ثَلَاثَ مِئَةٍ',
          'أَرْبَعَ مِئَةٍ',
          'خَمْسَ مِئَةٍ',
          'سِتَّ مِئَةٍ',
          'سَبْعَ مِئَةٍ',
          'ثَمَانِيَ مِئَةٍ',
          'تِسْعَ مِئَةٍ'
        ]
      },
      plain: {
        nom: ['', 'مئة', 'مئتان', 'ثلاث مئة', 'أربع مئة', 'خمس مئة', 'ست مئة', 'سبع مئة', 'ثماني مئة', 'تسع مئة'],
        acc: ['', 'مئة', 'مئتين', 'ثلاث مئة', 'أربع مئة', 'خمس مئة', 'ست مئة', 'سبع مئة', 'ثماني مئة', 'تسع مئة']
      }
    }
  };

  // Scale Groups: Thousands (آلاف), Millions (ملايين), Billions (ملايير), Trillions (تريليونات)
  const SCALES = [
    {
      singularNom: { tashkeel: '', plain: '' },
      singularAcc: { tashkeel: '', plain: '' },
      singularGen: { tashkeel: '', plain: '' },
      dualNom: { tashkeel: '', plain: '' },
      dualAcc: { tashkeel: '', plain: '' },
      plural: { tashkeel: '', plain: '' }
    },
    {
      // 10^3: Thousands
      singularNom: { tashkeel: 'أَلْفٌ', plain: 'ألف' },
      singularAcc: { tashkeel: 'أَلْفًا', plain: 'ألفا' },
      singularGen: { tashkeel: 'أَلْفٍ', plain: 'ألف' },
      dualNom: { tashkeel: 'أَلْفَانِ', plain: 'ألفان' },
      dualAcc: { tashkeel: 'أَلْفَيْنِ', plain: 'ألفين' },
      plural: { tashkeel: 'آلَافٍ', plain: 'آلاف' }
    },
    {
      // 10^6: Millions
      singularNom: { tashkeel: 'مِلْيُونٌ', plain: 'مليون' },
      singularAcc: { tashkeel: 'مِلْيُونًا', plain: 'مليونا' },
      singularGen: { tashkeel: 'مِلْيُونٍ', plain: 'مليون' },
      dualNom: { tashkeel: 'مِلْيُونَانِ', plain: 'مليونان' },
      dualAcc: { tashkeel: 'مِلْيُونَيْنِ', plain: 'مليونين' },
      plural: { tashkeel: 'مَلَايِينَ', plain: 'ملايين' }
    },
    {
      // 10^9: Billions (Milliards)
      singularNom: { tashkeel: 'مِلْيَارٌ', plain: 'مليار' },
      singularAcc: { tashkeel: 'مِلْيَارًا', plain: 'مليارا' },
      singularGen: { tashkeel: 'مِلْيَارٍ', plain: 'مليار' },
      dualNom: { tashkeel: 'مِلْيَارَانِ', plain: 'ملياران' },
      dualAcc: { tashkeel: 'مِلْيَارَيْنِ', plain: 'مليارين' },
      plural: { tashkeel: 'مَلَايِيرَ', plain: 'ملايير' }
    },
    {
      // 10^12: Trillions
      singularNom: { tashkeel: 'تِرِلْيُونٌ', plain: 'ترليون' },
      singularAcc: { tashkeel: 'تِرِلْيُونًا', plain: 'ترليونا' },
      singularGen: { tashkeel: 'تِرِلْيُونٍ', plain: 'ترليون' },
      dualNom: { tashkeel: 'تِرِلْيُونَانِ', plain: 'ترليونان' },
      dualAcc: { tashkeel: 'تِرِلْيُونَيْنِ', plain: 'ترليونين' },
      plural: { tashkeel: 'تِرِلْيُونَاتٍ', plain: 'ترليونات' }
    }
  ];

  function convertGroup(num, options, scaleIndex) {
    if (num === 0) return '';

    const {
      withTashkeel = true,
      grammaticalCase = 'nom',
      gender = 'masculine'
    } = options;

    const tashKey = withTashkeel ? 'tashkeel' : 'plain';
    const caseKey = grammaticalCase === 'nom' ? 'nom' : 'acc';

    const h = Math.floor(num / 100);
    const remainder = num % 100;
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;

    const parts = [];

    // Hundreds
    if (h > 0) {
      const hundredStr = HUNDREDS.moroccan[tashKey][caseKey][h];
      parts.push(hundredStr);
    }

    // Remainder (1 - 99)
    if (remainder > 0) {
      if (remainder < 10) {
        const activeGender = scaleIndex > 0 ? 'masculine' : gender;
        const unitStr = ONES[activeGender][tashKey][caseKey][remainder];
        parts.push(unitStr);
      } else if (remainder >= 10 && remainder <= 19) {
        const activeGender = scaleIndex > 0 ? 'masculine' : gender;
        const teenIdx = remainder - 10;
        const teenStr = TEENS[activeGender][tashKey][caseKey][teenIdx];
        parts.push(teenStr);
      } else {
        const activeGender = scaleIndex > 0 ? 'masculine' : gender;
        const unitStr = u > 0 ? ONES[activeGender][tashKey][caseKey][u] : '';
        const tenStr = TENS[tashKey][caseKey][t];

        if (unitStr) {
          const waw = withTashkeel ? ' وَ' : ' و';
          parts.push(unitStr + waw + tenStr);
        } else {
          parts.push(tenStr);
        }
      }
    }

    const conjunction = withTashkeel ? ' وَ' : ' و';
    return parts.join(conjunction);
  }

  function tafqeetInternal(input, opts = {}) {
    const defaultOptions = {
      withTashkeel: true,
      grammaticalCase: 'nom',
      gender: 'masculine'
    };

    const options = Object.assign({}, defaultOptions, opts);
    const { withTashkeel, grammaticalCase } = options;
    const tashKey = withTashkeel ? 'tashkeel' : 'plain';
    const caseKey = grammaticalCase === 'nom' ? 'nom' : 'acc';

    let str = String(input).trim().replace(/,/g, '');
    if (!str || isNaN(str)) return '';

    let isNegative = false;
    if (str.startsWith('-')) {
      isNegative = true;
      str = str.substring(1);
    }

    const parts = str.split('.');
    let intPartStr = parts[0] || '0';
    let decPartStr = parts[1] || '';

    if (BigInt(intPartStr) === 0n && (!decPartStr || Number(decPartStr) === 0)) {
      return withTashkeel ? 'صِفْرٌ' : 'صفر';
    }

    const groups = [];
    let tempStr = intPartStr;
    while (tempStr.length > 0) {
      const start = Math.max(0, tempStr.length - 3);
      const chunk = tempStr.substring(start);
      groups.push(parseInt(chunk, 10));
      tempStr = tempStr.substring(0, start);
    }

    const wordsParts = [];

    for (let i = groups.length - 1; i >= 0; i--) {
      const groupVal = groups[i];
      if (groupVal === 0) continue;

      const scale = SCALES[i];

      if (i === 0) {
        const groupWords = convertGroup(groupVal, options, 0);
        wordsParts.push(groupWords);
      } else {
        if (groupVal === 1) {
          wordsParts.push(scale.singularNom[tashKey]);
        } else if (groupVal === 2) {
          wordsParts.push(caseKey === 'nom' ? scale.dualNom[tashKey] : scale.dualAcc[tashKey]);
        } else if (groupVal >= 3 && groupVal <= 10) {
          let groupWords = convertGroup(groupVal, Object.assign({}, options, { gender: 'feminine' }), i);
          if (withTashkeel) {
            groupWords = groupWords.replace(/ٌ$/, 'ُ').replace(/ً$/, 'َ').replace(/ٍ$/, 'ِ');
          }
          wordsParts.push(groupWords + ' ' + scale.plural[tashKey]);
        } else if (groupVal % 100 === 0) {
          let groupWords = convertGroup(groupVal, options, i);
          if (withTashkeel) {
            groupWords = groupWords.replace(/ٍ$/, 'ِ').replace(/ٌ$/, 'ُ');
          }
          wordsParts.push(groupWords + ' ' + scale.singularGen[tashKey]);
        } else if (groupVal % 100 >= 3 && groupVal % 100 <= 10) {
          const groupWords = convertGroup(groupVal, Object.assign({}, options, { gender: 'feminine' }), i);
          wordsParts.push(groupWords + ' ' + scale.plural[tashKey]);
        } else {
          const groupWords = convertGroup(groupVal, options, i);
          wordsParts.push(groupWords + ' ' + scale.singularAcc[tashKey]);
        }
      }
    }

    const conjunction = withTashkeel ? ' وَ' : ' و';
    let result = wordsParts.join(conjunction);

    if (isNegative) {
      result = (withTashkeel ? 'سَالِبُ ' : 'سالب ') + result;
    }

    if (decPartStr && Number(decPartStr) > 0) {
      const decNum = parseInt(decPartStr.substring(0, 3), 10);
      if (decNum > 0) {
        const decWords = tafqeetInternal(decNum, Object.assign({}, options));
        const fassila = withTashkeel ? ' فَاصِلَة ' : ' فاصلة ';
        result += fassila + decWords;
      }
    }

    return result.trim();
  }

  /**
   * Main function: returns both with-tashkeel and without-tashkeel versions
   */
  function tafqeetDual(input, opts = {}) {
    const withTashkeel = tafqeetInternal(input, Object.assign({}, opts, { withTashkeel: true }));
    const withoutTashkeel = tafqeetInternal(input, Object.assign({}, opts, { withTashkeel: false }));
    return {
      withTashkeel,
      withoutTashkeel
    };
  }

  function tafqeet(input, opts = {}) {
    return tafqeetInternal(input, opts);
  }

  /**
   * Reverse Converter: Arabic Words to Number
   */
  function arabicToNumber(text) {
    if (!text || typeof text !== 'string') return null;

    let cleaned = text
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[،,]/g, ' ')
      .replace(/[\(\)\[\]\{\}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return null;

    cleaned = cleaned
      .replace(/مائة/g, 'مئة')
      .replace(/مائتان/g, 'مئتان')
      .replace(/مائتين/g, 'مئتين')
      .replace(/ثلاثمئة|ثلاثمائة/g, 'ثلاث مئة')
      .replace(/أربعمئة|أربعمائة/g, 'أربع مئة')
      .replace(/خمسمئة|خمسمائة/g, 'خمس مئة')
      .replace(/ستمئة|ستمائة/g, 'ست مئة')
      .replace(/سبعمئة|سبعمائة/g, 'سبع مئة')
      .replace(/ثمانمئة|ثمانيمئة|ثمانيمائة|ثمانمائة/g, 'ثماني مئة')
      .replace(/تسعمئة|تسعمائة/g, 'تسع مئة')
      .replace(/إحدى/g, 'واحد')
      .replace(/اثنتان|اثنتين|اثني|اثنا/g, 'اثنين');

    const wordValues = {
      'صفر': 0,
      'واحد': 1,
      'واحدة': 1,
      'واحدا': 1,
      'اثنين': 2,
      'اثنان': 2,
      'ثلاث': 3,
      'ثلاثة': 3,
      'أربع': 4,
      'أربعة': 4,
      'خمس': 5,
      'خمسة': 5,
      'ست': 6,
      'ستة': 6,
      'سبع': 7,
      'سبعة': 7,
      'ثمان': 8,
      'ثماني': 8,
      'ثمانية': 8,
      'تسع': 9,
      'تسعة': 9,
      'عشر': 10,
      'عشرة': 10,
      'أحد عشر': 11,
      'اثنا عشر': 12,
      'اثني عشر': 12,
      'اثنتا عشرة': 12,
      'اثنتي عشرة': 12,
      'ثلاثة عشر': 13,
      'ثلاث عشرة': 13,
      'أربعة عشر': 14,
      'أربع عشرة': 14,
      'خمسة عشر': 15,
      'خمس عشرة': 15,
      'ستة عشر': 16,
      'ست عشرة': 16,
      'سبعة عشر': 17,
      'سبع عشرة': 17,
      'ثمانية عشر': 18,
      'ثماني عشرة': 18,
      'تسعة عشر': 19,
      'تسع عشرة': 19,
      'عشرون': 20,
      'عشرين': 20,
      'ثلاثون': 30,
      'ثلاثين': 30,
      'أربعون': 40,
      'أربعين': 40,
      'خمسون': 50,
      'خمسين': 50,
      'ستون': 60,
      'ستين': 60,
      'سبعون': 70,
      'سبعين': 70,
      'ثمانون': 80,
      'ثمانين': 80,
      'تسعون': 90,
      'تسعين': 90,
      'مئة': 100,
      'مائة': 100,
      'مئتان': 200,
      'مئتين': 200
    };

    const scales = {
      'ألف': 1000,
      'ألفا': 1000,
      'ألفٍ': 1000,
      'ألفان': 2000,
      'ألفين': 2000,
      'آلاف': 1000,
      'مليون': 1000000,
      'مليونا': 1000000,
      'مليونان': 2000000,
      'مليونين': 2000000,
      'ملايين': 1000000,
      'مليار': 1000000000,
      'مليارا': 1000000000,
      'ملياران': 2000000000,
      'مليارين': 2000000000,
      'ملايير': 1000000000,
      'ترليون': 1000000000000,
      'ترليونا': 1000000000000,
      'ترليونان': 2000000000000,
      'ترليونين': 2000000000000,
      'ترليونات': 1000000000000
    };

    const rawTokens = cleaned.split(/\s+/).filter(Boolean);
    const tokens = rawTokens.map(t => {
      if (t.startsWith('و') && t.length > 1 && !wordValues[t] && !scales[t]) {
        return t.substring(1);
      }
      return t;
    });

    let total = 0;
    let currentGroup = 0;
    let i = 0;

    while (i < tokens.length) {
      const tok = tokens[i];
      const nextTok = tokens[i + 1];

      const twoWords = nextTok ? `${tok} ${nextTok}` : '';

      if (twoWords === 'ثلاث مئة' || twoWords === 'ثلاث مائة') {
        currentGroup += 300;
        i += 2;
        continue;
      } else if (twoWords === 'أربع مئة' || twoWords === 'أربع مائة') {
        currentGroup += 400;
        i += 2;
        continue;
      } else if (twoWords === 'خمس مئة' || twoWords === 'خمس مائة') {
        currentGroup += 500;
        i += 2;
        continue;
      } else if (twoWords === 'ست مئة' || twoWords === 'ست مائة') {
        currentGroup += 600;
        i += 2;
        continue;
      } else if (twoWords === 'سبع مئة' || twoWords === 'سبع مائة') {
        currentGroup += 700;
        i += 2;
        continue;
      } else if (twoWords === 'ثماني مئة' || twoWords === 'ثمان مئة' || twoWords === 'ثماني مائة') {
        currentGroup += 800;
        i += 2;
        continue;
      } else if (twoWords === 'تسع مئة' || twoWords === 'تسع مائة') {
        currentGroup += 900;
        i += 2;
        continue;
      } else if (wordValues[twoWords] !== undefined) {
        currentGroup += wordValues[twoWords];
        i += 2;
        continue;
      }

      if (scales[tok] !== undefined) {
        const scaleMultiplier = scales[tok];
        if (tok === 'ألفان' || tok === 'ألفين' || tok === 'مليونان' || tok === 'مليونين' || tok === 'ملياران' || tok === 'مليارين' || tok === 'ترليونان' || tok === 'ترليونين') {
          total += scaleMultiplier;
          currentGroup = 0;
        } else {
          if (currentGroup === 0) currentGroup = 1;
          total += currentGroup * scaleMultiplier;
          currentGroup = 0;
        }
        i++;
        continue;
      }

      if (wordValues[tok] !== undefined) {
        currentGroup += wordValues[tok];
        i++;
        continue;
      }

      i++;
    }

    total += currentGroup;
    return total;
  }

  // Educational Place-Value Breakdown Helper for Mathematics
  function getPlaceValueBreakdown(num) {
    const n = Math.abs(parseInt(num, 10));
    if (isNaN(n)) return null;

    const s = String(n);
    const len = s.length;

    return {
      total: n,
      units: len >= 1 ? parseInt(s[len - 1], 10) : 0,
      tens: len >= 2 ? parseInt(s[len - 2], 10) * 10 : 0,
      hundreds: len >= 3 ? parseInt(s[len - 3], 10) * 100 : 0,
      thousands: len >= 4 ? parseInt(s.substring(Math.max(0, len - 6), len - 3), 10) * 1000 : 0,
      millions: len >= 7 ? parseInt(s.substring(Math.max(0, len - 9), len - 6), 10) * 1000000 : 0,
      billions: len >= 10 ? parseInt(s.substring(0, len - 9), 10) * 1000000000 : 0
    };
  }

  const Engine = {
    tafqeet,
    tafqeetDual,
    arabicToNumber,
    getPlaceValueBreakdown
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  } else {
    global.MoroccanTafqeet = Engine;
  }

})(typeof window !== 'undefined' ? window : this);
