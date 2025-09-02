import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpStatement, interpProgram } from "./interpreter.js";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates multiplication with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));

    expect(r).toEqual(20);
  });
  it("evaluates numbers correctly", () => {
    expect(interpExpression({}, parseExpression("28"))).toBe(28);
  });

  it("evaluates booleans correctly", () => {
    expect(interpExpression({}, parseExpression("true"))).toBe(true);
    expect(interpExpression({}, parseExpression("false"))).toBe(false);
  });

  it("looks up an existing variable", () => {
    expect(interpExpression({ x: 1 }, parseExpression("x"))).toBe(1);
  });

  it("throws when variable is undefined", () => {
    expect(() => interpExpression({}, parseExpression("fake"))).toThrow("undefined");
  });

  const op: [string, any][] = [
    ["1 + 1", 2],
    ["5 - 2", 3],
    ["4 * 3", 12],
    ["8 / 4", 2],
    ["1 < 4", true],
    ["5 > 3", true],
    ["2 === 2", true],
    ["true && false", false],
    ["true || false", true],
  ];
  op.forEach(([e, expected]) => {
    it(`Evalutes ${e} correctly`, () => {
      expect(interpExpression({}, parseExpression(e))).toBe(expected);
    });
  });
  it("throws errors correctly", () => {
    expect(() => interpExpression({}, parseExpression("1 / 0"))).toThrow("Can't divide by 0");
    expect(() => interpExpression({}, parseExpression("true + 1"))).toThrow("Not a num");
    expect(() => interpExpression({}, parseExpression("true < 2"))).toThrow("Not a num");
    expect(() => interpExpression({}, parseExpression("1 && false"))).toThrow("Not a boolean");

    const badExpr = {
      kind: "operator",
      operator: "^^",
      left: { kind: "number", value: 1 },
      right: { kind: "number", value: 2 },
    } as any;
    expect(() => interpExpression({}, badExpr)).toThrow("unknown");
  });
});

describe("interpStatement", () => {
  it("declares new variable correctly", () => {
    const state: State = {};
    const program = parseProgram("let x = 1;");
    interpStatement(state, program[0]);
    expect(state.x).toBe(1);
  });
  it("throws error when declaring a varibale twice", () => {
    const state = {};
    const program = parseProgram("let x = 1; let x = 2;");
    interpStatement(state, program[0]);
    expect(() => interpStatement(state, program[1])).toThrow("Var already declared");
  });
  it("reassigns varibale correctly", () => {
    const state: State = {};
    const program = parseProgram("let x = 1; x = x + 2;");
    interpStatement(state, program[0]);
    interpStatement(state, program[1]);
    expect(state.x).toBe(3);
  });
  it("throws error for undefined variable", () => {
    const state: State = {};
    const program = parseProgram("y = 10;");
    expect(() => interpStatement(state, program[0])).toThrow("undefined");
  });
  it("Goes to the true branch for true", () => {
    const state: State = {};
    const program = parseProgram("let x = 1; if (true) { x = 1; } else { x = 2; }");
    interpStatement(state, program[0]);
    interpStatement(state, program[1]);
    expect(state.x).toBe(1);
  });
  it("Goes to the false branch for false", () => {
    const state: State = {};
    const program = parseProgram("let x = 1; if (false) { x = 1; } else { x = 2; }");
    interpStatement(state, program[0]);
    interpStatement(state, program[1]);
    expect(state.x).toBe(2);
  });
  it("Conserves Scope", () => {
    const state: State = {};
    const program = parseProgram("let x = 1; if (true) { let x = 2; } else { }");
    interpStatement(state, program[0]);
    interpStatement(state, program[1]);
    expect(state.x).toBe(1);
  });
  it("correctly runs loop", () => {
    const state: State = {};
    const program = parseProgram("let i = 0; while (i < 3) { i = i + 1; }");
    interpStatement(state, program[0]);
    interpStatement(state, program[1]);
    expect(state.i).toBe(3);
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment", () => {
    expectStateToBe(
      `      
      let x = 10;
      x = 20;
    `,
      { x: 20 }
    );
  });
  it("if/else works correctly", () => {
    expectStateToBe(
      `
      let x = 1;
      if (true) { x = 2; } else { x = 3; }
      `,
      { x: 2 }
    );
  });
  it("Block scope works correctly", () => {
    expectStateToBe(
      `
      let x = 1;
      if (true) { let x = 99; }
      `,
      { x: 1 }
    );
  });
  it("While loop works correctly", () => {
    expectStateToBe(
      `
      let i = 0;
      while (i < 3) { i = i + 1; }
      `,
      { i: 3 }
    );
  });
  it("Handles complex arithmetic", () => {
    expectStateToBe(
      `
      let a = 2;
      let b = 5;
      a = a * b + 1;
      `,
      { a: 11, b: 5 }
    );
  });
  it("undefined doesn't work", () => {
    expect(() => interpProgram(parseProgram("y = 10;"))).toThrow("undefined");
  });
});
