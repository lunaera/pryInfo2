const { jsPDF } = window.jspdf;
import DataManager from "./DataManager.js";

document.addEventListener('DOMContentLoaded', function () {



    document.getElementById('PDFReport').addEventListener('click', async () => {
        try {
            const url = 'https://static.vecteezy.com/system/resources/previews/009/989/413/non_2x/stationery-with-ruler-pencil-pen-and-note-cartoon-icon-illustration-education-object-icon-concept-isolated-premium-flat-cartoon-style-vector.jpg';

            // devuelve una URL de datos conpatible con la librería JSPDF
            const datosImagen = await cargarImagen(url);

            // se puede usar directo pero con fallas si el navegador no permite restricciones CORS 
            //doc.addImage('https://detqhtv6m6lzl.cloudfront.net/HCLContenido/producto/FullImage/3417761811221-1.jpg', "JPEG", 0, 0, 30, 30);

            /**
             * Cross-Origin Resource Sharing (en español: Intercambio de Recursos de Origen Cruzado), y es un mecanismo de seguridad que implementan los navegadores para controlar qué recursos web pueden ser accedidos desde otro dominio.
             */



            // ==================CREAR EL PDF =========================0

            const doc = new jsPDF({  // version 3.0.1
                orientation: 'portrait', // postrait=> vertical 'landscape' = horizontal
                format: 'letter', // Formato de la página y respeta el amrgen inferior del pie de pagina
                unit: 'mm', // Unidades en milímetros, una hoja t/c tiene 21.59 mm de ancho y 27.94 de alto

                /*margin: {
                    top: 50, right: 50, bottom: 10, left: 10
                }*/
            });

            // Creamos el encabezado
            encabezado(doc, datosImagen);

            // ==============================AQUI YA PODEMOS PROBAR EL PDF CON   doc.save("documento.pdf");




            // ========= CONECTAR CON EL LOCALSTORAGE PARA CARGAR LA TABLA=========

            const objDataManager = new DataManager("Articulos");
            const articulos = objDataManager.readData();

            // Se usa un mapa por que necesitamos solo los valores de las propiedades del artículo
            // las propiedades es tal cual aparecen en el localstorage, devuelve un array con los valores
            const cuerpoTabla = articulos.map(articulos => [articulos.id, articulos.nombre, articulos.cantidad, articulos.descripcion, articulos.precio, articulos.categoria, articulos.tipoVenta]);
            //console.log(datosTabla);


            // ============ ESTE CÓDIGO FUNCIONA CON LA LIBRERIA jspdf-autotable 5.0.2

            // una hoja t/c tiene 21.59 (215.9) cm de ancho y 27.94 (279.4) de alto 
            //bjeto de configuración que define cómo debe verse y comportarse la tabla
            const optionsTable = {
                startY: 40, // 4 cm márgen superior de la tabla desde el borde del documento PDF
                theme: 'grid', // Estilo de la tabla (ver mas abajo estan otros ejemplos)
                headStyles: { // Estilos del encabezado de la tabla
                    fillColor: [41, 128, 185], // formato R, G, B
                    textColor: 255,
                    fontSize: 12,
                    font: 'Helvetica',
                    fontStyle: "bold",
                    halign: 'center' //halign es Horizontal aligment
                },
                //bodyStyles: { textColor: [255, 195, 0], fontSize: 8 }, // Estilos del cuerpo puede ser en RGB
                bodyStyles: { textColor: 0, fontSize: 8, font: 'Helvetica' }, // Estilos del cuerpo
            };


            doc.autoTable({
                head: [['ID', 'NOMBRE', 'CANTIDAD', 'DESCRIPCIÓN', 'PRECIO', 'CATEGORÍA', 'TIPO VENTA']],
                body: cuerpoTabla,
                ...optionsTable, // objeto de configuración que define cómo debe verse y comportarse la tabla, inyecta el codigo al autotable con el operador de propagación
                didParseCell: function (data) { // didParseCell permite el parse de cada celda antes de que se dibuje en el PDF

                    // para formatear a moneda, verifica que no sea la fila del encabezado, después busca las columnasa formatear
                    // if (data.section !== "head" && data.column.index === 2 || data.column.index === 4)
                    if (data.section !== "head" && data.column.index === 4) {
                        const precio = parseFloat(data.cell.raw); // Convierte el valor de la celda a un número
                        if (!isNaN(precio)) { // Verifica que sea un número válido
                            // Formatea el valor y lo agrega a la celda
                            data.cell.text = "$ " + precio.toFixed(2);
                        }
                    }
                }
            });

            // ================ HASTA AQUÍ TERMINA LA PARTE DE REPORTE DEL LOCAL STORAGE ===============


            // ================ EMPEZAMOS CON EL CONTEO DE LAS CATEGORÍAS ==================

            // recuperamos el total de cada categoría creando un objeto vacío para almacenar cada categoría con sus conteos
            const categoryCounts = {};

            for (const articulo of articulos) { // recorre la base de datos localstorage
                if (categoryCounts.hasOwnProperty(articulo.categoria)) { // verifica si ya tiene una propiedad con esa categoría
                    categoryCounts[articulo.categoria]++; // si ya lo tiene, entonces solo incrementa la unidad
                } else {
                    categoryCounts[articulo.categoria] = 1; // en caso contrario crea una nueva propiedad y le da el valor de 1
                }

            }
            console.log(categoryCounts);


            // ================ GRAFICAR LAS CATEGORÍAS =======================

            doc.addPage();
            encabezado(doc, datosImagen);

            // Crear gráfica de barras 
            const chartPosX = 10; // margen izquierdo 
            const chartPosY = 200; // margen superior hasta el inicio de la gráfica, 279 MM TOTAL VERTICAL DE LA HOJA
            const chartWidth = 180; // ancho total de la gráfica de barra
            const maxBarHeight = 100; // altura máxima de la gráfica de barras
            const barSpacing = 5; // espaciado entre columnas

            graficaBarras(doc, categoryCounts, chartPosX, chartPosY, chartWidth, maxBarHeight, barSpacing);


            // ========== NÚMEROS DE PÀGINA =========================

            doc.setFont("Helvetica", "bold"); // nueva libreria jspdf 3.0.1
            doc.setFontSize(10); // tamaño
            doc.setTextColor(118, 18, 4); // establece el color en RGB (0, 0, 255) 

            // Obtener el número total de páginas
            const totalPages = doc.internal.getNumberOfPages();

            // Agregar números de página a cada página
            for (let i = 1; i <= totalPages; i++) {
                // Ir a la página específica
                doc.setPage(i);
                //  si lo quieres centrado
                //doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

                // Agregar el número de página en la parte inferior derecha de la página
                doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
            }




            doc.save("documento.pdf");

        } catch (error) {
            console.log("Error" + error);
        }


    });

});

