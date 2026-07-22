type WebsiteMetaData = {
  title: string | null | undefined;
  description: string | null | undefined;
  imageUrl: string | null | undefined;
};

type IWalletType = {
  id?: number;
  encryptedSeed: string;
  salt: string;
  iv: string;
  authTag: string;
  passwordHash: string;
};
type IDecryptSeedParamsType = {
  encryptedSeed: string;
  password: string;
  saltHex: string;
  ivHex: string;
  authTagHex: string;
};

type TabState = {
  account: string | null;
  chainId: SupportedChainId;
  approvedOrigins: Set<string>;
};

type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageDataUsage: number;
};

type StaticData = {
  model: string;
  ssdMemory: string;
  totalMemory: string;
};

type ViewBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Tab = {
  id: string;
  title: string;
  typedUrl: string;
  isStartedEdittingTypedUrl: boolean;
  url: string;
  active: boolean;
  favIcon: string;
};

type InitialTab = {
  id: string;
  title: string;
  typedUrl: string;
  isStartedEdittingTypedUrl: boolean;
  url: string;
  active: boolean;
  favIcon: string;
  indexHTMLPath: string;
};

type AddTabPayload = {
  bounds: ViewBounds;
};

type UpdateTabUrlPayload = {
  id: string;
  // url: string;
};

type AttachTabPayload = {
  id: string;
  url: string | undefined;
  bounds: viewBounds;
};

type SwitchTabPayload = {
  id: string;
  bounds: viewBounds;
};

type URLChangeTabPayload = {
  id: string;
  url: string | undefined;
  bounds: viewBounds;
};

type OnTabNavigatePayload = {
  id: string;
  url: navigatedUrl;
};

type FrameWindowAction = "CLOSE" | "MAXIMIZE" | "MINIMIZE";

type AddTaskResponse = {
  id: number | bigint;
  title: string;
  completed: number;
};

type GetAllTasks = any;

type TabNavigatedCallback = (data: OnTabNavigatePayload) => void;
type TabNavigatedListener = (
  event: Electron.IpcRendererEvent,
  data: OnTabNavigatePayload,
) => void;

type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
  sendFrameAction: FrameWindowAction;
};

type EventPayloadDBAPIResponseMapping = {
  addTask: AddTaskResponse;
  deleteTask: boolean;
  markCompletedTask: boolean;
  getAllTasks: GetAllTasks;
};

type EventDBAPIParamsMapping = {
  addTask: {
    title: string;
  };
  deleteTask: {
    id: number;
  };
  markCompletedTask: {
    id: number;
    completed: number;
  };
  getAllTasks: {};
};

type RoleType = "user" | "assistant" |"developer";

type AIChatMessage = {
  messageId:string;
  role: RoleType;
  content: string;
  rawHTML?: string;
  formControlsInHTMLPage: SerializedFormControl[]
};

//////////

 type SerializedFormSnapshot = {
  html: string;
  formControls: SerializedFormControl[];
};

 type SerializedFormControl =
  | SerializedInput
  | SerializedTextarea
  | SerializedSelect;

 type SerializedInput = {
  tag: "input";
  type: string;

  name: string;
  id: string;

  value: string;

  checked: boolean;

  disabled: boolean;
  required: boolean;

  files?: SerializedFile[];
  filesLength?: number;
  hasFiles?: boolean;
};

 type SerializedTextarea = {
  tag: "textarea";

  name: string;
  id: string;

  value: string;
};

 type SerializedSelect = {
  tag: "select";

  name: string;
  id: string;

  value: string;

  selectedOptions: SerializedSelectOption[];
};

 type SerializedSelectOption = {
  value: string;
  text: string;
};

 type SerializedFile = {
  name: string;

  size: number;

  type: string; // MIME type

  lastModified: number;
};

 type SnapshotSuccess = {
  success: true;
  data: SerializedFormSnapshot;
};

 type SnapshotError = {
  success: false;

  error: {
    message: string;
    stack?: string;
    cause?: unknown;
  };
};

 type SnapshotResponse =
  | SnapshotSuccess
  | SnapshotError;


type WebEventName =
  | "getElementPosition"
  | "click"
  | "rightClick"
  | "mousehover"
  | "type"
  | "keyPress"
  | "scroll";

