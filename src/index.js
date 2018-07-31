import postcss from "postcss";

let prefix = {
    class: "${props.cn}"
};
/**
 * allows to iterate over a selector, based on the comma character,
 * escaping in the case that the character is between parentheses
 * @param {*} selector
 * @param {*} callback
 */
function map(selector, callback) {
    let escape = /\([^\)]+\)/g;
    return selector
        .replace(escape, all => all.replace(/\,/g, "@"))
        .split(/\,\s*/)
        .map((value, index) =>
            callback(
                value.replace(escape, all => all.replace(/\@/g, ",")),
                index
            )
        )
        .join(", ");
}
/**
 * replaces the state selector from the string: this
 * @param {string} selector
 * @return {string} selector
 */
function replace(selector) {
    return selector.replace(
        /:(this|global)(?:\(([^\)]+)\)){0,1}([^\s]*)(\s*)(.*)/g,
        (all, host, args, state, space, concat) => {
            let rootClassName = host === "global" ? "" : "." + prefix.class;
            if (/:(this|global)/.test(concat)) {
                concat = replace(concat);
            }
            if (args) {
                return map(
                    args,
                    selector =>
                        (/^[a-zA-Z]/.test(selector)
                            ? selector + rootClassName
                            : rootClassName + selector) +
                        state +
                        space +
                        concat
                );
            } else {
                return rootClassName + state + space + concat;
            }
        }
    );
}
/**
 * mutates the properties of the nodes given by postcss
 * @param {array} nodes
 * @param {boolean} deep - lets you control the depth of :this
 * @return {array} nodes
 */
function transform(nodes, deep) {
    return nodes.map(node => {
        switch (node.type) {
            case "rule":
                let { selector } = node;
                if (!deep) {
                    node.selector = map(selector, selector => {
                        if (!selector.indexOf(":global")) {
                            selector = selector.replace(/:global\s+/g, "");
                        } else {
                            selector = !selector.indexOf(":this")
                                ? selector
                                : ":this " + selector;
                        }
                        return replace(selector);
                    });
                }
                node.nodes = transform(node.nodes, true);
                break;
            case "atrule":
                if (/media/.test(node.name)) {
                    node.nodes = transform(node.nodes);
                }
                if (/keyframes/.test(node.name)) {
                    node.params = `${prefix.class}-${node.params}`;
                }
                break;
            case "decl":
                node.value = node.value.replace(
                    /this\(([^\)]+)\)/g,
                    (all, prop) =>
                        `\${props.${prop.replace(/[^a-zA-Z1-9\_]+/g, "")}}`
                );
                if (/animation$/.test(node.prop)) {
                    node.value = node.value.replace(
                        /[^\s]+/,
                        value => `${prefix.class}-${value}`
                    );
                }
                if (/animation-name$/.test(node.prop)) {
                    node.value = `${prefix.class}-${node.value}`;
                }
                break;
        }
        return node;
    });
}

export default function(plugins = []) {
    let instance = postcss(plugins);
    return style =>
        instance.process(style, { parser: postcss.parse }).then(css => {
            transform(css.root.nodes);
            return css.root.toString();
        });
}
