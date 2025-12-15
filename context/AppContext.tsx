import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect, useRef } from 'react';
import { AppState, AppAction, DebugSettings, ChatMessage, Transaction, Account } from '../types';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { GoogleGenAI, ChatSession, GenerateContentResponse } from '@google/genai';
import { GET_SYSTEM_INSTRUCTION, TOOLS, RATES } from '../constants';

const initialDebug: DebugSettings = {
  tone: 50,
  language: 'mixed',
  dtiThreshold: 50,
  mockMode: false,
};

const initialAccounts: Account[] = [
  { currency: 'HKD', balance: 245000 },
  { currency: 'USD', balance: 1200 },
  { currency: 'JPY', balance: 0 },
];

const initialTransactions: Transaction[] = [
  { id: 't1', type: 'Transfer', description: 'To Alex Chen', amount: 500, currency: 'HKD', date: '2023-10-24', direction: 'out' },
  { id: 't2', type: 'Bill Payment', description: 'CLP Power', amount: 1200, currency: 'HKD', date: '2023-10-22', direction: 'out' },
];

const initialState: AppState = {
  currentScreen: 'home',
  
  accounts: initialAccounts,
  transactions: initialTransactions,

  transferAmount: 0,
  transferPayee: '',
  transferFromCurrency: 'HKD',
  transferToCurrency: 'HKD',
  billAmount: 0,
  billMerchant: '',

  loanAmount: 100000,
  loanTenure: 12,
  monthlyDebt: 0,
  
  companyName: '',
  salary: 0,
  cardLast4: '',
  
  fxBuyCurrency: 'JPY',
  fxSellCurrency: 'HKD',
  fxAmount: 10000,
  showFXRateCard: false,
  
  destination: '',
  travelMonth: '',
  insuranceAddons: [],
  showRewardModal: false,
  
  documentStatus: 'idle',
  verificationStep: 'idle',
  showStatusWidget: false,
  offerLocked: false,
  
  isHaruActive: false,
  haruMessage: "Hi, I'm Haru. How can I help?",
  chatHistory: [],
  conversationSummary: "",
  isChatPanelOpen: false,
  debug: initialDebug,
  showDebugPanel: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentScreen: action.screen };
      
    // Banking Core
    case 'UPDATE_BALANCE':
      return {
        ...state,
        accounts: state.accounts.map(acc => 
          acc.currency === action.currency 
            ? { ...acc, balance: acc.balance + action.delta }
            : acc
        )
      };
    case 'EXECUTE_TRANSACTION':
      return {
        ...state,
        transactions: [action.transaction, ...state.transactions]
      };

    // Loan Module
    case 'SET_LOAN_PARAMS':
      return { ...state, loanAmount: action.amount, loanTenure: action.tenure };
    case 'SET_FINANCIALS':
      return { 
        ...state, 
        salary: action.salary !== undefined ? action.salary : state.salary,
        monthlyDebt: action.debt !== undefined ? action.debt : state.monthlyDebt
      };
      
    // Personal Module
    case 'SET_COMPANY':
      return { ...state, companyName: action.name };
    case 'SET_CARD_digits':
      return { ...state, cardLast4: action.digits };
      
    // Transfer & Bill Module
    case 'SET_TRANSFER_DETAILS':
      return { 
        ...state, 
        transferAmount: action.amount !== undefined ? action.amount : state.transferAmount,
        transferPayee: action.payee !== undefined ? action.payee : state.transferPayee,
        transferFromCurrency: action.fromCurrency || state.transferFromCurrency,
        transferToCurrency: action.toCurrency || state.transferToCurrency
      };
    case 'SET_BILL_DETAILS':
      return { 
        ...state, 
        billAmount: action.amount !== undefined ? action.amount : state.billAmount,
        billMerchant: action.merchant !== undefined ? action.merchant : state.billMerchant
      };
      
    // FX Module
    case 'SET_FX_DETAILS':
      return {
        ...state,
        fxBuyCurrency: action.buy || state.fxBuyCurrency,
        fxSellCurrency: action.sell || state.fxSellCurrency,
        fxAmount: action.amount || state.fxAmount
      };
    case 'TOGGLE_FX_CARD':
      return { ...state, showFXRateCard: action.show };
      
    // Insurance Module
    case 'SET_TRAVEL_DETAILS':
      return {
        ...state,
        destination: action.destination ?? state.destination,
        travelMonth: action.month ?? state.travelMonth
      };
    case 'TOGGLE_INSURANCE_ADDON':
      const newAddons = action.active 
        ? [...state.insuranceAddons, action.addon]
        : state.insuranceAddons.filter(a => a !== action.addon);
      return { ...state, insuranceAddons: newAddons };
    case 'TOGGLE_REWARD_MODAL':
      return { ...state, showRewardModal: action.show };
      
    // Common
    case 'SET_DOC_STATUS':
      return { ...state, documentStatus: action.status };
    case 'SET_VERIFICATION_STEP':
      return { ...state, verificationStep: action.step };
    case 'TOGGLE_STATUS_WIDGET':
      return { ...state, showStatusWidget: action.show };
    case 'SET_OFFER_LOCKED':
      return { ...state, offerLocked: action.locked };
    case 'SET_HARU_STATE':
      return { ...state, isHaruActive: action.active, haruMessage: action.message };
    case 'UPDATE_DEBUG_SETTINGS':
      return { ...state, debug: { ...state.debug, ...action.settings } };
    case 'TOGGLE_DEBUG_PANEL':
      return { ...state, showDebugPanel: action.show };
    case 'TOGGLE_CHAT_PANEL':
      return { ...state, isChatPanelOpen: action.open };
    
    // Chat
    case 'ADD_CHAT_MESSAGE':
      if (state.chatHistory.some(m => m.id === action.message.id)) return state;
      return { ...state, chatHistory: [...state.chatHistory, action.message], isChatPanelOpen: true };
    case 'UPDATE_LAST_MESSAGE':
      const lastMsg = state.chatHistory[state.chatHistory.length - 1];
      if (!lastMsg || lastMsg.isFinal) return state;
      const updatedHistory = [...state.chatHistory];
      updatedHistory[updatedHistory.length - 1] = {
         ...lastMsg,
         text: action.text,
         isFinal: action.isFinal
      };
      return { ...state, chatHistory: updatedHistory };
    case 'UPSERT_LAST_MESSAGE':
      const last = state.chatHistory[state.chatHistory.length - 1];
      const isUpdate = last && last.role === action.role && !last.isFinal;
      let newChatHistory;
      if (isUpdate) {
        newChatHistory = [...state.chatHistory];
        newChatHistory[newChatHistory.length - 1] = {
           ...last,
           text: action.text,
           isFinal: action.isFinal
        };
      } else {
        newChatHistory = [...state.chatHistory, {
          id: Date.now().toString(),
          role: action.role,
          text: action.text,
          timestamp: Date.now(),
          isFinal: action.isFinal
        }];
      }
      return {
        ...state,
        chatHistory: newChatHistory,
        isChatPanelOpen: !isUpdate ? true : state.isChatPanelOpen,
        isHaruActive: action.role === 'model' ? true : state.isHaruActive,
        haruMessage: action.role === 'model' ? action.text : state.haruMessage
      };
    case 'SET_CONVERSATION_SUMMARY':
      return { ...state, conversationSummary: action.summary };
    case 'PRUNE_CHAT_HISTORY':
      return { ...state, chatHistory: state.chatHistory.slice(action.count) };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  connectHaru: () => void;
  disconnectHaru: () => void;
  sendHaruTrigger: (text: string) => void;
  restartSession: () => void;
  isHaruConnected: boolean;
  isHaruSpeaking: boolean;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const warnedDTIRef = useRef(false);
  const warnedSkiRef = useRef(false);
  const summarizingRef = useRef(false);
  
  // Persistent Chat Session Ref (Crucial for Multi-turn Tool robustness)
  const chatSessionRef = useRef<ChatSession | null>(null);

  // Message Handler for Live Hook
  const onMessageReceived = useCallback((role: 'user' | 'model', text: string, isFinal: boolean) => {
    dispatch({ type: 'UPSERT_LAST_MESSAGE', role, text, isFinal });
  }, []);

  // Tool Handler
  const handleToolCall = useCallback(async (name: string, args: any) => {
    console.log(`Executing tool: ${name}`, args);
    switch (name) {
      case 'navigate':
        dispatch({ type: 'NAVIGATE', screen: args.screen });
        return { success: true };
      case 'setLoanParameters':
        dispatch({ type: 'SET_LOAN_PARAMS', amount: args.amount, tenure: args.tenure });
        return { success: true };
      case 'fillTravelDetails':
        dispatch({ type: 'SET_TRAVEL_DETAILS', destination: args.destination, month: args.month });
        return { success: true };
      case 'fillFXDetails':
        dispatch({ type: 'SET_FX_DETAILS', buy: args.buyCurrency, sell: args.sellCurrency, amount: args.amount });
        return { success: true };
      case 'fillTransferDetails':
        dispatch({ 
          type: 'SET_TRANSFER_DETAILS', 
          payee: args.payee, 
          amount: args.amount,
          fromCurrency: args.fromCurrency,
          toCurrency: args.toCurrency
        });
        return { success: true };
      case 'fillBillDetails':
        dispatch({ type: 'SET_BILL_DETAILS', merchant: args.merchant, amount: args.amount });
        return { success: true };
      case 'updateInsurance':
        dispatch({ type: 'TOGGLE_INSURANCE_ADDON', addon: args.addon, active: args.active });
        return { success: true };
      case 'checkBalance':
        const acc = state.accounts.find(a => a.currency === (args.currency || 'HKD'));
        return { balance: acc ? acc.balance : 0, currency: args.currency };
      case 'getExchangeRate':
        const r = RATES[args.currency] || 1;
        return { rate: r, base: 'HKD' };
      default:
        return { error: 'Unknown tool' };
    }
  }, [state.accounts]);

  const { connect, disconnect, sendText: sendLiveText, isConnected, isSpeaking } = useGeminiLive(
    handleToolCall, 
    state.debug,
    onMessageReceived,
    state.conversationSummary
  );

  const restartSession = useCallback(() => {
    // 1. Disconnect Live
    disconnect();
    // 2. Clear Text Session
    chatSessionRef.current = null;
    // 3. Inform UI
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      message: { 
        id: Date.now().toString(), 
        role: 'system', 
        text: "Session has been rebooted.", 
        timestamp: Date.now(), 
        isFinal: true 
      } 
    });
  }, [disconnect]);

  const sendHaruTrigger = useCallback(async (text: string) => {
    // 1. Optimistically add user message
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      message: { id: Date.now().toString(), role: 'user', text, timestamp: Date.now(), isFinal: true } 
    });

    // 2. If Live Session is active, use it (Prioritize Voice Mode)
    if (isConnected) {
      sendLiveText(text);
      return;
    }

    // 3. Fallback to Text API (Robust Persistent Chat Mode)
    try {
      if (!process.env.API_KEY) {
        console.error("API Key missing");
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = GET_SYSTEM_INSTRUCTION(state.debug, state.conversationSummary);

      // If no session exists, create one from current history
      if (!chatSessionRef.current) {
        const history = state.chatHistory
          .filter(m => m.role === 'user' || m.role === 'model')
          .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));

        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: TOOLS }],
          },
          history,
        });
      }

      // Use Persistent Session
      let result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: text });
      
      // Loop to handle recursive/sequential tool calls
      while (true) {
        // A. Display Text if present
        if (result.text) {
          dispatch({ type: 'UPSERT_LAST_MESSAGE', role: 'model', text: result.text, isFinal: true });
        }

        // B. Check for Tools
        const functionCalls = result.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          break; // Exit loop if no tools called
        }

        // C. Execute Tools
        const functionResponses = [];
        for (const fc of functionCalls) {
          const toolResult = await handleToolCall(fc.name, fc.args);
          functionResponses.push({
            functionResponse: {
              name: fc.name,
              response: { result: toolResult }
            }
          });
        }

        // D. Send results back to model (this might generate text or *more* tool calls)
        result = await chatSessionRef.current.sendMessage({ message: functionResponses });
      }

    } catch (error) {
      console.error("Text Fallback Error", error);
      // Auto-Reboot Logic: Clear broken session so next attempt rebuilds from clean history
      chatSessionRef.current = null; 
      
      dispatch({ 
        type: 'ADD_CHAT_MESSAGE', 
        message: { 
          id: Date.now().toString(), 
          role: 'system', 
          text: "Connection interrupted. Recovering session...", 
          timestamp: Date.now(), 
          isFinal: true 
        } 
      });
    }

  }, [isConnected, sendLiveText, state.debug, state.conversationSummary, state.chatHistory, handleToolCall]);

  // LOGIC CONTROLLER (Effects)
  
  // Use Case: Memory Summarization (Robustness)
  useEffect(() => {
    const HISTORY_THRESHOLD = 10;
    if (state.chatHistory.length > HISTORY_THRESHOLD && !summarizingRef.current) {
       const summarize = async () => {
         summarizingRef.current = true;
         try {
           if (!process.env.API_KEY) return;
           const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
           
           const toSummarize = state.chatHistory.slice(0, 6).map(m => `${m.role}: ${m.text}`).join('\n');
           const prompt = `Summarize the following banking conversation key points into 2 sentences. Preserve numbers/amounts:\n${toSummarize}`;
           
           const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
           });
           
           const summaryText = response.text || "";
           dispatch({ type: 'SET_CONVERSATION_SUMMARY', summary: summaryText });
           dispatch({ type: 'PRUNE_CHAT_HISTORY', count: 6 });
           
           // If we pruned history, we should probably reset the Text Session so it ingests the new summary on next turn
           chatSessionRef.current = null;
           
         } catch (e) {
           console.error("Summarization failed", e);
         } finally {
           summarizingRef.current = false;
         }
       };
       summarize();
    }
  }, [state.chatHistory.length]);

  // Use Case 1: Financial Health / DTI
  useEffect(() => {
    if (state.salary > 0) {
      const monthlyPayment = state.loanAmount / state.loanTenure; 
      const dti = (state.monthlyDebt + monthlyPayment) / state.salary;
      const threshold = state.debug.dtiThreshold / 100;

      if (dti > threshold && !warnedDTIRef.current && isConnected) {
        warnedDTIRef.current = true;
        sendLiveText(`[SYSTEM EVENT] User DTI is ${(dti * 100).toFixed(1)}%. Trigger "DTI_High" warning.`);
      }
    }
  }, [state.loanAmount, state.loanTenure, state.salary, state.monthlyDebt, state.debug.dtiThreshold, isConnected, sendLiveText]);

  // Use Case 3: Ski Trip Context (Auto Logic)
  useEffect(() => {
    const isWinter = ['december', 'january', 'february'].includes(state.travelMonth.toLowerCase());
    const isJapan = state.destination.toLowerCase().includes('japan');

    if (isWinter && isJapan && !warnedSkiRef.current && isConnected) {
      warnedSkiRef.current = true;
      dispatch({ type: 'TOGGLE_INSURANCE_ADDON', addon: 'winter-sports', active: true });
      dispatch({ type: 'TOGGLE_INSURANCE_ADDON', addon: 'car-rental', active: true });
      sendLiveText(`[SYSTEM EVENT] User is traveling to Japan in Winter. "Ski_Bundle_Active" event triggered.`);
    }
  }, [state.travelMonth, state.destination, isConnected, sendLiveText]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      connectHaru: connect, 
      disconnectHaru: disconnect, 
      sendHaruTrigger, 
      restartSession,
      isHaruConnected: isConnected,
      isHaruSpeaking: isSpeaking
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
