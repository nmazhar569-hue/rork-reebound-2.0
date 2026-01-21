import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

const FoodNutritionSchema = z.object({
  name: z.string().describe("Name of the food item"),
  calories: z.number().describe("Estimated calories"),
  protein: z.number().describe("Protein in grams"),
  carbs: z.number().describe("Carbohydrates in grams"),
  fats: z.number().describe("Fats in grams"),
  fiber: z.number().optional().describe("Fiber in grams"),
  sugar: z.number().optional().describe("Sugar in grams"),
  inflammationScore: z.number().min(-2).max(2).optional().describe("Inflammation score from -2 (anti-inflammatory) to +2 (pro-inflammatory)"),
  confidence: z.enum(["high", "medium", "low"]).describe("Confidence level of the estimation"),
});

const FoodInputResultSchema = z.object({
  items: z.array(FoodNutritionSchema).describe("Array of identified food items"),
  totalCalories: z.number().describe("Total calories of all items"),
  totalProtein: z.number().describe("Total protein in grams"),
  totalCarbs: z.number().describe("Total carbohydrates in grams"),
  totalFats: z.number().describe("Total fats in grams"),
  rawDescription: z.string().describe("Original description of the food"),
});

export type FoodNutrition = z.infer<typeof FoodNutritionSchema>;
export type FoodInputResult = z.infer<typeof FoodInputResultSchema>;

export type InputSource = "text" | "voice" | "image" | "barcode";

export interface ProcessFoodInputParams {
  source: InputSource;
  text?: string;
  imageBase64?: string;
  barcodeData?: string;
}

export async function processFoodInput(params: ProcessFoodInputParams): Promise<FoodInputResult> {
  const { source, text, imageBase64, barcodeData } = params;

  console.log(`[FoodProcessingService] Processing ${source} input`);

  if (source === "barcode" && barcodeData) {
    return await processBarcode(barcodeData);
  }

  if (source === "image" && imageBase64) {
    return await processImage(imageBase64);
  }

  if ((source === "text" || source === "voice") && text) {
    return await processText(text);
  }

  throw new Error("Invalid input parameters");
}

async function processText(text: string): Promise<FoodInputResult> {
  console.log("[FoodProcessingService] Processing text:", text);

  try {
    const result = await generateObject({
      messages: [
        {
          role: "user",
          content: `Analyze this food description and estimate the nutritional values. Be accurate but if unsure, estimate based on typical portion sizes.

Food description: "${text}"

Return detailed nutrition information for each food item mentioned.`,
        },
      ],
      schema: FoodInputResultSchema,
    });

    console.log("[FoodProcessingService] Text processing result:", result);
    return result;
  } catch (error) {
    console.error("[FoodProcessingService] Text processing error:", error);
    throw error;
  }
}

async function processImage(imageBase64: string): Promise<FoodInputResult> {
  console.log("[FoodProcessingService] Processing image");

  try {
    const result = await generateObject({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and identify all food items visible. Estimate the nutritional values based on typical portion sizes you can see. Be as accurate as possible with portions.

Return detailed nutrition information for each food item you can identify.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
      schema: FoodInputResultSchema,
    });

    console.log("[FoodProcessingService] Image processing result:", result);
    return result;
  } catch (error) {
    console.error("[FoodProcessingService] Image processing error:", error);
    throw error;
  }
}

async function processBarcode(barcodeData: string): Promise<FoodInputResult> {
  console.log("[FoodProcessingService] Processing barcode:", barcodeData);

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcodeData}.json`
    );
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;
      const nutriments = product.nutriments || {};

      const name = product.product_name || product.generic_name || "Unknown Product";
      const servingSize = product.serving_quantity || 100;
      const multiplier = servingSize / 100;

      const calories = Math.round((nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0) * multiplier);
      const protein = Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * multiplier);
      const carbs = Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * multiplier);
      const fats = Math.round((nutriments.fat_100g || nutriments.fat || 0) * multiplier);
      const fiber = nutriments.fiber_100g ? Math.round(nutriments.fiber_100g * multiplier) : undefined;
      const sugar = nutriments.sugars_100g ? Math.round(nutriments.sugars_100g * multiplier) : undefined;

      const result: FoodInputResult = {
        items: [
          {
            name,
            calories,
            protein,
            carbs,
            fats,
            fiber,
            sugar,
            confidence: "high",
          },
        ],
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFats: fats,
        rawDescription: `${name} (barcode: ${barcodeData})`,
      };

      console.log("[FoodProcessingService] Barcode processing result:", result);
      return result;
    } else {
      console.log("[FoodProcessingService] Product not found in OpenFoodFacts");
      throw new Error("Product not found. Try scanning again or enter manually.");
    }
  } catch (error) {
    console.error("[FoodProcessingService] Barcode processing error:", error);
    throw error;
  }
}

export async function transcribeAudio(audioUri: string, fileType: string): Promise<string> {
  console.log("[FoodProcessingService] Transcribing audio:", audioUri);

  try {
    const formData = new FormData();
    
    const audioFile = {
      uri: audioUri,
      name: `recording.${fileType}`,
      type: `audio/${fileType}`,
    };

    formData.append("audio", audioFile as unknown as Blob);

    const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("[FoodProcessingService] Transcription result:", result);
    return result.text;
  } catch (error) {
    console.error("[FoodProcessingService] Transcription error:", error);
    throw error;
  }
}
