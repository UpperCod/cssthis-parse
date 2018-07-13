# cssthis-parse

Is a way to write component-oriented styles, transform your style into a template string for creating functions.

This is done by defragmenting the css using **postcss**

### Entry

```css
:this{
   font-size: 30px;
}
```

### Departure

```css
${prop.cn}{
   font-size: 30px;
}
```


## Why :this ?

**:this** is not a reserved word of the css language, it is not like **:host**, **:root** or **:scope**, these have a neutral definition for the css, and The goal of **:this** is not to clash with the evolution of language.

## Instance

```js
import parse from "cssthis-parse";
import autoprefixer from "autoprefixer";


let plugins = [autoprefixer()];

parse(plugins)(`
   :this{
       width : 200px;
       height : 200px;
   }
`).then((css)=>{
   console.log(css)
   /**
   .${props.cn}{
        width : 200px;
        height : 200px;
   }
   */
}).catch((error)=>{
   console.log(error)
})

```

## :this

**:this** allows you to point to the root class of the context, by using the variable `prop`, for **:this** the root class will be defined by `prop.cn`.



### Example 1

If **:this** is used as a function, it will create a list of selectors based on the given arguments

```css
/*----input----*/
:this(h1){
   color : black;
}
/*----output----*/
h1.${props.cn}{
   color : black;
}
```

### Example 2
the following example shows how **:this** can receive more than one argument regardless of its type

```css
/*----input----*/
:this(h1,h2,h3){
   color : black;
}
/*----output----*/
h1.${props.cn},
h2.${props.cn},
h3.${props.cn}{
   color : black;
}
```

### Example 3
You can also make **:this** act only if it is accompanied by the given class as an argument

```css
/*----input----*/
:this(.primary){
   color : black;
}
/*----output----*/
.${props.cn}.primary{
   color : black;
}
```

### example 4
You can also make **:this** act only when accompanied by one or more attributes

```css
/*----input----*/
:this([large]){
   width : 100%;
}
/*----output----*/
.${props.cn}[large]{
   width : 100%;
}
```

### Example 5
searches by attribute and class also work without the need to use parentheses

```css
/*----input----*/
:this[large]{
   width : 100%;
}
/*----output----*/
.${props.cn}[large]{
   width : 100%;
}
```

### Example 6
One of the advantages of using parentheses is that the selection by attribute is iterated until they are all completed

```css
/*----input----*/
:this(h1,h2):not([large]){
   width : 50%;
}
/*----output----*/
h1.${props.cn}:not([large]),
h2.${props.cn}:not([large]){
   width : 50%;
}
```

##: this and the context

default **:this** points only to the root of the context, but it must be understood that the whole context is governed by **:this**, so that you generate styles outside of **:this** continue belonging to the context.

### Example 1
The following example shows the effect that **:this** has on the button selector

```css
/*----input----*/
button{
   font-size : 20px;
}
/*----output----*/
.${props.cn} button{
   font-size : 20px;
}
```

### Example 2

in the following example it is taught that it has the same effect within the alrule @media, **:this** will always put its context first.

```css
/*----input----*/
@media (max-width: 300px){
   button{
       font-size : 20px;
   }
}
/*----output----*/
@media (max-width: 300px){
   .${props.cn} button{
       font-size : 20px;
   }
}
```

### Example 3
when working with keyframes again **:this** prefixes its context, adding the variable to each animation name only within the context.

```css
/*----input----*/
button{
   animation : move 1s ease all;
}
@keyframes move{
   0%{
       transform : translate(0px,0px);
   }
   100%{
       transform : translate(100px,100px);
   }
}
/*----output----*/
.${props.cn} button{
   animation : ${props.cn}-move 1s ease all;
}
@keyframes ${props.cn}-move{
   0%{
       transform : translate(0px,0px);
   }
   100%{
       transform : translate(100px,100px);
   }
}
```

## :global

using **:global** you can avoid using the context on the selector, it is useful to generate global classes

```css
/*----input----*/
:global button{
   font-size : 20px;
}
/*----output----*/
button{
   font-size : 20px;
}
```

> Using global button has been defined as a global rule, escaping the context of **:this**

## this in properties

You can also use **this** to use properties within the argument **prop**

```css
/*----input----*/
button{
  color : this(primary);
}
/*----output----*/
.${props.cn} button{
    color : ${props.primary};
}
```