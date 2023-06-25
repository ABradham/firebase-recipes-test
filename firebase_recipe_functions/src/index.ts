/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {setGlobalOptions} from "firebase-functions/v2/options";


interface AppUser {
    recipes: Array<Recipe>;
    displayName: string | null;
    uid: string;
    photoURL: string;
    ownedRecipes: string[];
}

interface Ingredient {
    name: string;
    type: string;
    asignee: string;
    retrieved: boolean;
}

interface Recipe {
    ingredients: Array<Ingredient>;
    name: string;
}

interface RecipeData {
    collaborators: Array<UserSearchProfile>;
    name: string;
    ingredients: Array<Ingredient>;
}

interface UserSearchProfile {
    uid: string;
    photoURL: string;
    displayName: string;
}

// interface PalmAIRequest {
//     user: UserSearchProfile;
//     dish: string;
// }

interface PalmAIStatus {
    state: string;
}

interface PalmAIDocument {
    dish: string;
    user: UserSearchProfile;
    output: string;
    status: PalmAIStatus;
}

// Firebase admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Include this to make typescript happy :)
setGlobalOptions({maxInstances: 10});

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


export const makeDishUppercase = onDocumentUpdated("test/{documentID}",
  (event) => {
    // Grab the current value of what was written to Firestore.
    const original: string = event.data?.before.data().dishName;

    // Access the parameter `{documentId}` with `event.params`
    logger.log("Uppercasing", event.params.documentID, original);

    const uppercase = original.toUpperCase();
    logger.info(uppercase);

    // You must return a Promise when performing
    // asynchronous tasks inside a function
    // such as writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    // return event.data.ref.set({uppercase}, {merge: true});

    return null;
  });

export const createRecipeFromAIResponse = onDocumentUpdated(
  "generateRecipes/{recipeID}", (event) => {
    // Check that the PalmAI fields exist
    const eventData = event.data?.after.data() as PalmAIDocument;
    if (!eventData.status) {
      // Return if there is no "Status" field
      logger.info(
        `Dish [${eventData.dish}] has not recieved a PalmAI response yet`
      );
      return null;
    }

    // Check that AI response has completed
    if (eventData.status.state != "COMPLETED") {
      logger.info(`Dish [${eventData.dish}] is not COMPLETED`);
      return null;
    }

    // If AI response has completed / did not err, continue to make recipes
    const ingredientsListString = eventData.output;
    // const ingredientsRegex = /(\[.*\])/;
    // const match: RegExpMatchArray | null = ingredientsListString.match(
    //   ingredientsRegex);
    //   `Dish [${eventData.dish}] regex returned: ${JSON.stringify(match)}`);

    // Set ingredients array to parsed JSON from regex match
    let ingredients: Ingredient[] = [];
    ingredients = JSON.parse(ingredientsListString);

    // Modify ingredients field to make consistent with `Ingredient` type
    ingredients.forEach((ingredient) => {
      ingredient.asignee = eventData.user.uid,
      ingredient.retrieved = false;
    });

    // Add list of ingredients to new `Recipe` type for firestore
    const newRecipe: RecipeData = {
      collaborators: [eventData.user],
      name: eventData.dish,
      ingredients: ingredients,
    };
    logger.info(`Created new Recipe object ${JSON.stringify(newRecipe)}`);

    // Add new `Recipe` obj to `recipes` collection
    logger.info(
      `Setting new Recipe object into cloud firestore
       ${JSON.stringify(newRecipe)}`);
    return db.doc(`recipes/${event.data?.after.id}`).set(newRecipe);
  });

export const addToCollaboratorsOwnedRecipes = onDocumentUpdated(
  "recipes/{recipeDocumentID}", (event) => {
    // Check if document contains neccesary fields
    const beforeDocument = event.data?.before.data() as RecipeData;
    const afterDocument = event.data?.after.data() as RecipeData;

    // See if there are any new collaborators not in before.collaborators
    const beforeCollaborators: UserSearchProfile[] =
            beforeDocument.collaborators;
    const afterCollaborators: UserSearchProfile[] =
            afterDocument.collaborators;

    const newCollaborators = afterCollaborators.filter(
      (user) => !beforeCollaborators.includes(user)
    );

    if (newCollaborators.length < 1) {
      logger.info(
        `No new collaborators found in Recipe: [${afterDocument.name}]`
      );
      return null;
    }

    // Since there's new collaborators, add this id to their `ownedRecipes`
    const person = newCollaborators[0];
    let userOwnedRecipes: string[] = [];
    const userDocRef = db.doc(`users/${person.uid}`);

    return userDocRef.get().then((snapshot) => {
      if (event.data?.after.id) {
        const userData: AppUser = snapshot.data() as AppUser;
        userOwnedRecipes = userData.ownedRecipes;

        // Don't update if recipe is already there
        if (userOwnedRecipes.includes(event.data.after.id)) {
          return null;
        }


        userOwnedRecipes.push(event.data.after.id);
        userData.ownedRecipes = userOwnedRecipes;
        return userDocRef.set(userData).then(
          (value) => {
            logger.info(`Added to "OwnedRecipes" of [${person.uid}]
            at ${value.writeTime}`);
            return null;
          }
        );
      } else {
        logger.error(`Couldn't add to [${person.uid}]`);
        return null;
      }
    });
  });


export const initialAddToCollaboratorsOwnedRecipes = onDocumentCreated(
  "recipes/{recipeDocumentID}", (event) => {
    // Check if document contains neccesary fields
    const document = event.data?.data() as RecipeData;

    // Get recipe creator and add to their list of `ownedRecipes`
    const person = document.collaborators[0];
    const userDocRef = db.doc(`users/${person.uid}`);
    let userOwnedRecipes: string[] = [];

    return userDocRef.get().then((snapshot) => {
      if (event.data?.id) {
        logger.info(`Adding to "OwnedRecipes" of [${person.uid}]`);
        const userData: AppUser = snapshot.data() as AppUser;
        userOwnedRecipes = userData.ownedRecipes;
        userOwnedRecipes.push(event.data.id);
        userData.ownedRecipes = userOwnedRecipes;
        userDocRef.set(userData).then(
          (value) => {
            logger.info(`Added to "OwnedRecipes" of [${person.uid}]
            at ${value.writeTime}`);
            return null;
          }
        );
        return null; // Sketchy
      } else {
        logger.error(`Couldn't add to [${person.uid}]`);
        return null;
      }
    });
  });
