const API_URL = "http://localhost:3000/productos"; 

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

//  Función para cargar los productos en la tabla
function cargarProductos() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById("productosTabla");
            tabla.innerHTML = ""; // Limpiar la tabla antes de recargar
            
            data.forEach(producto => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.stock}</td>
                    <td>
                        <button onclick="editarProducto(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock})">✏️ Editar</button>
                        <button onclick="eliminarProducto(${producto.id})"> Eliminar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => console.error("Error al cargar productos:", error));
}

//  Función para agregar un nuevo producto
document.getElementById("formProducto").addEventListener("submit", function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, precio: precio, stock: stock })
    })
    .then(response => response.json())
    .then(() => {
        cargarProductos(); // Recargar la tabla
        this.reset(); // Limpiar formulario
    })
    .catch(error => console.error("Error al agregar producto:", error));
});

//  Función para eliminar un producto
function eliminarProducto(id) {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
        .then(response => response.json())
        .then(() => cargarProductos()) // Recargar la tabla
        .catch(error => console.error("Error al eliminar producto:", error));
    }
}

//  Función para abrir el modal y editar un producto
function editarProducto(id, nombre, precio, stock) {
    document.getElementById("editId").value = id;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editPrecio").value = precio;
    document.getElementById("editStock").value = stock;
    
    document.getElementById("modal").style.display = "flex";
}

//  Función para actualizar un producto
document.getElementById("btnActualizar").addEventListener("click", function() {
    const id = document.getElementById("editId").value;
    const nombre = document.getElementById("editNombre").value;
    const precio = document.getElementById("editPrecio").value;
    const stock = document.getElementById("editStock").value;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, precio: precio, stock: stock })
    })
    .then(response => response.json())
    .then(() => {
        cargarProductos(); // Recargar la tabla
        document.getElementById("modal").style.display = "none"; // Cerrar el modal
    })
    .catch(error => console.error("Error al actualizar producto:", error));
});

//  Cerrar el modal cuando se haga clic en la "X"
document.querySelector(".close").addEventListener("click", function() {
    document.getElementById("modal").style.display = "none";
});