function cargarImagen(urlImg) {

    // Devuelve una promesa
    return new Promise(function (resolve, reject) {

        // se crea un objeto imagen para poder cargar la imagen en un canvas
        let img = new Image();

        // Permitir el acceso a la imagen desde un origen diferente (CORS) y vitar que se bloquee al cargar la imágen
        img.crossOrigin = "anonymous";

        img.onload = function () { // se ejecutará cuando se invoca img.src

            // se crea un nuevo lienzo para crear gráficos como imagenes 
            const canvas = document.createElement('canvas');

            // se obtiene un contexto para dibujar en el lienzo
            const ctx = canvas.getContext('2d');

            // TAMAÑO DE LA IMAGEN, AUNQUE NO ES NECESARIO POR QUE LO ESTWABLECE AL COLOCARLO EN EL PDF EN EL ENCABEZADO
            canvas.width = img.width; // se establece el ancho del lienzo que coincida con el ancho de la imagen
            canvas.height = img.height; // se establece el alto del lienzo que coincida con la altura de la imagen
            ctx.drawImage(img, 0, 0); // se dibuja la imagen en la posicion 0,0 osea a la izquierda


            // SI QUIERES CAMBIAR EL TAMAÑO DE LA IMAGEN

            // const nuevoAncho = 200; // por ejemplo, 200 píxeles
            // const nuevoAlto = 100;  // por ejemplo, 100 píxeles
            // canvas.width = nuevoAncho;
            // canvas.height = nuevoAlto;
            // ctx.drawImage(img, 0, 0, nuevoAncho, nuevoAlto);

            //Se convierte el contenido del lienzo en una URL de datos en formato JPEG compatible con la librería jsPDF
            const dataURL = canvas.toDataURL('image/JPG');

            //Se resuelve la promesa con la URL de datos de la imagen generada. 
            resolve(dataURL);
        };


        // en caso de que se genere un error al cargar la imagen se ejecuta onerror
        img.onerror = function () {
            reject(new Error('Falla al cargar la Imagen!'));
        };

        // inicia el proceso de carga de la imagen y se dispara onload cuando haya cargado la imagen
        // por tanto, el navegador ya sabe que hacer cuando busque en la url de la imagen
        img.src = urlImg;

    });
}


