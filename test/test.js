const TeXToMML = require("tex-to-mml");
let string = 'F=k\frac{\left| {{q}_{1}}{{q}_{2}} \right|}{{{r}^{2}}}\Rightarrow 5,{{33.10}^{-7}}={{9.10}^{9}}.\frac{1,{{6.10}^{-19}}.3,{{2.10}^{-19}}}{{{r}^{2}}}\Rightarrow r=2,{{94.10}^{11}}(m)'
console.log(TeXToMML(string));