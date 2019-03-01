// src/sweetalert-plugin.js
import Swal from 'sweetalert2'

// Create a Vue plugin object
export default {
    install(app) {
        // Provide SweetAlert2 globally
        app.config.globalProperties.$swal = Swal;
    }
}
