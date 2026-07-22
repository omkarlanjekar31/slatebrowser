import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ChartArea, Sparkles } from "lucide-react";

type ThirdSectionTabsValue = "wallet" | "ai_chat" | "ai_chat_history";

type ThirdSectionTabsType = {
  id: ThirdSectionTabsValue;
  icon: string;
  label: string;
};

const thirdSectionTabsItems: ThirdSectionTabsType[] = [
  { id: "ai_chat", icon: "Sparkles", label: "AI Chat" },
  { id: "ai_chat_history", icon: "History", label: "AI Chat History" },

];
export interface LayoutInitialState {
  isBunnyAIOpen: boolean;
  isThirdSectionOpen: boolean;
  thirdSectionTabsItems: ThirdSectionTabsType[];
  selectedSideTab: null | ThirdSectionTabsValue;
  sideBarSwitcher: number;
  bunnyAIWidth: number;
  thirdSectionWidth: number;
  // Session id to auto-open in AIChatHistoryComponent the next time it mounts.
  // Set right after a chat's first message is sent from AIChatHomeComponent so
  // the user is dropped straight into that conversation's detail view.
  selectedChatSessionId: string | null;
}
const initialState = {
  isBunnyAIOpen: true,
  isThirdSectionOpen: false,
  thirdSectionTabsItems: thirdSectionTabsItems,
  selectedSideTab: "ai_chat",
  bunnyAIWidth: 380,
  thirdSectionWidth: 0,
  sideBarSwitcher: 64,
  selectedChatSessionId: null,
} as LayoutInitialState;

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleBunnyAI: (state) => {
      state.isBunnyAIOpen = !state.isBunnyAIOpen;
    },
    toggleThirdSection: (
      state,
      action: PayloadAction<ThirdSectionTabsValue>,
    ) => {
      const sectionType = action.payload;

      state.isThirdSectionOpen = !state.isThirdSectionOpen;
      if (state.selectedSideTab !== sectionType) {
        state.selectedSideTab = sectionType;
        state.isThirdSectionOpen = true;
      }
    },
    setThirdSectionOpen: (state, action) => {
      state.isThirdSectionOpen = action.payload;
    },
    setSelectedChatSessionId: (state, action: PayloadAction<string | null>) => {
      state.selectedChatSessionId = action.payload;
    },
  },
});

export const {
  toggleBunnyAI,
  toggleThirdSection,
  setThirdSectionOpen,
  setSelectedChatSessionId,
} = layoutSlice.actions;
export default layoutSlice.reducer;
