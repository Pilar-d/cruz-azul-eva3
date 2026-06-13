document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/pacientes')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('lista-pacientes');
            data.forEach(paciente => {
                const li = document.createElement('li');
                li.textContent = `${paciente.nombre} - RUT: ${paciente.rut} (${paciente.prevision})`;
                lista.appendChild(li);
            });
        })
        .catch(error => console.error('Error cargando pacientes:', error));
});