function encabezado(doc, datosImagen) {
    doc.setFont("Helvetica", "bold"); // fuente y estilo con nueva libreria 3.0.1 de jspdf
    doc.setFontSize(20); // tamaño de letra
    doc.setTextColor(0, 0, 255); // establece el color en RGB (0, 0, 255) azul

    /**
     * reporte de products es el título del pdf
     * doc.internal.pageSize.getWidth() / 2 => obtiene el ancho de la página y lo divide entre 2 para poder centrar
     * 20 unidades ==> es el espacio vertical en relación al margen superior
     * el titulo debe ser un array ["Reporte de productos", "texto 2"] para que funcione correctamente align 
     * tambien puede ser:   const lineas = ["Reporte de productos", "Catálogo actualizado - Mayo 2025"];
     * doc.text(lineas, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
     */
    doc.text(["Reporte de productos"], doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });


    // 0 0 significa coordenas x y y ------- 30 30 es el tamaño de la imagen w y h
    doc.addImage(datosImagen, 'JPEG', 0, 0, 30, 30);
}


function graficaBarras(doc, categoryCounts, chartPosX, chartPosY, chartWidth, maxBarHeight, barSpacing) {

    const categoryColors = {
        lapices: [0, 0, 255], // Azul
        borradores: [255, 0, 0], // Rojo
        lapiceros: [236, 51, 255], // lila
        libretas: [255, 240, 51], // amarillo
        marcadores: [51, 255, 249], // azul cielo
        hojas: [147, 255, 51], // limón
        juegos_didacticos: [0, 0, 205], // 
        rompecabezas: [255, 51, 131] // fuccia
    };

    //calcular el total de ancho de cada barra de la gráfica.
    //Object.keys(categoryCounts).length: devuelve el número total de categorías en el objeto categoryCounts
    const barWidth = (chartWidth - (barSpacing * (Object.keys(categoryCounts).length - 1))) / Object.keys(categoryCounts).length;
    console.log(barWidth); // imprime el ancho de cada barra


    // cuenta el valor máximo de cada categoría para ver quién tendrá la barra mas alta
    let maxCount = 0;
    for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) { // categoryCounts[hojas]>maxCount
            maxCount = categoryCounts[category];

        }
    }


    /**
     * barraActualEjeX: Esta variable lleva un seguimiento de la posición actual en el eje X donde se dibujará 
     * la próxima barra en el gráfico. Inicialmente se establece en chartPosX = 10, 
     * que es la posición horizontal donde comienza el gráfico de barras.
     */
    let barraActualEjeX = chartPosX;


    // =================== GRAFICANDO LAS BARRAS ========

    for (const category in categoryCounts) {
        // altura de cada barra: categoryCounts[hojas] / maxCount
        const barHeight = (categoryCounts[category] / maxCount) * maxBarHeight; //maxBarHeight:100

        // se le aplica un color a cada barra
        const colorBarra = categoryColors[category]; // se recupera el nombre del color
        doc.setFillColor(colorBarra[0], colorBarra[1], colorBarra[2]); // se le aplica el color RGB


        // dubuja el rectángulo en la posición (barraActualEjeX, chartPosY) con el ancho de la barra y la altura negativa porque debuja hacia arriba
        doc.rect(barraActualEjeX, chartPosY, barWidth, -barHeight, "F"); // la F indica que se debe colorear el rentángulo
        doc.setTextColor(0); // color de texto para el total de cada categoría
        doc.setFontSize(12); // tamaño de texto del total de cada categoría
        // 10 + (barWidth=41.25/2)-5=25.6                    200+5=205, valor de cada categoria
        // ejeX, ejeY, valor
        doc.text(barraActualEjeX + (barWidth / 2) - 5, chartPosY + 5, String(categoryCounts[category]));


        //lo mismo para las etiquetas de categoría pero para el eje Y se le suman otros 5
        //doc.setFontType("bolditalic");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.text(barraActualEjeX + (barWidth / 2) - 5, chartPosY + 10, category, { maxWidth: barWidth, align: "center" });


        // se actualiza la posición del eje X
        barraActualEjeX += barWidth + barSpacing;
    }
}