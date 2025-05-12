//Interfaz para los usuarios
export interface RecipeUser {

    id: number;
    nickname: string;
    nombre: string;
    email: string;
    password: string;
    telefono: string;
    roleIds: number[];
}
