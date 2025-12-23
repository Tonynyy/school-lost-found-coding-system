export interface EncodingRule {
  id: string;
  label: string;
  code: string;
}

export interface LostItemData {
  id: string;
  typeId: string; // References EncodingRule.id
  locId: string;  // References EncodingRule.id
  itemName: string;
  floor: string;
  timestamp: number;
  finder: string;
  // New fields for specific encoding
  grade: string;
  classNum: string;
  studentId: string;
  
  generatedCode: string;
  status: 'lost' | 'claimed';
  
  // Claim info
  claimedBy?: string;
  claimTimestamp?: number;
}

export interface GlobalState {
  categories: EncodingRule[];
  locations: EncodingRule[];
  lostItems: LostItemData[];
}

export type ViewState = 'DASHBOARD' | 'CONFIG' | 'ENTRY' | 'LIST';

export type NotificationType = 'success' | 'error' | 'info';

export interface ViewProps {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
  showNotification: (type: NotificationType, message: string) => void;
}