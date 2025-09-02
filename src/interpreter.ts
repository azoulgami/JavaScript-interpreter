import { Expression, Statement } from "../include/parser.js";

type RuntimeValue = number | boolean;
const PARENT_STATE_KEY = Symbol("[[PARENT]]");
export type State = { [PARENT_STATE_KEY]?: State; [key: string]: RuntimeValue };

export function interpExpression(state: State, exp: Expression): RuntimeValue {
  if (exp.kind === "number" || exp.kind === "boolean") {
    return exp.value;
  }
  if (exp.kind === "variable") {
    return helper(exp.name, state);
  }
  if (exp.kind === "operator") {
    const left = interpExpression(state, exp.left);
    const right = interpExpression(state, exp.right);
    const op = exp.operator;

    if (op === "+" || op === "-" || op === "*" || op === "/") {
      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error("Not a num");
      }
      if (op === "/" && right === 0) {
        throw new Error("Can't divide by 0");
      }
      if (op === "+") return left + right;
      if (op === "-") return left - right;
      if (op === "*") return left * right;
      else return left / right;
    }
    if (op === "===") {
      return left === right;
    }
    if (op === "<" || op === ">") {
      if (typeof left !== "number" || typeof right !== "number") {
        throw new Error("Not a num");
      }
      if (op === "<") return left < right;
      else return left > right;
    }
    if (op === "&&" || op === "||") {
      if (typeof left !== "boolean" || typeof right !== "boolean") {
        throw new Error("Not a boolean");
      }
      if (op === "&&") return left && right;
      else return left || right;
    }

    throw new Error("unknown");
  }
  throw new Error("unknown");
}

export function interpStatement(state: State, st: Statement): void {
  if (st.kind === "let") {
    if (st.name in state) {
      throw new Error("Var already declared");
    }
    state[st.name] = interpExpression(state, st.expression);
  } else if (st.kind === "assignment") {
    const val = interpExpression(state, st.expression);
    let cur: State | undefined = state;
    while (cur && !Object.prototype.hasOwnProperty.call(cur, st.name)) {
      cur = cur[PARENT_STATE_KEY];
    }
    if (!cur) {
      throw new Error("undefined");
    }
    cur[st.name] = val;
  } else if (st.kind === "if") {
    const test = interpExpression(state, st.test);
    if (typeof test !== "boolean") {
      throw new Error("Condion not a boolean");
    }
    const block = { [PARENT_STATE_KEY]: state } as State;
    const branch = test ? st.truePart : st.falsePart;
    branch.forEach(s => interpStatement(block, s));
  } else if (st.kind === "while") {
    while (true) {
      const test = interpExpression(state, st.test);
      if (typeof test !== "boolean") {
        throw new Error("Condion not a boolean");
      }
      if (!test) {
        break;
      }
      const block = { [PARENT_STATE_KEY]: state } as State;
      st.body.forEach(s => interpStatement(block, s));
    }
  } else if (st.kind === "print") {
    console.log(interpExpression(state, st.expression));
  } else {
    throw new Error("unknown");
  }
}

export function interpProgram(program: Statement[]): State {
  const state: State = {};
  program.forEach(stmt => interpStatement(state, stmt));
  return state;
}

function helper(name: string, state: State): RuntimeValue {
  if (name in state) {
    return state[name];
  }
  if (state[PARENT_STATE_KEY]) {
    return helper(name, state[PARENT_STATE_KEY]!);
  }
  throw new Error("undefined");
}
