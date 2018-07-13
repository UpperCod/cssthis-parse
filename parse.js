let parse = require("./dist");

parse()(
    ` :this{
        width : 200px;
        height : 200px;
    }`
).then(css => {
    console.log(css);
});
