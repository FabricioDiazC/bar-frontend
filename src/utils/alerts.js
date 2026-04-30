import Swal from 'sweetalert2';

// Alerta de Confirmación para borrado
export const confirmDelete = async (itemName) => {
  const result = await Swal.fire({
    title: `¿Eliminar ${itemName}?`,
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#3f3f46',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1E1E1E',
    color: '#EAEAEA',
  });

  return result.isConfirmed; // Devuelve true si el usuario dijo si , false si dijo cancelar
};

// Alerta de exito y error
export const toastAlert = (icon, title) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1E1E1E',
    color: '#EAEAEA',
  });
};