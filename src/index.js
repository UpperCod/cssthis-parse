import postcss from "postcss";

let prefix = {
    class: "${props.cn}"
};

function map(selector, callback) {
    return selector
        .split(/\,\s*/)
        .map(callback)
        .join(", ");
}

function createSelector(selector) {
    return selector.replace(
        /(:this)(?:\(([^\)]+)\)){0,1}([^\s]*)(\s*)(.*)/g,
        (all, host, args, state, space, concat) => {
            if (args) {
                return map(
                    args,
                    selector =>
                        (/^[a-zA-Z]/.test(selector)
                            ? `${selector}.${prefix.class}`
                            : `.${prefix.class}${selector}`) +
                        state +
                        space +
                        concat
                );
            } else {
                return `.${prefix.class}` + state + space + concat;
            }
        }
    );
}

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
                        return createSelector(selector);
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
