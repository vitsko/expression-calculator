module.exports = {
    expressionCalculator
}

function expressionCalculator(expr) {
    if (!check(expr, [['(', ')']])) {
        throw new Error("ExpressionError: Brackets must be paired");
    }

    const token = getToken(expr);
    return parseFloat(eval(token)[0]);
}

let ERROR = -1;
let OPENED = 0;
let CLOSED = 1;
let DOUBLED = 2;

function check(str, bracketsConfig) {
    let stack = [];

    for (let i = 0; i < str.length; i++) {
        bracket = getBracket(str[i], bracketsConfig);

        if (bracket.type == DOUBLED) {
            if (stack.length && bracket.position == stack[stack.length - 1]) {
                stack.pop();
            } else {
                stack.push(bracket.position);
            }
        } else if (bracket.type == OPENED) {
            stack.push(bracket.position);
        } else if (bracket.type == CLOSED) {
            if (stack.length && bracket.position == stack[stack.length - 1]) {
                stack.pop();
            } else {
                return false;
            }
        }
    }

    return stack.length == 0;
}

function getBracket(bracket, bracketsConfig) {
    for (let i = 0; i < bracketsConfig.length; i++) {
        if (bracket == bracketsConfig[i][0] && bracketsConfig[i][0] == bracketsConfig[i][1]) {
            return { 'position': i, 'type': DOUBLED };
        } else if (bracket == bracketsConfig[i][0]) {
            return { 'position': i, 'type': OPENED };
        } else if (bracket == bracketsConfig[i][1]) {
            return { 'position': i, 'type': CLOSED };
        }
    }

    return { 'position': -1, 'type': ERROR };
}

const expressionElements = '+-*/()';

function getToken(expression) {
    let tokens = [];
    let current = '';

    for (let i = 0; i < expression.length; ++i) {
        if (expression[i] === ' ') {
            continue;
        }

        if (expressionElements.indexOf(expression[i]) !== -1) {
            if (current.length) {
                tokens.push(current);
            }

            tokens.push(expression[i]);
            current = '';
        } else {
            current = current.concat(expression[i]);
        }
    }

    if (current.length) {
        tokens.push(current);
    }

    return tokens;
}

function eval(expression) {
    if (expression[0] === "(" && expression[-1] === ")") {
        expression.pop();
        expression.shift();
    }

    while (expression.length !== 1) {
        //Скобки
        let stack = [];
        let write = false;
        let from, to;

        let cont = false;
        let depth = 0;

        for (let i = 0; i < expression.length; ++i) {
            if (expression[i] === "(" || expression[i] === ")") {
                if (expression[i] === "(") {
                    write = true;

                    if (!depth) {
                        from = i;
                    }

                    if (depth) {
                        stack.push(expression[i]);
                    }

                    depth++;
                } else {
                    depth--;

                    if (!depth) {
                        write = false;
                        to = i;
                        expression.splice(from, to - from + 1, eval(stack)[0]);
                        stack = [];
                        cont = true;

                        break;
                    }

                    stack.push(expression[i]);
                }
            } else if (write) {
                stack.push(expression[i]);
            }
        }

        if (cont) {
            cont = false;
            continue;
        }

        //Умножение-деление
        for (let i = 0; i < expression.length; ++i) {
            if (expression[i] === '*') {
                expression.splice(i - 1, 3, parseFloat(expression[i - 1]) * parseFloat(expression[i + 1]));
                cont = true;
                break;
            } else if (expression[i] === '/') {
                if (!parseFloat(expression[i + 1])) {
                    throw new Error("TypeError: Division by zero.");
                }

                expression.splice(i - 1, 3, parseFloat(expression[i - 1]) / parseFloat(expression[i + 1]));
                cont = true;
                break;
            }
        }

        if (cont) {
            cont = false;
            continue;
        }

        //Сложение-вычитание
        for (let i = 0; i < expression.length; ++i) {
            if (expression[i] === '+') {
                expression.splice(i - 1, 3, parseFloat(expression[i - 1]) + parseFloat(expression[i + 1]));
                cont = true;
                break;
            } else if (expression[i] === '-') {
                expression.splice(i - 1, 3, parseFloat(expression[i - 1]) - parseFloat(expression[i + 1]));
                cont = true;
                break;
            }
        }

        if (cont) {
            cont = false;
            continue;
        }
    }

    return expression;
}