type BrowserWebPagePayload = {
  eventName: WebEventName;
  step: number;
  selector?: string;
  text?: string;
  key?: string;
  deltaY?: number;
};

type BrowserSummarySection = {
  title: string;
  markdownSubSummary: string;
};

type BrowserWebPagePayloadArray = {
  payloads: BrowserWebPagePayload[];
  summary: BrowserSummarySection[];
};

type WebPageAutomatePayload = {
  id: string;
  // Identifies the AI chat session/conversation (see AIChatHomeComponent).
  // Kept separate from `id`, which is the browser tab id and is needed as-is
  // for multi-tab support.
  chatSessionId: string;

  chatHistory: AIChatMessage[];
};

type GetRawHTMLSourceCodeType = {
  id: string;
};
type WebPageAutomatePayload = {
  id: string;
  query: string;
  rawGridHtml: string;
};

type AgentState = {
  chatId: string;
  stepCursor: number;
  pendingTasks: any[];
  lastDOM: string;
  lastFormControls: any;
  isDone: boolean;
};

type AIChatSheetsAutomateCalledResponseType = {
  status: boolean;
  ai_response: BrowserSummarySection[] | null;
};
type EventPayloadAIChatAutomateResponseMapping = {
  web_page_automate: AIChatSheetsAutomateCalledResponseType;
  get_html_from_view: SnapshotResponse;
};

type EventAIChatAutomateAPIParamsMapping = {
  web_page_automate: GetSheetsAutomateCalledType;
  get_html_from_view: string;
};

type UnsubcribeFunction = () => void;

interface Window {
  browserWebPageApi: {
    getWebPageHTML: (
      id: string,
    ) => Promise<SnapshotResponse>;
    webPageAutomate: (
      payload: GetSheetsAutomateCalledType,
    ) => Promise<AIChatSheetsAutomateCalledResponseType>;
  };
  ethereum: {
    isSlate: () => boolean;
    isMetaMask: () => boolean;
    selectedAddress: () => string | null;
    chainId: () => string;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, cb: (...args: any[]) => void) => void;
    removeListener: (event: string) => void;
  };
  electron: {
    subscribeStatistics: (
      callback: (Statistics: any) => void,
    ) => UnsubcribeFunction;
    getStaticData: () => Promise<StaticData>;
  };

  dbAPI: {
    addTask: (title: string) => Promise<AddTaskResponse>;
    deleteTask: (id: number) => Promise<boolean>;
    markCompletedTask: (params: markCompletedTask) => Promise<boolean>;
    getAllTasks: () => Promise<GetAllTasks>;
  };
  electronBrowserTabs: {
    sendFrameAction: (payload: FrameWindowAction) => void;
    attachTab: (payload: AttachTabPayload) => Promise<Tab>;
    swtichTab: (payload: SwitchTabPayload) => Promise<string>;
    urlChangeTab: (payload: URLChangeTabPayload) => Promise<Tab>;

    addTab: (payload: AddTabPayload) => Promise<Tab>;
    closeTab: (id: string) => Promise<id>;
    updateUrl: (payload: UpdateTabUrlPayload) => Promise<any>;
    back: (id: any) => Promise<any>;
    forward: (id: any) => Promise<any>;
    home: (id: any, homeUrl: string) => Promise<Tab>;

    onNewTabFromPopup: (callback: (url: string) => void) => void;
    onTabNavigated: (
      cb: (data: OnTabNavigatePayload) => void,
    ) => (event: IpcRendererEvent, data: OnTabNavigatePayload) => void;

    offTabNavigated: (
      listener: (event: IpcRendererEvent, data: OnTabNavigatePayload) => void,
    ) => void;
    // onTabNavigated: (cb: (data: OnTabNavigatePayload) => void) => (...args: any[]) => void;
    // offTabNavigated: (listener: (...args: any[]) => void) => void;

    getWindowContentBounds: () => Promise<ViewBounds>;

    updateViewBounds: (bounds: ViewBounds) => void;
    onBrowserInitialize: (cb: (tab: InitialTab) => void) => void;
    sendReady: () => void;
  };
}
