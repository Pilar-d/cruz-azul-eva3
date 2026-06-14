let productoEditandoId = null;

function mostrarSeccion(seccion) {
    document.getElementById('sec-inicio').classList.add('hidden');
    document.getElementById('sec-admin').classList.add('hidden');
    document.getElementById(`sec-${seccion}`).classList.remove('hidden');
    if(seccion === 'admin' && localStorage.getItem('token')) cargarProductos();
}

function abrirLogin() { document.getElementById('modal-login').classList.remove('hidden'); }

function cerrarLogin() {
    document.getElementById('modal-login').classList.add('hidden');
    volverCredenciales();
}

function volverCredenciales() {
    document.getElementById('form-login-step2').classList.add('hidden');
    document.getElementById('form-login-step1').classList.remove('hidden');
}

function abrirModalAgregar() { document.getElementById('modal-agregar').classList.remove('hidden'); }
function cerrarModalAgregar() {
    document.getElementById('modal-agregar').classList.add('hidden');
    document.getElementById('form-agregar').reset();
}

// <-- NUEVO: Cargar datos en el modal de edición
function abrirModalEditar(id, nombre, precio, stock) {
    productoEditandoId = id;
    document.getElementById('editar-nombre').value = nombre;
    document.getElementById('editar-precio').value = precio;
    document.getElementById('editar-stock').value = stock;
    document.getElementById('modal-editar').classList.remove('hidden');
}

function cerrarModalEditar() {
    document.getElementById('modal-editar').classList.add('hidden');
    document.getElementById('form-editar').reset();
    productoEditandoId = null;
}

function obtenerCabeceras() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    };
}

// <-- MODIFICADO: Login Paso 1 (Llama al backend para enviar correo)
async function mostrarMFA() {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    
    if (user && pass) {
        try {
            const response = await fetch('/login-step1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });
            
            if (response.ok) {
                document.getElementById('form-login-step1').classList.add('hidden');
                document.getElementById('form-login-step2').classList.remove('hidden');
                alert("Te hemos enviado un código de seguridad a tu correo.");
            } else {
                alert("Credenciales incorrectas.");
            }
        } catch (e) {
            console.error("Error conectando al servidor");
        }
    }
}

// <-- MODIFICADO: Login Paso 2 (Verifica el PIN)
async function ejecutarLoginMFA() {
    const user = document.getElementById('user').value;
    const mfa = document.getElementById('mfa-code').value;

    try {
        const response = await fetch('/login-step2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, mfa: mfa })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            cerrarLogin();
            mostrarSeccion('admin');
            document.getElementById('btn-admin').classList.add('hidden');
            document.getElementById('btn-logout').classList.remove('hidden');
            cargarProductos();
        } else {
            alert(data.error || "Código MFA incorrecto.");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function cerrarSesionSegura() {
    localStorage.removeItem('token');
    mostrarSeccion('inicio');
    document.getElementById('btn-logout').classList.add('hidden');
    document.getElementById('btn-admin').classList.remove('hidden');
    document.getElementById('user').value = '';
    document.getElementById('pass').value = '';
    document.getElementById('mfa-code').value = '';
}

async function cargarProductos() {
    try {
        const response = await fetch('/productos', { headers: obtenerCabeceras() });
        if (response.status === 401 || response.status === 403) return cerrarSesionSegura();
        
        const productos = await response.json();
        const tbody = document.getElementById('lista-productos');
        const catalogo = document.getElementById('catalogo-publico');
        
        tbody.innerHTML = ''; 
        catalogo.innerHTML = ''; 

        productos.forEach(prod => {
            // <-- NUEVO: Agregado el botón "Editar" en la tabla
            tbody.innerHTML += `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-4 text-slate-500">${prod.id}</td>
                    <td class="p-4 font-medium text-slate-800">${prod.nombre}</td>
                    <td class="p-4 text-blue-700 font-semibold">$${prod.precio}</td>
                    <td class="p-4">${prod.stock} un.</td>
                    <td class="p-4 text-right">
                        <button class="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1 bg-blue-50 rounded-md mr-2" 
                            onclick="abrirModalEditar(${prod.id}, '${prod.nombre}', ${prod.precio}, ${prod.stock})">Editar</button>
                        <button class="text-red-600 hover:text-red-800 font-semibold text-sm px-2 py-1 bg-red-50 rounded-md" 
                            onclick="eliminarProducto(${prod.id})">Eliminar</button>
                    </td>
                </tr>
            `;

            catalogo.innerHTML += `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg text-slate-800 mb-1">${prod.nombre}</h3>
                        <p class="text-slate-500 text-sm mb-3">Stock: ${prod.stock} unidades.</p>
                    </div>
                    <span class="text-2xl font-black text-blue-600">$${prod.precio}</span>
                </div>
            `;
        });
    } catch (e) { console.error(e); }
}

document.getElementById('form-agregar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nuevo-nombre').value;
    const precio = document.getElementById('nuevo-precio').value;
    const stock = document.getElementById('nuevo-stock').value;
    await fetch('/productos', { method: 'POST', headers: obtenerCabeceras(), body: JSON.stringify({ nombre, precio, stock }) });
    cerrarModalAgregar();
    cargarProductos();
});

// <-- NUEVO: Enviar los datos editados al backend (PUT)
document.getElementById('form-editar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('editar-nombre').value;
    const precio = document.getElementById('editar-precio').value;
    const stock = document.getElementById('editar-stock').value;
    
    await fetch(`/productos/${productoEditandoId}`, { 
        method: 'PUT', 
        headers: obtenerCabeceras(), 
        body: JSON.stringify({ nombre, precio, stock }) 
    });
    
    cerrarModalEditar();
    cargarProductos();
});

async function eliminarProducto(id) {
    if (confirm("¿Eliminar este medicamento?")) {
        await fetch(`/productos/${id}`, { method: 'DELETE', headers: obtenerCabeceras() });
        cargarProductos();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Almacenar las variables de los formularios globales para usarlas en JS
    window.mostrarMFA = mostrarMFA;
    window.ejecutarLoginMFA = ejecutarLoginMFA;
    if(localStorage.getItem('token')) cargarProductos();
});
