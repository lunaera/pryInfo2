import Buttons from "./buttons.js";
import Articulo from "./Articulo.js";
import DataManager from "./DataManager.js";


document.addEventListener('DOMContentLoaded', function () {
    // Verifica si el usuario está autenticado
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = "login.html"; // Redirige al login si no está autenticado
        return; // evita que el resto del código se ejecute
    }


    // Ocultar la tabla al cargar la página
    ocultarTablaProductos(); // Llama a la función para ocultar la tabla

    // Capturar el evento de cambio en el rango y actualizar el valor del <output>
    document.getElementById('rngCantidad').addEventListener('input', function () {
        this.nextElementSibling.value = this.value;
    });

    let datosCeldas = []; // Array para almacenar los datos de las celdas


    // EVENTOS EN LOS BOTONES    

    document.getElementById('tbodyProductos').addEventListener('click', function (event) {
        // event contiene información sobre el evento que ocurrió
        // event.target.id accede al elemento (etiqueta) específico dentro de #tbodyProductos que fue clickeado.


        // ACCIONES DE LOS BOTONES

        if (event.target.id === 'btnEditar') {
            const rowEdit = event.target.closest('tr');
            const cells = rowEdit.querySelectorAll('td'); // Selecciona todas las celdas de la fila

            datosCeldas = []; // Reinicia el array de datos de celdas
            cells.forEach((cell, index) => {

                if (index < cells.length - 1 && index !== 0) { // Evita la última celda (acciones) y evita la celda del ID
                    const valorActual = cell.textContent; // Obtiene el valor actual de la celda
                    datosCeldas.push(valorActual); // Agrega el valor actual al array

                    const input = document.createElement('input'); // Crea un campo de entrada
                    input.type = 'text';
                    input.value = valorActual; // Establece el valor actual como predeterminado
                    input.className = 'form-control'; // Clase opcional para estilos
                    cell.textContent = ''; // Limpia el contenido de la celda anterior para colocar el input
                    cell.appendChild(input); // Agrega el campo de entrada a la celda
                }
            });

            // aqui funciona con tarjet porque es el elemento que disparó el evento
            Buttons.changeButtonEvent(event, Buttons.botones.btnSave.id, Buttons.botones.btnSave.ruta, Buttons.botones.btnSave.title); // Cambia el botón de editar a guardar

            // no funciona con getElementById porque no es un nodo de documento, es una celda
            const deleteButton = rowEdit.querySelector('#btnEliminar'); // Selecciona el botón de eliminar
            Buttons.changeButtonNotEvent(deleteButton, Buttons.botones.btnCancel.id, Buttons.botones.btnCancel.ruta, Buttons.botones.btnCancel.title); // Cambia el botón de eliminar a cancelar

            return; // Salir de la función después de editar
        }

        if (event.target.id.startsWith('btnEliminar')) {
            const rowDelete = event.target.closest('tr'); // Encuentra la fila más cercana al botón
            const id = rowDelete.querySelectorAll('td')[0].textContent; // Obtiene el ID de la celda correspondiente

            rowDelete.remove(); // Elimina la fila de la tabla

            dataManager.delete(id); // Elimina el objeto del sessionStorage

            // Ocultar la tabla si no hay más filas
            if (document.querySelectorAll('#tbodyProductos tr').length === 0) {
                ocultarTablaProductos();
            }
        }

        if (event.target.id === 'btnGuardar') {
            const rowSave = event.target.closest('tr');
            const id = rowSave.querySelectorAll('td')[0].textContent;
            const input = rowSave.querySelectorAll('input'); // Selecciona todas las celdas de la fila

            const newObjArticulo = new Articulo(); // Crear una nueva instancia de Articulo

            newObjArticulo.id = id; // Asigna el ID de la celda correspondiente
            newObjArticulo.nombre = input[0].value;
            newObjArticulo.cantidad = input[1].value;
            newObjArticulo.descripcion = input[2].value;
            newObjArticulo.precio = input[3].value;
            newObjArticulo.categoria = input[4].value;
            newObjArticulo.tipoVenta = input[5].value;



            dataManager.updateData(id, newObjArticulo); // Actualiza el objeto en sessionStorage
            const dbArticulos = dataManager.readData(); // Leer los datos de sessionStorage

            // obtener el cuerpo de la tabla
            const tbody = document.getElementById('tbodyProductos');

            // Agregar celdas con los valores del formulario
            agregarFilaTabla(dbArticulos, tbody);
            mostrarTablaProductos(); // Mostrar la tabla de productos
            return; // Salir de la función después de guardar
        }

        if (event.target.id === 'btnCancelar') {
            const rowCancel = event.target.closest('tr');
            const cells = rowCancel.querySelectorAll('input'); // Selecciona todas las celdas de la fila

            // Verifica que datosCeldas tenga los valores esperados
            if (datosCeldas.length !== cells.length) {
                console.error('El array datosCeldas no coincide con el número de celdas.');
                return; // Salir si hay un problema con los datos
            }

            cells.forEach((cell, index) => {
                if (index < cells.length) { // Evita la última celda (acciones)
                    const valorActual = datosCeldas[index]; // Obtiene el valor actual del campo de entrada
                    cell.parentNode.textContent = valorActual; // Establece el nuevo valor en la celda
                }
            });


            Buttons.changeButtonEvent(event, Buttons.botones.btnDelete.id, Buttons.botones.btnDelete.ruta, Buttons.botones.btnDelete.title); // Cambia el botón de cancelar a eliminar
            // no funciona con getElementById porque no es un nodo de documento, es una celda
            const saveButton = rowCancel.querySelector('#btnGuardar'); // Selecciona el botón de guardar
            Buttons.changeButtonNotEvent(saveButton, Buttons.botones.btnEdit.id, Buttons.botones.btnEdit.ruta, Buttons.botones.btnEdit.title); // Cambia el botón de guardar a editar
            return; // Salir de la función después de cancelar
        }

    });
});


