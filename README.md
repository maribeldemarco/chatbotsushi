# chatbotsushi
Chatbot para pedidos de sushi


# Chatbot para Pedido de Sushi

Este proyecto implementa un chatbot que permite a los usuarios realizar pedidos de sushi, obtener información sobre el menú y gestionar sus órdenes de manera interactiva. Está desarrollado con **Node.js**, **Express**, **MongoDB**, y **React**.

# Requisitos

- Node.js (v16 o superior)
- MongoDB (en la nube, MongoDB Atlas)


# Sugerencias
En la carpeta principal del proyecto correr: npm install --save-dev nodemon
Permite reiniciar el servidor automáticamente ante cambios detectados en la interfaz de usuario


# Cómo instalar y correr el proyecto

Backend
1. Clona el repositorio :
   Desde tu terminal de Visual Studio Code: 
 Corre el comando  git clone https://github.com/maribeldemarco/chatbotsushi
2.Luego instala las dependencias con el comando npm install 
   
3. Configura las variables de entorno:
   Crea un archivo .env en la raíz del proyecto y agregá lo siguiente:
   
   DATABASE_URL=


Deberás antes seguir estos pasos para saber que es lo que colocarás en DATABASE_URL=


1.Inicia sesión en tu cuenta de MongoDB Atlas.
2.Selecciona el clúster al que deseas conectarte.
3.En la parte superior, encontrarás un botón que dice "Connect".
4.Elige el método de conexión que prefieras (por ejemplo, "MongoDB for VS Code").
5.Copia la cadena de conexión que aparece en esa sección.

Entonces  tu archivo .env quedaria así
Ejemplo: 
DATABASE_URL=mongodb+srv://usuario:<db_password>@cluster0.yw9cs.mongodb.net/chatbotsushi


4. Inicia el servidor: en la carpeta principal del proyecto

Corre el comando node server.js para que corra el servidor con Node
En caso de tener instalado nodemon correr el comando nodemon server.js 

El servidor se ejecutará en `http://localhost:5000`.


Frontend
1. Accede a la carpeta del frontend:
Con el comando   cd chatbot
   
2. Instala las dependencias:
  Con el comando  npm install
   
3. Inicia el servidor del frontend:
 Con el comando   npm start
   
El frontend se ejecutará en `http://localhost:3000`.


# Ejemplos de mensajes que entiende el bot

El chatbot responde a varios tipos de mensajes. Aquí algunos ejemplos:

*Consulta del menú*
- Usuario: “Menú"
- Bot: "Estos son los productos disponibles. Elige tu producto para realizar el envio”

*Realizar un pedido*
- Usuario: "Pedido."
- Bot: Informa cómo realizar un pedido

*Cancelar un pedido*
- Usuario: "Cancelar"
- Bot: Regresa al menú principal

*Preguntas frecuentes*
- Usuario: "Faq."
- Bot: Brinda opciones sobre: horarios, dirección del local de Sushi.

*Consulta de promos*
- Usuario: "Promo."
- Bot: Brinda info de la promo vigente.



# Endpoints disponibles

/api/chatbot
Se obtiene acceso al chatbot

 # Base de Datos
Utilizamos esta base de datos en la nube con Mongo DB https://www.mongodb.com/products/platform/atlas-database


# *Estructura de los datos*
-Una colección de pedidos (no hace falta crearlo ya que el código proporciona su implementación una vez que desde la interfaz de usuario se agrega el producto)
-Una colección de productos

# *Colección: `productos`*
Cada documento representa un producto en el menú.

# *Colección: `pedidos`*
Cada documento representa un pedido realizado por un usuario.

Cómo cargar los datos iniciales?

1. Regístrate en MongoDB Atlas: cloud.mongodb.com
2. Crea un Cluster: Este es el entorno que contiene tu base de datos.
3. Crea tu base de datos: Haz clic en "Create Database".
4. Crea la colección de productos en la sección "Collections"
5. Inserta los datos de ejemplo en la colección “productos”


# Datos de ejemplo
2. Inserta los datos de ejemplo en la colección `productos`:

     {
descripcion:"10 piezas de riquisimo sushi roll con salmón, palta y arroz"
nombre: "Sushi Roll"
precio: 10999
     },
   {
descripcion:"6 piezas de sushi con carne de res marinada en salsa Malbec, acompañad…"
nombre:"Sushi de carne al malbec"
precio:9199
   },
    {
nombre:"Sushi veggie"
precio:9999
descripcion:"12 Sushi de vegetales frescos como zanahoria, palta y alga nori"
      },
    {
descripcion:"12 piezas Sushi de camarón con arroz, mayonesa y salsa teriyaki"
nombre:"Camaron Sushi"
precio:7999
 },
 {
descripcion:"6 piezas de atún fresco, pepino y arroz, acompañado de salsa de soya"
nombre:"Sushi Atun"
precio:8100
}


   





