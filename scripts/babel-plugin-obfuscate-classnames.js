import fs from "node:fs";
import path from "node:path";

export default ({ types: t }) => {
    const classMap = JSON.parse(fs.readFileSync(path.resolve("./.cache/classnames-map.json"), "utf8"));
    const obfuscateClassString = str => {
        return str.split(/\s+/).map(cls => classMap[cls] || cls).join(" ");
    };

    return {
        visitor: {
            JSXAttribute(path) {
                if (path.node.name.name === "className") {
                    const value = path.node.value;
                    if (t.isStringLiteral(value)) {
                        value.value = obfuscateClassString(value.value);
                    }
                    else if (t.isJSXExpressionContainer(value)) {
                        // handle logical expressions: className={props.className || "foo bar"}
                        if (t.isLogicalExpression(value.expression)) {
                            if (t.isStringLiteral(value.expression.right)) {
                                value.expression.right.value = obfuscateClassString(value.expression.right.value);
                            }
                        }
                        // handle string literals directly: className={"foo bar"}
                        else if (t.isStringLiteral(value.expression)) {
                            value.expression.value = obfuscateClassString(value.expression.value);
                        }
                    }
                }
            },
            // Handles: const obj = { className: "foo bar" }
            ObjectProperty(path) {
                const key = path.node.key;
                const value = path.node.value;
                if (
                    ((t.isIdentifier(key) && key.name === "className") ||
                    (t.isStringLiteral(key) && key.value === "className")) &&
                    t.isStringLiteral(value)
                ) {
                    value.value = obfuscateClassString(value.value);
                }
            },
            CallExpression(path) {
                if (path.node.callee.name === "classNames") {
                    path.node.arguments.forEach(arg => {
                        // handle when arguments are string literals
                        if (t.isStringLiteral(arg)) {
                            arg.value = obfuscateClassString(arg.value);
                        }
                        // handle when arguments are object expressions
                        else if (t.isObjectExpression(arg)) {
                            arg.properties.forEach(prop => {
                                if (t.isStringLiteral(prop.key)) {
                                    prop.key = t.stringLiteral(obfuscateClassString(prop.key.value));
                                }
                            });
                        }
                    });
                }
            },
        },
    };
};
