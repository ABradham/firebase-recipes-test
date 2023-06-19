import { Recipe, Ingredient } from "@/types";

export function RecipeCard({ name, ingredients }: Recipe) {
  return (
    <div>
      <h3>{name}</h3>
      <ul>
        {ingredients.map((ingredient: Ingredient) => {
          return (
            <li key={ingredient.name}>
              {ingredient.name} -{ingredient.type}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
