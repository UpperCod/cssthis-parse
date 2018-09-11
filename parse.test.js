let cssthis = require("./dist");
let cssnano = require("cssnano");
/**
 * :this and :global, share the same function that
 * generates the changes through a regular expression,
 * so for test reasons only the test was replicated
 * and the concatenation of className was eliminated
 */
describe("Tests by the prefix :this", () => {
    test("1: Replace the prefix :this", () => {
        return cssthis()(`:this{color:black}`).then(css => {
            expect(css).toBe("${props.id}{color:black}");
        });
    });

    test("2: Replace the :this(...args) prefix with arguments, selectors by tagName", () => {
        return cssthis()(`:this(h1,h2,h3){color:black}`).then(css => {
            expect(css).toBe(
                "h1${props.id}, h2${props.id}, h3${props.id}{color:black}"
            );
        });
    });

    test("3: Replace the :this(...args) prefix with arguments, selectors by attribute", () => {
        return cssthis()(`:this([title],[data-type=title]){color:black}`).then(
            css => {
                expect(css).toBe(
                    "${props.id}[title], ${props.id}[data-type=title]{color:black}"
                );
            }
        );
    });

    test("4: Replace the :this(...args) prefix with arguments, selectors by attribute", () => {
        return cssthis()(`:this(#id-1):not(h1){color:black}`).then(css => {
            expect(css).toBe("${props.id}#id-1:not(h1){color:black}");
        });
    });
});

describe("Tests by the prefix :global", () => {
    test("1: Replace the prefix :global", () => {
        return cssthis()(`:global h1{color:black}`).then(css => {
            expect(css).toBe("h1{color:black}");
        });
    });

    test("2: Replace the :global(...args) prefix with arguments, selectors by tagName", () => {
        return cssthis()(`:global(h1,h2,h3){color:black}`).then(css => {
            expect(css).toBe("h1, h2, h3{color:black}");
        });
    });

    test("3: Replace the :global(...args) prefix with arguments, selectors by attribute", () => {
        return cssthis()(
            `:global([title],[data-type=title]){color:black}`
        ).then(css => {
            expect(css).toBe("[title], [data-type=title]{color:black}");
        });
    });

    test("4: Replace the :global(...args) prefix with arguments, selectors by attribute", () => {
        return cssthis()(`:global(#id-1):not(h1){color:black}`).then(css => {
            expect(css).toBe("#id-1:not(h1){color:black}");
        });
    });
});

/**
 * For this type of test it was decided to add an additional
 * plugin to further complicate the comparison that would be
 * generated when coupling the plugins owned by postcss, cssnano has been used
 */
describe("Tests by the prefix this(<any>)", () => {
    test("1: Replace the prefix :this", () => {
        return cssthis([cssnano])(
            `
            :this{
                color:this(primary)
            }
        `
        ).then(css => {
            expect(css).toBe("${props.id}{color:${props.primary}}");
        });
    });
    test("2: Replace the prefix :this, on 2 opportunities", () => {
        return cssthis([cssnano])(
            `
            :this{
                color:this(primary) this(contrast)
            }
        `
        ).then(css => {
            expect(css).toBe(
                "${props.id}{color:${props.primary} ${props.contrast}}"
            );
        });
    });
});

describe("Test when applying :this as a prefix within the keyframes", () => {
    test("1: Replaced by group selector animation", () => {
        return cssthis([cssnano])(
            `
            :this{
                animation : move 1s ease all;
            }
            
            @keyframes move {
                0%{color:black}
                100%{color:orange}
            }
        `
        ).then(css => {
            expect(css).toBe(
                "${props.id}{animation:${props.cn}-move 1s ease all}@keyframes ${props.cn}-move{0%{color:#000}to{color:orange}}"
            );
        });
    });
    test("2: Replace by individual selector animation-name", () => {
        return cssthis([cssnano])(
            `
            :this{
                animation-name : move;
                animation-duration : 1s;
            }
            
            @keyframes move {
                0%{color:black}
                100%{color:orange}
            }
        `
        ).then(css => {
            expect(css).toBe(
                "${props.id}{animation-duration:1s;animation-name:${props.cn}-move}@keyframes ${props.cn}-move{0%{color:#000}to{color:orange}}"
            );
        });
    });
});
