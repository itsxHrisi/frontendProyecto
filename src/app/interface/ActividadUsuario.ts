//Interfaz para las actividades
//realizadas por los usuarios
export interface ActividadUsuario {

    id: number;
  usuarioId: number;
  tipoEvento: string;
  tablaAfectada: string;
  datoAnterior?: string;
  datoNuevo?: string;
  descripcion: string;
  fecha: string;
}