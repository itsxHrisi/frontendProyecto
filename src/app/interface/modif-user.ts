//Interfaz para modificar usuarios con los campos que se necesitan para ello
export interface ModifUser {

    nombre: string | null;
    nickname: string | null;
    email: string | null;
    telefono: string | null;
    roleIds: number[] | null;
}