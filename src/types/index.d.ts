export interface UserRecipeUpload {
    collaborators: UserSearchProfile[];
    ingredients: Ingredient[];
    name: string;
}

export interface AppUser {
    recipes: Array<Recipe>;
    displayName: string | null;
    uid: string;
    photoURL: string;
    ownedRecipes: string[];
}
  
export interface Ingredient {
    name: string;
    type: string;
    asignee: string;
    retrieved: boolean;
}

export interface UserSearchProfile {
    uid: string;
    photoURL: string;
    displayName: string;
}
  
export interface Recipe {
    ingredients: Array<Ingredient>;
    name: string;
}

export interface User{
    displayName: string;
    photoURL: string;
    recipes: Array<Recipe>;
}

export type IngredientTableData = {
  name: string;
  type: string;
  asignee: string;
  retrieved: boolean;
};


interface RecipeData {
  collaborators: Array<UserSearchProfile>;
  name: string;
  ingredients: Array<IngredientTableData>;
};

interface IngredientsWithID {
  id: string;
  name: string;
  type: string;
  asignee: string;
  retrieved: boolean;
}