
export type ScreenName = 
  | 'home' 
  | 'loan-calculator' 
  | 'personal-info' 
  | 'document-upload'
  | 'transfer'
  | 'pay-bills'
  | 'fx-trading'
  | 'travel-insurance';

export interface DebugSettings {
  tone: number; // 0 (Strict) to 100 (Playful)
  language: 'en' | 'yue' | 'mixed';
  dtiThreshold: number;
  mockMode: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isFinal?: boolean; 
}

export interface Transaction {
  id: string;
  type: 'Transfer' | 'Bill Payment' | 'FX Exchange' | 'Loan Disbursement';
  description: string;
  amount: number;
  currency: string;
  date: string;
  direction: 'in' | 'out';
}

export interface Account {
  currency: string;
  balance: number;
}

export interface AppState {
  currentScreen: ScreenName;
  
  // Banking Core
  accounts: Account[]; // HKD, USD, JPY
  transactions: Transaction[];
  
  // Module: Transfer & Pay
  transferAmount: number;
  transferPayee: string;
  transferFromCurrency: string;
  transferToCurrency: string;
  billMerchant: string;
  billAmount: number;

  // Module: Loan
  loanAmount: number;
  loanTenure: number;
  monthlyDebt: number;
  
  // Module: Personal
  companyName: string;
  salary: number;
  cardLast4: string;
  
  // Module: FX
  fxBuyCurrency: string;
  fxSellCurrency: string;
  fxAmount: number;
  showFXRateCard: boolean;
  
  // Module: Travel Insurance
  destination: string; 
  travelMonth: string; 
  insuranceAddons: string[]; 
  showRewardModal: boolean;
  
  // Module: Doc & Verification
  documentStatus: 'idle' | 'aligning' | 'captured';
  verificationStep: 'idle' | 'ocr' | 'aml' | 'credit' | 'complete';
  
  // Global UI
  showStatusWidget: boolean;
  offerLocked: boolean;
  
  // Chatbot
  isHaruActive: boolean;
  haruMessage: string;
  chatHistory: ChatMessage[];
  conversationSummary: string;
  isChatPanelOpen: boolean;
  
  // Developer
  debug: DebugSettings;
  showDebugPanel: boolean;
}

export type AppAction = 
  | { type: 'NAVIGATE'; screen: ScreenName }
  // Banking Core
  | { type: 'EXECUTE_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_BALANCE'; currency: string; delta: number }
  // Loan
  | { type: 'SET_LOAN_PARAMS'; amount: number; tenure: number }
  | { type: 'SET_FINANCIALS'; salary?: number; debt?: number }
  // Personal
  | { type: 'SET_COMPANY'; name: string }
  | { type: 'SET_CARD_digits'; digits: string }
  // Transfer & Bill
  | { type: 'SET_TRANSFER_DETAILS'; amount?: number; payee?: string; fromCurrency?: string; toCurrency?: string }
  | { type: 'SET_BILL_DETAILS'; amount?: number; merchant?: string }
  // FX
  | { type: 'SET_FX_DETAILS'; buy?: string; sell?: string; amount?: number }
  | { type: 'TOGGLE_FX_CARD'; show: boolean }
  // Insurance
  | { type: 'SET_TRAVEL_DETAILS'; destination?: string; month?: string }
  | { type: 'TOGGLE_INSURANCE_ADDON'; addon: string; active: boolean }
  | { type: 'TOGGLE_REWARD_MODAL'; show: boolean }
  // System
  | { type: 'SET_DOC_STATUS'; status: 'idle' | 'aligning' | 'captured' }
  | { type: 'SET_VERIFICATION_STEP'; step: AppState['verificationStep'] }
  | { type: 'TOGGLE_STATUS_WIDGET'; show: boolean }
  | { type: 'SET_OFFER_LOCKED'; locked: boolean }
  | { type: 'SET_HARU_STATE'; active: boolean; message: string }
  | { type: 'UPDATE_DEBUG_SETTINGS'; settings: Partial<DebugSettings> }
  | { type: 'TOGGLE_DEBUG_PANEL'; show: boolean }
  | { type: 'ADD_CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_LAST_MESSAGE'; text: string; isFinal: boolean }
  | { type: 'UPSERT_LAST_MESSAGE'; role: 'user' | 'model'; text: string; isFinal: boolean }
  | { type: 'SET_CONVERSATION_SUMMARY'; summary: string }
  | { type: 'PRUNE_CHAT_HISTORY'; count: number }
  | { type: 'TOGGLE_CHAT_PANEL'; open: boolean };

export interface ToolCallResponse {
  result: string;
}
