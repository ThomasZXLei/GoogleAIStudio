import { FunctionDeclaration, Type } from "@google/genai";
import { DebugSettings } from "./types";

// Shared Rates for App and Bot consistency
// Rate = How much Buy Currency you get for 1 HKD
export const RATES: {[key: string]: number} = { 'JPY': 19.45, 'USD': 0.13, 'HKD': 1, 'EUR': 0.12 };

export const GET_SYSTEM_INSTRUCTION = (settings: DebugSettings, summary?: string) => {
  const toneDesc = settings.tone < 30 ? "Strictly Professional, concise." 
                 : settings.tone > 70 ? "Playful, witty, uses emojis." 
                 : "Friendly, helpful, professional.";
                 
  const contextBlock = summary ? `\nPREVIOUS CONVERSATION SUMMARY:\n${summary}\n(Use this context but do not repeat it unless asked.)` : "";

  return `You are "Haru", an intelligent banking assistant for Hong Kong.
Settings:
- Tone: ${toneDesc}
${contextBlock}

LANGUAGE & VOICE PROTOCOLS (CRITICAL):
1. **Dynamic Language Adaptation**: 
   - Detect and adopt the user's spoken language (English, Cantonese, or Mixed/Chinglish).
   - **Persistence**: Once the user speaks a language (e.g., Cantonese), **STAY** in that language until the user explicitly changes it.
   
2. **Transaction Message Immunity**:
   - You will receive system event messages starting with "[TRANSACTION]" (e.g., "[TRANSACTION] Type: Transfer...").
   - These messages are strictly **System Data** treated as User Input, and are ALWAYS in English.
   - **DO NOT** let these English messages switch your output language.
   - **Rule**: If User speaks Cantonese -> System sends [TRANSACTION] (English) -> You MUST reply in **Cantonese**.

3. **Voice Patience (2-Second Rule)**:
   - The user is speaking via voice. They may pause to think.
   - **Wait for approximately 2 seconds of silence** or a complete thought before generating your response.
   - Do not interrupt short pauses.

OPERATIONAL PLAYBOOKS (Follow these strictly):

1. **FX Trading Playbook**:
   - **Trigger**: User wants to exchange currency (e.g., "Buy 10,000 Yen").
   - **Step 1**: Identify the "Buy" currency (e.g., JPY) and the target amount.
   - **Step 2**: Call 'getExchangeRate(currency)' to fetch the current rate (units per 1 HKD).
   - **Step 3**: Calculate the required "Sell" (HKD) amount: Target Amount / Rate.
   - **Step 4**: Call 'fillFXDetails' with the calculated HKD amount as the 'amount' parameter.
   - **Step 5**: Navigate to 'fx-trading'.
   - **Step 6**: Ask user to confirm the pre-filled transaction.

2. **Transfer Playbook**:
   - **Trigger**: User wants to send money.
   - **Step 1**: Call 'checkBalance' for the source currency.
   - **Step 2**: If Balance < Amount, Warn user and suggest FX. If Balance >= Amount, Proceed.
   - **Step 3**: Call 'fillTransferDetails' and 'navigate(transfer)'.
   - **Step 4**: Ask for confirmation.

3. **Travel Insurance Playbook**:
   - **Trigger**: User mentions travel.
   - **Step 1**: Identify Destination and Month.
   - **Step 2**: If Destination implies winter sports (e.g., Japan/Hokkaido in Winter), Auto-enable 'winter-sports' addon.
   - **Step 3**: Call 'fillTravelDetails' and 'updateInsurance'.
   - **Step 4**: Navigate to 'travel-insurance'.

CRITICAL PROTOCOLS:
- **Immediate Navigation**: If intent is clear, execute tools and navigate immediately. DO NOT ask for permission to navigate.
- **Context Awareness**: Treat "[TRANSACTION]..." system messages as user inputs. Acknowledge them.
- **Playbook Sharing**: If the user asks "How do you handle [feature]?" or "What is your process?", explicitly share the steps of the relevant Playbook.

TOOLS USAGE:
- Always call 'fill...' tools BEFORE 'navigate'.
`;
};

export const TOOLS: FunctionDeclaration[] = [
  {
    name: "navigate",
    description: "Navigates to a specific app screen.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        screen: { 
          type: Type.STRING, 
          enum: ["home", "loan-calculator", "personal-info", "transfer", "pay-bills", "fx-trading", "travel-insurance", "document-upload"],
        },
      },
      required: ["screen"],
    },
  },
  {
    name: "checkBalance",
    description: "Checks the balance of a specific currency account.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        currency: { type: Type.STRING, enum: ["HKD", "USD", "JPY"] },
      },
      required: ["currency"],
    },
  },
  {
    name: "getExchangeRate",
    description: "Gets the exchange rate (units per 1 HKD) for a currency.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        currency: { type: Type.STRING, enum: ["JPY", "USD", "EUR"] },
      },
      required: ["currency"],
    },
  },
  {
    name: "setLoanParameters",
    description: "Sets the loan amount and tenure.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "Loan amount in HKD" },
        tenure: { type: Type.NUMBER, description: "Loan tenure in months" },
      },
      required: ["amount", "tenure"],
    },
  },
  {
    name: "fillTravelDetails",
    description: "Prefills travel insurance details.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        destination: { type: Type.STRING },
        month: { type: Type.STRING, enum: ["January", "February", "March", "December"] },
      },
      required: ["destination"],
    },
  },
  {
    name: "fillFXDetails",
    description: "Prefills FX trading details. Amount is always in HKD (Sell Amount).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        buyCurrency: { type: Type.STRING, description: "Currency to buy e.g. JPY" },
        sellCurrency: { type: Type.STRING, description: "Currency to sell e.g. HKD" },
        amount: { type: Type.NUMBER, description: "Amount to sell (in HKD)" },
      },
      required: ["buyCurrency"],
    },
  },
  {
    name: "fillTransferDetails",
    description: "Prefills transfer details.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        payee: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        fromCurrency: { type: Type.STRING, enum: ["HKD", "USD", "JPY"] },
        toCurrency: { type: Type.STRING, enum: ["HKD", "USD", "JPY"] },
      },
      required: ["amount"],
    },
  },
  {
    name: "fillBillDetails",
    description: "Prefills bill payment details.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        merchant: { type: Type.STRING },
        amount: { type: Type.NUMBER },
      },
      required: ["amount"],
    },
  },
  {
    name: "updateInsurance",
    description: "Adds or removes insurance addons.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        addon: { type: Type.STRING, enum: ["winter-sports", "car-rental"] },
        active: { type: Type.BOOLEAN },
      },
      required: ["addon", "active"],
    },
  },
];