import identifiers from "./identifiers";
import operators from "./operators";
import reverse from "./reverse";

const reverse_identifiers = reverse(identifiers);
const reverse_operators = reverse(operators);

/**
 * A basic basic basic MathML to Tex conversor.
 * @param {HTMLElement} value
 * @return {String}
 */
export default function mml_to_tex(value) {
  let output = "";
  
  /** @param {HTMLElement} element */
  const walk = (element) => {
    const children = element.children;
    const inner_value = element.innerHTML;
    const tag_name = element.tagName.toLowerCase();
    let from_list;

    switch (tag_name) {
    case "math":
    case "msup":
    case "msub":
    case "msubsup":
      break;
    case "mn":
      output += inner_value;
      break;
    case "mi":
      if (from_list = reverse_identifiers[inner_value]) {
        output += from_list + (from_list[0] === "\\" ? " " : "");
      }
      else {
        output += inner_value;
      } 
      break;
    case "mo":
      if (from_list = reverse_operators[inner_value]) {
        output += from_list + (from_list[0] === "\\" ? " " : "");
      }
      else {
        output += "?";
      }
      break;
    case "mrow":
      const parent = element.parentNode;
      const parent_tag_name = parent.tagName.toLowerCase();

      if (parent.lastElementChild === element) {
        switch (parent_tag_name) {
        case "msubsup":
          output += "^";
          break;
        }
      }
      
      output = output.trim() + "{";
      break;
    case "mspace":
      switch (element.getAttribute("linebreak")) {
      case "newline":
        output += "\\\\";
        break;
      }
      break;
    case "mroot":
      output += "\\sqrt";
      break;
    default:
      output += `\\${tag_name.substr(1)} `;
      break;
    }

    switch (tag_name) {
    case "mroot":
      output += "[";
      walk(children[1]);
      output += "]";
      walk(children[0]);
      break;
    default:
      for (let i = 0; i < children.length; i++) {
        walk(children[i]);
      }
    }

    switch (tag_name) {
    case "mrow":
      const parent = element.parentNode;
      const parent_tag_name = parent.tagName.toLowerCase();
      output += "}";
      
      if (parent.firstElementChild === element) {
        switch (parent_tag_name) {
        case "msubsup":
          output += "_";
          break;
        case "msup":
          output += "^";
          break;
        case "msub":
          output += "_";
          break;
        }
      }
      break;
    }
  }

  walk(value);

  return output;
}