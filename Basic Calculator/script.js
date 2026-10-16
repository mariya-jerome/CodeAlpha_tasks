const display = document.getElementById("display");
const preview = document.getElementById("preview");
const buttons = document.querySelector(".buttons");

let expression = "";
let finished = false;
let error = false;

// Update the display
function updateDisplay() {
    display.value = expression || "0";
    preview.textContent = "";

    if (expression && !/[+\-*/.]$/.test(expression) && /[+\-*/]/.test(expression)) {
        try {
            preview.textContent = `= ${calculateExpression(expression)}`;
        } catch {
            preview.textContent = "";
        }
    }
}

// Safely calculate an arithmetic expression
function calculateExpression(input) {
    const tokens = input.match(/\d*\.?\d+|[+\-*/]/g);

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function number() {
        if (tokens[position] === "+") {
            position++;
            return number();
        }

        if (tokens[position] === "-") {
            position++;
            return -number();
        }

        const token = tokens[position];

        if (!token || !/^\d*\.?\d+$/.test(token)) {
            throw new Error("Invalid expression");
        }

        position++;
        return Number(token);
    }

    function term() {
        let result = number();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {
            const operator = tokens[position++];
            const next = number();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = operator === "*"
                ? result * next
                : result / next;
        }

        return result;
    }

    function sum() {
        let result = term();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            const operator = tokens[position++];
            const next = term();

            result = operator === "+"
                ? result + next
                : result - next;
        }

        return result;
    }

    const result = sum();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid expression");
    }

    return Number(result.toPrecision(12));
}

// Handle all calculator buttons
buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        expression = "";
        finished = false;
        error = false;
        updateDisplay();
        return;
    }

    if (action === "delete") {
        if (finished || error) {
            expression = "";
            finished = false;
            error = false;
        } else {
            expression = expression.slice(0, -1);
        }

        updateDisplay();
        return;
    }

    if (action === "calculate") {
        if (!expression || /[+\-*/.]$/.test(expression)) {
            return;
        }

        try {
            const result = calculateExpression(expression);

            expression = String(result);
            finished = true;
            error = false;
            updateDisplay();
        } catch (err) {
            display.value = err.message;
            expression = "";
            finished = false;
            error = true;
        }

        return;
    }

    if (action === "decimal") {
        if (finished || error) {
            expression = "";
            finished = false;
            error = false;
        }

        const current = expression.split(/[+\-*/]/).pop();

        if (!current.includes(".")) {
            expression += current === "" ? "0." : ".";
        }

        updateDisplay();
        return;
    }

    if (action === "sign") {
        if (!expression || /[+\-*/.]$/.test(expression)) {
            return;
        }

        const match = expression.match(/\d*\.?\d+$/);

        if (match) {
            const start = match.index;
            const previous = expression[start - 1];

            if (
                previous === "-" &&
                (start - 1 === 0 ||
                 /[+\-*/]/.test(expression[start - 2] || ""))
            ) {
                expression =
                    expression.slice(0, start - 1) +
                    expression.slice(start);
            } else {
                expression =
                    expression.slice(0, start) +
                    "-" +
                    expression.slice(start);
            }

            finished = false;
            updateDisplay();
        }

        return;
    }

    if (value === "%") {
        if (!expression || /[+\-*/.]$/.test(expression)) {
            return;
        }

        try {
            expression = String(
                Number((calculateExpression(expression) / 100).toPrecision(12))
            );

            finished = false;
            updateDisplay();
        } catch (err) {
            display.value = err.message;
            expression = "";
            error = true;
        }

        return;
    }

    if (value !== undefined) {
        if (error) {
            expression = "";
            error = false;
        }

        if (finished) {
            if (/^\d$/.test(value) || value === ".") {
                expression = "";
            }

            finished = false;
        }

        if (/^\d$/.test(value)) {
            const current = expression.split(/[+\-*/]/).pop();

            if (current === "0") {
                expression = expression.slice(0, -1) + value;
            } else {
                expression += value;
            }
        } else if (["+", "-", "*", "/"].includes(value)) {
            const last = expression.slice(-1);

            if (/[+\-*/]$/.test(last)) {
                if (value === "-" && last !== "-") {
                    expression += value;
                } else if (expression.length > 1) {
                    expression = expression.slice(0, -1) + value;
                }
            } else if (expression !== "") {
                expression += value;
            }
        }

        updateDisplay();
    }
});

// Keyboard support
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^\d$/.test(key)) {
        document.querySelector(
            `button[data-value="${key}"]`
        ).click();
    } else if (["+", "-", "*", "/"].includes(key)) {
        document.querySelector(
            `button[data-value="${key}"]`
        ).click();
    } else if (key === ".") {
        document.querySelector(
            'button[data-action="decimal"]'
        ).click();
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        document.querySelector(
            'button[data-action="calculate"]'
        ).click();
    } else if (key === "Backspace") {
        document.querySelector(
            'button[data-action="delete"]'
        ).click();
    } else if (key === "Escape" || key === "Delete") {
        document.querySelector(
            'button[data-action="clear"]'
        ).click();
    } else if (key === "%") {
        document.querySelector(
            'button[data-value="%"]'
        ).click();
    }
});

updateDisplay();
