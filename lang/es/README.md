# parse-css-this

es una forma de escribir estilos orientada a componentes, transforma tu estilo en un string de plantilla para la creación de funciones.

Esto lo realiza desfragmentando el css mediante **postcss**

>Cssthis, ahora tambien acepta **:host**, como alias para **:this**.

### Entrada

```css
:this{
   font-size : 30px;
}
```

### Salida

```css
${prop.id}{
   font-size : 30px;
}
```


## ¿Por que :this?

**:this** no es una palabra reservada del lenguaje de css, no es como **:host**, **:root** o **:scope**, estas poseen una definición neutral para el css, y el objetivo de :this es no chocar con la evolución del  lenguaje.

## Instancia

```js
import parse from "parse-css-this";
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
   .${props.id}{
        width : 200px;
        height : 200px;
   }
   */
}).catch((error)=>{
   console.log(error)
})

```

## :this

**:this** permite apuntar hacia la clase de raíz del contexto, mediante el uso de la variable `prop`, para **:this** la clase de raíz será definida por `prop.id`.



### Ejemplo 1

Si **:this** es usado como función, creará una lista de selectores a base de los argumentos dados

```css
/*----input----*/
:this(h1){
   color : black;
}
/*----output----*/
h1.${props.id}{
   color : black;
}
```

### Ejemplo 2
el siguiente ejemplo enseña cómo **:this** puede recibir más de un argumento indiferente a su tipo
```css
/*----input----*/
:this(h1,h2,h3){
   color : black;
}
/*----output----*/
h1.${props.id},
h2.${props.id},
h3.${props.id}{
   color : black;
}
```

### Ejemplo 3
también ud puede hacer que **:this** actúa solo si se acompaña de la clase dada como argumento
```css
/*----input----*/
:this(.primary){
   color : black;
}
/*----output----*/
.${props.id}.primary{
   color : black;
}
```

### ejemplo 4
también ud puede hacer que **:this** actúa solo cuando se acompaña de uno o mas atributos 
```css
/*----input----*/
:this([large]){
   width : 100%;
}
/*----output----*/
.${props.id}[large]{
   width : 100%;
}
```

### Ejemplo 5
las búsquedas por atributo y clase también funcionan sin la necesidad de usar paréntesis
```css
/*----input----*/
:this[large]{
   width : 100%;
}
/*----output----*/
.${props.id}[large]{
   width : 100%;
}
```

### Ejemplo 6
una de las ventajas del el uso de paréntesis es que la selección por atributo se itera hasta completarlos todos
```css
/*----input----*/
:this(h1,h2):not([large]){
   width : 50%;
}
/*----output----*/
h1.${props.id}:not([large]),
h2.${props.id}:not([large]){
   width : 50%;
}
```

## :this y el contexto

por defecto **:this** apunta solo a la raíz del contexto, pero hay que entender que todo el contexto es regido por **:this**, por lo que ud al momento de generar estilos fuera de **:this** seguir perteneciendo al contexto.

### Ejemplo 1
en el siguiente ejemplo se enseña el efecto que posee **:this** sobre el selector button
```css
/*----input----*/
button{
   font-size : 20px;
}
/*----output----*/
.${props.id} button{
   font-size : 20px;
}
```
### Ejemplo 2
en el siguiente ejemplo se enseña que posee el mismo efecto dentro del alrule @media, **:this** siempre antepondrá su contexto.
```css
/*----input----*/
@media (max-width: 300px){
   button{
       font-size : 20px;
   }
}
/*----output----*/
@media (max-width: 300px){
   .${props.id} button{
       font-size : 20px;
   }
}
```
### Ejemplo 3
al momento de trabajar con keyframes nuevamente **:this** antepone su contexto, añadiendo la variable a cada nombre de animación solo dentro del contexto.
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
.${props.id} button{
   animation : ${props.is}-move 1s ease all;
}
@keyframes ${props.is}-move{
   0%{
       transform : translate(0px,0px);
   }
   100%{
       transform : translate(100px,100px);
   }
}
```

## :global

mediante **:global** ud puede evitar el uso del contexto sobre el selector, es útil para generar clases globales

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

> Mediante global button a sido definido como una regla global, escapando del contexto de **:this**

## this en propiedades

ud también  puede hacer uso de **this** para usar propiedades dentro del argumento **prop**
```css
/*----input----*/
button{
  color : this(primary);
}
/*----output----*/
.${props.id} button{
    color : ${props.primary};
}
```