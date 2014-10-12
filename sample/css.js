import {createStyleSheet} from '../src/U';

createStyleSheet()
  .rule("body",   { fontFamily : 'sans-serif' })
  .rule("h3",     { backgroundColor: 'brown', color: 'white', padding: '6px'})
  .rule(".code",  { whiteSpace: 'pre', fontFamily: 'monospace', backgroundColor: 'pink', margin: '12px 40px', padding: '12px'})
  .rule(".result", { backgroundColor: 'beige', margin: '12px 40px', padding: '12px'})
  .rule(".hide",   { display: 'none'})
;
