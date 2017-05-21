module.exports = {
  localeId: 'en-US',
  numeralFormat: {
    delimiters: {
      thousands: ',',
      decimal: '.'
    },
    abbreviations: {
      thousand: 'k',
      million: 'm',
      billion: 'b',
      trillion: 't'
    },
    ordinal: function(number) {
      var b = number % 10;
      return (~~(number % 100 / 10) === 1) ? 'th' :
          (b === 1) ? 'st' :
          (b === 2) ? 'nd' :
          (b === 3) ? 'rd' : 'th';
    },
    currency: {
      symbol: '$'
    },
    formats: [ // 定义缩写
      {name: 'currency', format: '$ 0,0[.]00'}
    ]
  },
  translation: {
    "messages" : {
      "" : {
        "domain" : "messages",
        "lang"   : "en",
        "plural_forms" : "nplurals=2; plural=(n != 1);",
      },
      "some key" : [ "some key"]
    },
    "setting" : {
      "" : {
        "domain" : "setting",
        "lang"   : "en",
        "plural_forms" : "nplurals=2; plural=(n != 1);",
      },
      "some key" : [ "some key in setting domain"]
    }
  }
}