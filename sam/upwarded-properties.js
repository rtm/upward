import {P, TEXT} from '../src/U';   
var model = P({time: 0});
setInterval(_ => model.time++, 1000);
export default TEXT(model.time);
