export default class DataManager {
    constructor(keyLocal) {
        this.keyLocal = keyLocal;
        // inicializa la localStorage si no existe con un aray vacio
        // convierte el string a un objeto JSON
        this.dblocal = JSON.parse(localStorage.getItem(this.keyLocal)) || [];
    }

    // CREATE
    createData(objArticulo) {
        // agrega el objeto al array
        this.dblocal.push(objArticulo);
        // convierte el array a un string formato JSON y lo guarda en localStorage
        localStorage.setItem(this.keyLocal, JSON.stringify(this.dblocal));
    }

    //READ
    readData() {
        // convierte el string a un objeto JSON y lo devuelve
        return this.dblocal;
    }

    //UPDATE
    updateData(id, objArticulo) {
        // busca el objeto por id y lo actualiza
        this.dblocal = this.dblocal.map((articulo) => {

            if (articulo.id === id) {
                // devuelve un objeto actualizado
                return { ...articulo, ...objArticulo }; // mediante la propagación se actualizan los valores del objeto
                // cada propiedad del objeto articulo es reemplazada por el valor del nuevo objeto objArticulo
            }
            return articulo; // en caso de que el id no coincida, devuelve el objeto original almacenado en la session
        });

        // convierte el array a un string y lo guarda en localStorage
        localStorage.setItem(this.keyLocal, JSON.stringify(this.dblocal));
    }

    //DELETE
    delete(idArticulo) {
        // filtra el array y elimina el objeto con el id correspondiente, 
        // es decir devuelve un nuevo array sin el objeto que se quiere eliminar
        this.dblocal = this.dblocal.filter((articulo) => articulo.id !== idArticulo);
        // convierte el array a un string y lo guarda en localStorage
        localStorage.setItem(this.keyLocal, JSON.stringify(this.dblocal));
    }

    //CLEAR
    clear() {
        // limpia el localStorage
        //localStorage.clear(); // limpia todo el localStorage
        localStorage.removeItem(this.keyLocal); // limpia solo el item correspondiente a la keyLocal

        // inicializa la localStorage si no existen datos lo hace con un array vacío
        this.dblocal = JSON.parse(localStorage.getItem(this.keyLocal)) || [];
        // this.dblocal = []; // otra forma de inicializar el array vacío
    }
}