export interface UserRecipeUpload {
    recipes: Array<Recipe>;
    displayName: string | null;
    photoURL: string;
}

export interface AppUser {
    recipes: Array<Recipe>;
    displayName: string | null;
    uid: string;
    photoURL: string;
}
  
export interface Ingredient {
    name: string;
    type: string;
    asignee: string;
}
  
export interface Recipe {
    ingredients: Array<Ingredient>;
    name: string;
    completed?: boolean;
}