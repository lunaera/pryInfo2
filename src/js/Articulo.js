export default class Articulo {
    constructor(id, nombre, cantidad, descripcion, precio, categoria, tipoVenta) {
        this.id = id;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.descripcion = descripcion;
        this.precio = precio;
        this.categoria = categoria;
        this.tipoVenta = tipoVenta;
    }
}