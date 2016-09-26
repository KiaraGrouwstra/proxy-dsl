module.exports = {
  defWriteCb: global['localStorage'] ? (k,v) => localStorage.setItem(k, JSON.stringify(v)) : (k,v) => console.log(`storing ${k}: ${JSON.stringify(v)}`),
  INTERNAL_METHODS: ['inspect'],
  INTERNALIZE_METHODS: ['valueOf'],
  INDEX: 'INDEX',
  DETAIL: 'DETAIL',
};
