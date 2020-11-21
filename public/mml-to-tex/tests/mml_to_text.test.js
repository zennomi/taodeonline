import load_html from "./load_html";
import mml_to_tex from "../src/index";

const cotangentFunction = load_html("./cotangent_function.html")
const equationWithRoot = load_html("./equation_with_root.html")
const findX = load_html("./find_x.html")
const gravityFormula = load_html("./gravity_formula.html")
const integral = load_html("./integral.html")
const massEnergyEquivalence = load_html("./mass_energy_equivalence.html")
const quadraticFormula = load_html("./quadratic_formula.html")

test("Quadratic formula (frac, sup, sqrt)", () => {
  expect(mml_to_tex(quadraticFormula)).toBe("x=\\frac{-b\\pm \\sqrt{{b}^{2}-4ac}}{2a}");
});

test("Mass-Energy equivalence (sup)", () => {
  expect(mml_to_tex(massEnergyEquivalence)).toBe("e=m{c}^{2}");
});

test("Gravity formula (frac, sup, sub)", () => {
  expect(mml_to_tex(gravityFormula)).toBe("F=\\frac{G{m}_{1}{m}_{2}}{{d}^{2}}");
});

test("Find X (frac, newline)", () => {
  expect(mml_to_tex(findX)).toBe("2x+10=20\\\\2x=20-10\\\\2x=10\\\\x=\\frac{10}{2}\\\\x=5");
});

test("Cotangent function (frac)", () => {
  expect(mml_to_tex(cotangentFunction)).toBe("\\cot \\theta =\\frac{\\cos \\theta }{\\sin \\theta }=\\tan (\\frac{\\pi }{2}-\\theta )=\\frac{1}{\\tan \\theta }");
});

test("Equation with nth root (sqrt nth)", () => {
  expect(mml_to_tex(equationWithRoot)).toBe("2x=\\sqrt[{3}]{25-2x}+4");
});

test("Integral (subsup)", () => {
  expect(mml_to_tex(integral)).toBe("{\\int }_{1}^{x}\\frac{dt}{t}");
});