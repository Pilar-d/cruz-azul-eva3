// Variable de estado para saber si el admin está logueado
let esAdminLogueado = false;
let idEdicionActual = null; // Guardará el ID del producto que estamos editando

// ==========================================
// 1. NAVEGACIÓN Y ACCESO
// ==========================================

function abrirLogin() {
    if (esAdminLogueado) {
        mostrarSeccion('admin');
    } else {
        document.getElementById('modal-login').classList.remove('hidden');
    }
}

function cerrarLogin() {
    document.getElementById('modal-login').classList.add('hidden');
}

function mostrarSeccion(seccion) {
    const inicio = document.getElementById('sec-inicio');
    const admin = document.getElementById('sec-admin');

    if(seccion === 'admin' && esAdminLogueado) {
        inicio.classList.add('hidden');
        admin.classList.remove('hidden');
        cargarProductos();
    } else {
        inicio.classList.remove('hidden');
        admin.classList.add('hidden');
        cargarProductos(); 
    }
}

document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;

    if(user === 'admin' && pass === 'cruzazul2026') {
        esAdminLogueado = true;
        cerrarLogin();
        document.getElementById('btn-admin').textContent = "Mi Panel Admin";
        document.getElementById('btn-logout').classList.remove('hidden');
        mostrarSeccion('admin');
    } else {
        alert('Acceso denegado: Credenciales incorrectas');
    }
});

function logout() {
    esAdminLogueado = false;
    location.reload();
}

// ==========================================
// 2. GESTIÓN DE PRODUCTOS (CREAR, EDITAR, ELIMINAR)
// ==========================================

// --- CREAR ---
function abrirModalAgregar() {
    document.getElementById('modal-agregar').classList.remove('hidden');
}

function cerrarModalAgregar() {
    document.getElementById('modal-agregar').classList.add('hidden');
    document.getElementById('form-agregar').reset();
}

document.getElementById('form-agregar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nuevo-nombre').value;
    const precio = document.getElementById('nuevo-precio').value;
    const stock = document.getElementById('nuevo-stock').value;

    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, stock })
        });
        if (response.ok) {
            cerrarModalAgregar();
            cargarProductos();
            alert('Producto añadido con éxito.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
});

// --- EDITAR ---
function abrirModalEditar(id, nombre, precio, stock) {
    idEdicionActual = id;
    document.getElementById('editar-nombre').value = nombre;
    document.getElementById('editar-precio').value = precio;
    document.getElementById('editar-stock').value = stock;
    document.getElementById('modal-editar').classList.remove('hidden');
}

function cerrarModalEditar() {
    document.getElementById('modal-editar').classList.add('hidden');
    document.getElementById('form-editar').reset();
    idEdicionActual = null;
}

document.getElementById('form-editar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('editar-nombre').value;
    const precio = document.getElementById('editar-precio').value;
    const stock = document.getElementById('editar-stock').value;

    try {
        const response = await fetch(`/api/productos/${idEdicionActual}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, stock })
        });

        if (response.ok) {
            cerrarModalEditar();
            cargarProductos();
            alert('Producto actualizado con éxito.');
        } else {
            alert('Error al actualizar el producto.');
        }
    } catch (error) {
        alert('Error al conectar con el servidor.');
    }
});

// --- ELIMINAR ---
async function eliminarProducto(id) {
    // Pedimos confirmación antes de borrar
    if (confirm('¿Estás seguro de que deseas eliminar este medicamento de la base de datos?')) {
        try {
            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                cargarProductos();
                alert('Producto eliminado correctamente.');
            } else {
                alert('Error al eliminar el producto.');
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        }
    }
}

// ==========================================
// 3. CARGA DINÁMICA DE DATOS (GET)
// ==========================================

async function cargarProductos() {
    const listaAdmin = document.getElementById('lista-productos');
    const catalogoPublico = document.getElementById('catalogo-publico');
    
    if (listaAdmin) listaAdmin.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-400">Consultando base de datos...</td></tr>';
    
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();
        
        if (listaAdmin) listaAdmin.innerHTML = '';
        if (catalogoPublico) catalogoPublico.innerHTML = '';

        productos.forEach(p => {
            if (listaAdmin) {
                // Aquí añadimos los botones funcionales de Editar y Eliminar usando el "p.id"
                listaAdmin.innerHTML += `
                    <tr class="border-b hover:bg-slate-50 transition">
                        <td class="p-4 font-medium text-slate-800">${p.nombre}</td>
                        <td class="p-4 text-blue-700 font-bold">$${p.precio}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'} rounded-md text-xs font-bold">
                                ${p.stock} uds
                            </span>
                        </td>
                        <td class="p-4 text-right">
                            <button onclick="abrirModalEditar(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock})" class="text-blue-600 hover:text-blue-800 text-sm font-bold mr-3">Editar</button>
                            <button onclick="eliminarProducto(${p.id})" class="text-red-500 hover:text-red-700 text-sm font-bold">Eliminar</button>
                        </td>
                    </tr>
                `;
            }

            if (catalogoPublico) {
                catalogoPublico.innerHTML += `
                    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all transform hover:-translate-y-1">
                        <div class="h-32 bg-slate-50 rounded-xl mb-4 flex items-center justify-center text-4xl">💊</div>
                        <h3 class="font-bold text-slate-800 mb-1">${p.nombre}</h3>
                        <p class="text-xs text-slate-500 mb-4">Disponible para entrega inmediata</p>
                        <div class="flex justify-between items-center border-t pt-4">
                            <span class="text-xl font-black text-blue-700">$${p.precio}</span>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition">Añadir</button>
                        </div>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

window.addEventListener('DOMContentLoaded', cargarProductos);
