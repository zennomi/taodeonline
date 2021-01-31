const TeXToMML = require("tex-to-mml");
module.exports.texToMathML = (string) => {
    return string.replace(/\$([^$]*)\$/g, (match, m1) => {
      return TeXToMML(m1).replace(/\n/g, "").replace(/ {2,}/g, "").replace('display="block"', "");
    })
    .replace(/\\\[([^[]*)\\\]/g, (match, m1) => {
      return TeXToMML(m1).replace(/\n/g, "").replace(/ {2,}/g, "").replace('display="block"', "");
    })
    .replace(/\\\((.*?)\\\)/g, (match, m1) => {
      return TeXToMML(m1).replace(/\n/g, "").replace(/ {2,}/g, "").replace('display="block"', "");
    })
    .replace(/<p>&nbsp;<\/p>/g, "");
  }
