import Swal from 'sweetalert2'

export function confirmDelete(opts: { title: string; text?: string }) {
  return Swal.fire({
    title: opts.title,
    text: opts.text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: 'transparent',
    reverseButtons: true,
    customClass: {
      popup:         'swal-popup',
      title:         'swal-title',
      htmlContainer: 'swal-text',
      confirmButton: 'swal-btn-confirm',
      cancelButton:  'swal-btn-cancel',
    },
  })
}