const dataManager = new DataManager('Articulos'); // Crear una instancia de DataManager

document.getElementById('frmAltaProducto').addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el envío del formulario


    // Verificar si el formulario está válidado
    if (!this.checkValidity()) {
        this.classList.add('was-validated'); // Agrega estilos de validación de Bootstrap
        return; // Detiene la ejecución si el formulario no está válidado
    }

    // Obtener los datos del formulario. this hace referencia al formulario actual frmAltaProducto
    const formData = new FormData(this);


    // =====================lo hace el estudiante para validar que no se repita el id ===================
    const id = formData.get('txtIDArticulo'); // Obtener el ID del artículo
    console.log("form", id); // Imprimir el ID en la consola
    const dbSession = dataManager.readData(); // Leer los datos de sessionStorage

    const idExiste = dbSession.some(articulo => articulo.id === id);
    if (idExiste) {
        mostrarAlerta("El ID del artículo ya existe, por favor ingrese otro ID", "alert alert-danger");
        return;
    } // =============== hasta aquí


    const objArticulo = new Articulo(formData.get('txtIDArticulo'),
        formData.get('txtNombre'),
        formData.get('rngCantidad'),
        formData.get('txtDescripcion'),
        formData.get('txtPrecio'),
        formData.get('cboCategoria'),
        formData.get('rdbTipoVenta'));

    dataManager.createData(objArticulo); // Guardar el objeto en sessionStorage


    mostrarAlerta("Los datos han sido guardados exitosamente!!", "alert alert-success");
    resetearFormulario(this); // Llamar a la función para resetear el formulario

    //sessionStorage.setItem(formData.get('txtIDArticulo'), JSON.stringify([...formData.entries()]));
});


document.getElementById('btnShowProducts').addEventListener('click', function () {

    const dbArticulos = dataManager.readData(); // Leer los datos de sessionStorage

    // obtener el cuerpo de la tabla
    const tbody = document.getElementById('tbodyProductos');

    // Agregar celdas con los valores del formulario
    agregarFilaTabla(dbArticulos, tbody);
    mostrarTablaProductos(); // Mostrar la tabla de productos
});



document.getElementById('btnDeleteAllProducts').addEventListener('click', function () {
    dataManager.clear(); // Limpiar el sessionStorage
    ocultarTablaProductos();
});

const agregarFilaTabla = (dataSession, tbody) => {

    tbody.textContent = "";

    for (const articulo of dataSession) {
        const newRow = document.createElement('tr');

        const propiedades = ["id", "nombre", "cantidad", "descripcion", "precio", "categoria", "tipoVenta"];
        propiedades.forEach(propiedad => {
            createCell(newRow, articulo[propiedad]);
        });

        const actionsCell = document.createElement('td');
        const editButton = document.createElement('img');
        const deleteButton = document.createElement('img');
        // Crea el boton de guardar
        Buttons.crearBotonesAcciones(actionsCell, editButton, Buttons.botones.btnEdit.id, Buttons.botones.btnEdit.ruta, Buttons.botones.btnEdit.title);
        // Crea el boton de Eliminar
        Buttons.crearBotonesAcciones(actionsCell, deleteButton, Buttons.botones.btnDelete.id, Buttons.botones.btnDelete.ruta, Buttons.botones.btnDelete.title);

        // Agregar la celda de acciones a la fila
        newRow.appendChild(actionsCell);

        // Agregar la nueva fila al cuerpo de la tabla
        tbody.appendChild(newRow);
    }

}


function createCell(row, value) {
    const cell = document.createElement('td');
    cell.textContent = value;
    row.appendChild(cell);
}


// Funciones =====================================

function resetearFormulario(form) {
    form.reset();
    const rangoCantidad = document.getElementById('rngCantidad');
    rangoCantidad.value = 100; // Reinicia el valor del rango a 100
    rangoCantidad.nextElementSibling.value = rangoCantidad.value; // Sincroniza el <output> con el rango
}


function mostrarTablaProductos() {
    const divListaProductos = document.getElementById('divListaProductos');
    divListaProductos.style.display = 'block'; // Muestra la tabla
}

function ocultarTablaProductos() {
    const divListaProductos = document.getElementById('divListaProductos');
    divListaProductos.style.display = 'none'; // Oculta la tabla
}

function mostrarAlerta(msg, tipoAlerta) {
    try {

        const divresponseInformation = document.getElementById("responseInformation");
        divresponseInformation.textContent = msg;
        divresponseInformation.className = tipoAlerta;
        divresponseInformation.style.display = "block";
        divresponseInformation.classList.add("fade-in");

        setTimeout(() => {
            divresponseInformation.classList.add("fade-out");
            setTimeout(() => {
                divresponseInformation.style.display = "none";
                divresponseInformation.classList.remove("fade-in", "fade-out");
            }, 2000); // Tiempo de duración de la animación (1 segundo)
        }, 2000); // Tiempo de visualización del mensaje antes de desaparecer (2 segundos)

    } catch (error) {
        console.log("Error en mostrar alerta: " + error);
    }
}