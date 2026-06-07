const STORAGE_KEY = "organize-labs-todo-custom";
const PRESET_KEY = "organize-labs-todo-presets";
const CLOUD_CONFIG_KEY = "organize-labs-todo-cloud-config";
const CLOUD_TABLE = "user_boards";
const PROFILE_TABLE = "user_profiles";
const CONNECTION_TABLE = "friend_connections";
const NOTE_TABLE = "shared_notes";
const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const days = ["M", "T", "W", "T", "F", "S", "S"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneSeedState() {
  return JSON.parse(JSON.stringify(seedState));
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentYearKey() {
  return String(new Date().getFullYear());
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getTodayKey() {
  return getDateKey(new Date());
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function createDateMeta(date) {
  return {
    date,
    key: getDateKey(date),
    day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
    label: String(date.getDate()),
    month: date.toLocaleDateString("en", { month: "short" }),
    isToday: getDateKey(date) === getTodayKey(),
  };
}

function getMonthDates(monthKey = getCurrentMonthKey()) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);
  return Array.from({ length: lastDate.getDate() }, (_, index) => createDateMeta(addDays(firstDate, index)));
}

function getDashboardDates() {
  return getMonthDates(getCurrentMonthKey());
}

function getDateGroupsFromDates(dates) {
  const groups = [];
  for (let index = 0; index < dates.length; index += 7) {
    groups.push({
      dates: dates.slice(index, index + 7),
    });
  }
  return groups;
}

function getVisibleDateGroups() {
  return getDateGroupsFromDates(getDashboardDates());
}

function getDateGroupTitle(group) {
  const first = group.dates[0];
  const last = group.dates[group.dates.length - 1];
  if (!first || !last) return "Dates";
  if (group.dates.some((date) => date.isToday)) return "This Week";
  return `${first.month} ${first.label} - ${last.month} ${last.label}`;
}

const seedState = {
  heroText: "POV: Everyone's sleeping, you're building your future",
  brandText: "@ORGANIZE.LABS",
  boardTitle: "Future Builder",
  activeReview: "weekly",
  selectedMonth: getCurrentMonthKey(),
  selectedYear: getCurrentYearKey(),
  selectedWeekId: "",
  tasks: ["Wake up early", "Deep work", "Workout", "Read", "Plan tomorrow"].map((text) => ({
    id: createId(),
    text,
  })),
  dateChecks: {},
};

seedState.tasks.forEach((task) => {
  seedState.dateChecks[task.id] = {};
});

const colors = ["#f6dce2", "#dce7f4", "#f5efb8", "#dff1de", "#f1ddd2", "#e4def4", "#d7ece7"];
let state = loadState();
const weeksElement = document.querySelector("#weeks");
const input = document.querySelector("#taskInput");
const addButton = document.querySelector("#addButton");
const workbench = document.querySelector(".workbench");
const presetSidebar = document.querySelector(".preset-sidebar");
const mainPanel = document.querySelector(".main-panel");
const sheetBar = document.querySelector(".sheet-bar");
const barActions = document.querySelector(".bar-actions");
const sidebarToggle = document.querySelector("#sidebarToggle");
const preserveButton = document.querySelector("#preserveButton");
const presetList = document.querySelector("#presetList");
const presetCount = document.querySelector("#presetCount");
const loadButton = document.querySelector("#loadButton");
const resetButton = document.querySelector("#resetButton");
const weeklyReviewButton = document.querySelector("#weeklyReviewButton");
const monthlyReviewButton = document.querySelector("#monthlyReviewButton");
const yearlyReviewButton = document.querySelector("#yearlyReviewButton");
const dashboardView = document.querySelector("#dashboardView");
const reviewPage = document.querySelector("#reviewPage");
const backToDashboardButton = document.querySelector("#backToDashboardButton");
const reviewPageTitle = document.querySelector("#reviewPageTitle");
const reviewPageLabel = document.querySelector("#reviewPageLabel");
const reviewPageScore = document.querySelector("#reviewPageScore");
const reviewPageMeta = document.querySelector("#reviewPageMeta");
const reviewDetailGrid = document.querySelector("#reviewDetailGrid");
const reviewChartTitle = document.querySelector("#reviewChartTitle");
const reviewChart = document.querySelector("#reviewChart");
const dashboardChart = document.querySelector("#dashboardChart");
const taskProgressList = document.querySelector("#taskProgressList");
const monthSelect = document.querySelector("#monthSelect");
const yearSelect = document.querySelector("#yearSelect");
const reviewWeekSelect = document.querySelector("#reviewWeekSelect");
const reviewPageWeeklyButton = document.querySelector("#reviewPageWeeklyButton");
const reviewPageMonthlyButton = document.querySelector("#reviewPageMonthlyButton");
const reviewPageYearlyButton = document.querySelector("#reviewPageYearlyButton");
const progressBox = document.querySelector(".progress-box");
const dailyBox = document.querySelector(".daily-box");
const reviewBox = document.querySelector(".review-box");
const mobileProgressHost = document.querySelector("#mobileProgressHost");
const mobileActionsHost = document.querySelector("#mobileActionsHost");
const mobileSidebarHost = document.querySelector("#mobileSidebarHost");
const mobileReviewHost = document.querySelector("#mobileReviewHost");
const cloudStatusLabel = document.querySelector("#cloudStatusLabel");
const cloudStatusDetail = document.querySelector("#cloudStatusDetail");
const sharedPageButton = document.querySelector("#sharedPageButton");
const authOpenButton = document.querySelector("#authOpenButton");
const syncNowButton = document.querySelector("#syncNowButton");
const signOutButton = document.querySelector("#signOutButton");
const cloudModal = document.querySelector("#cloudModal");
const cloudModalBackdrop = document.querySelector("#cloudModalBackdrop");
const cloudModalCloseButton = document.querySelector("#cloudModalCloseButton");
const authPanelStatus = document.querySelector("#authPanelStatus");
const authEmailInput = document.querySelector("#authEmailInput");
const authPasswordInput = document.querySelector("#authPasswordInput");
const authPasswordToggle = document.querySelector("#authPasswordToggle");
const signInButton = document.querySelector("#signInButton");
const signUpButton = document.querySelector("#signUpButton");
const cloudFeedback = document.querySelector("#cloudFeedback");
const heroTextElement = document.querySelector("#heroText");
const brandTextElement = document.querySelector("#brandText");
const boardTitleElement = document.querySelector("#boardTitle");
const sharedPage = document.querySelector("#sharedPage");
const backFromSharedButton = document.querySelector("#backFromSharedButton");
const friendInviteEmailInput = document.querySelector("#friendInviteEmailInput");
const sendFriendInviteButton = document.querySelector("#sendFriendInviteButton");
const sharedInviteFeedback = document.querySelector("#sharedInviteFeedback");
const friendsList = document.querySelector("#friendsList");
const incomingRequestsList = document.querySelector("#incomingRequestsList");
const outgoingRequestsList = document.querySelector("#outgoingRequestsList");
const friendsCountBadge = document.querySelector("#friendsCountBadge");
const incomingCountBadge = document.querySelector("#incomingCountBadge");
const outgoingCountBadge = document.querySelector("#outgoingCountBadge");
const sharedPageStatusTag = document.querySelector("#sharedPageStatusTag");
const sharedPageStatusText = document.querySelector("#sharedPageStatusText");
const sharedNoteInput = document.querySelector("#sharedNoteInput");
const postSharedNoteButton = document.querySelector("#postSharedNoteButton");
const sharedNoteFeedback = document.querySelector("#sharedNoteFeedback");
const sharedEmptyState = document.querySelector("#sharedEmptyState");
const sharedDetail = document.querySelector("#sharedDetail");
const sharedFriendMeta = document.querySelector("#sharedFriendMeta");
const sharedFriendName = document.querySelector("#sharedFriendName");
const sharedFriendStatus = document.querySelector("#sharedFriendStatus");
const sharedHeroStats = document.querySelector("#sharedHeroStats");
const sharedBoardDateLabel = document.querySelector("#sharedBoardDateLabel");
const sharedBoardPreview = document.querySelector("#sharedBoardPreview");
const sharedReviewChartTitle = document.querySelector("#sharedReviewChartTitle");
const sharedReviewChart = document.querySelector("#sharedReviewChart");
const sharedReviewGrid = document.querySelector("#sharedReviewGrid");
const sharedFriendNotesList = document.querySelector("#sharedFriendNotesList");
const sharedBoardPane = document.querySelector("#sharedBoardPane");
const sharedReviewPane = document.querySelector("#sharedReviewPane");
const sharedNotesPane = document.querySelector("#sharedNotesPane");
const sharedBoardTabButton = document.querySelector("#sharedBoardTabButton");
const sharedReviewTabButton = document.querySelector("#sharedReviewTabButton");
const sharedNotesTabButton = document.querySelector("#sharedNotesTabButton");
let selectedPresetId = "";
let supabaseClient = null;
let supabaseModulePromise = null;
let activeCloudConfigSignature = "";
let cloudSubscription = null;
let cloudSession = null;
let cloudUser = null;
let cloudSyncTimer = null;
let cloudSyncPending = false;
let cloudSyncing = false;
let lastCloudSyncAt = "";
let loadedCloudUserId = "";
let hydratingFromCloud = false;
let sharedSchemaReady = true;
let sharedConnections = [];
let sharedProfiles = new Map();
let sharedBoards = new Map();
let sharedNotes = [];
let selectedFriendId = "";
let sharedViewMode = "board";

function getInitialSidebarState() {
  const saved = localStorage.getItem("organize-labs-sidebar-open");
  if (saved === "true") return true;
  if (saved === "false") return false;
  return window.innerWidth > 680;
}

let isSidebarOpen = getInitialSidebarState();

function applyResponsiveLayout() {
  const isMobileLayout = window.innerWidth <= 680;

  if (isMobileLayout) {
    if (mobileProgressHost && progressBox && mobileProgressHost.firstElementChild !== progressBox) {
      mobileProgressHost.append(progressBox);
    }
    if (mobileActionsHost && barActions && mobileActionsHost.firstElementChild !== barActions) {
      mobileActionsHost.append(barActions);
    }
    if (mobileActionsHost && dailyBox && mobileActionsHost.nextElementSibling !== dailyBox) {
      mobileActionsHost.after(dailyBox);
    }
    if (mobileSidebarHost && presetSidebar && mobileSidebarHost.firstElementChild !== presetSidebar) {
      mobileSidebarHost.append(presetSidebar);
    }
    if (mobileReviewHost && reviewBox && mobileReviewHost.firstElementChild !== reviewBox) {
      mobileReviewHost.append(reviewBox);
    }
  } else {
    if (sheetBar && barActions && sheetBar.lastElementChild !== barActions) {
      sheetBar.append(barActions);
    }
    if (dailyBox && progressBox && progressBox.nextElementSibling !== dailyBox) {
      dailyBox.before(progressBox);
    }
    if (reviewBox && mobileSidebarHost && reviewBox.previousElementSibling !== mobileSidebarHost) {
      mobileSidebarHost.after(reviewBox);
    }
    if (mainPanel && presetSidebar && presetSidebar.nextElementSibling !== mainPanel) {
      mainPanel.before(presetSidebar);
    }
  }
}

function getEmbeddedCloudConfig() {
  const config = window.SUPABASE_CONFIG || {};
  return {
    url: typeof config.url === "string" ? config.url.trim() : "",
    anonKey: typeof config.anonKey === "string" ? config.anonKey.trim() : "",
  };
}

function getStoredCloudConfig() {
  const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
  if (!saved) {
    return { url: "", anonKey: "" };
  }

  try {
    const config = JSON.parse(saved);
    return {
      url: typeof config.url === "string" ? config.url.trim() : "",
      anonKey: typeof config.anonKey === "string" ? config.anonKey.trim() : "",
    };
  } catch {
    return { url: "", anonKey: "" };
  }
}

function getCloudConfig() {
  const embedded = getEmbeddedCloudConfig();
  if (embedded.url && embedded.anonKey) {
    return embedded;
  }
  return getStoredCloudConfig();
}

function hasCloudConfig(config = getCloudConfig()) {
  return Boolean(config.url && config.anonKey);
}

function saveCloudConfig(config) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
}

function clearCloudConfig() {
  localStorage.removeItem(CLOUD_CONFIG_KEY);
}

function getCloudConfigSignature(config = getCloudConfig()) {
  return `${config.url}::${config.anonKey}`;
}

function openCloudModal() {
  cloudModal.hidden = false;
  cloudModal.setAttribute("aria-hidden", "false");
}

function closeCloudModal() {
  cloudModal.hidden = true;
  cloudModal.setAttribute("aria-hidden", "true");
}

function setCloudFeedback(message = "", tone = "") {
  cloudFeedback.textContent = message;
  cloudFeedback.className = "cloud-feedback";
  if (tone) {
    cloudFeedback.classList.add(`is-${tone}`);
  }
}

function formatCloudSyncTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function looksLikeEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function sanitizeTaskInputAutofill() {
  const currentValue = input?.value?.trim() || "";
  if (!currentValue || !looksLikeEmail(currentValue)) return;

  const knownEmails = [getCurrentUserEmail(), authEmailInput?.value?.trim().toLowerCase()].filter(Boolean);
  if (knownEmails.includes(currentValue.toLowerCase())) {
    input.value = "";
  }
}

function renderCloudState() {
  const configured = hasCloudConfig();
  const signedIn = Boolean(cloudUser);

  if (!configured) {
    cloudStatusLabel.textContent = "Cloud unavailable";
    cloudStatusDetail.textContent = "Cloud sign-in is temporarily unavailable for this board.";
    authPanelStatus.textContent = "Cloud sign-in is temporarily unavailable.";
  } else if (!signedIn) {
    cloudStatusLabel.textContent = "Cloud ready";
    cloudStatusDetail.textContent = "Create an account or sign in to sync this board.";
    authPanelStatus.textContent = "Create an account or sign in with your email.";
  } else if (cloudSyncing) {
    cloudStatusLabel.textContent = "Syncing";
    cloudStatusDetail.textContent = `Saving as ${cloudUser.email || "your account"}...`;
    authPanelStatus.textContent = `Signed in as ${cloudUser.email || "your account"}.`;
  } else if (cloudSyncPending) {
    cloudStatusLabel.textContent = "Sync queued";
    cloudStatusDetail.textContent = `Changes are waiting to save for ${cloudUser.email || "your account"}.`;
    authPanelStatus.textContent = `Signed in as ${cloudUser.email || "your account"}.`;
  } else {
    cloudStatusLabel.textContent = "Cloud connected";
    cloudStatusDetail.textContent = lastCloudSyncAt
      ? `Saved to ${cloudUser.email || "your account"} at ${formatCloudSyncTime(lastCloudSyncAt)}.`
      : `Signed in as ${cloudUser.email || "your account"}.`;
    authPanelStatus.textContent = `Signed in as ${cloudUser.email || "your account"}.`;
  }

  authOpenButton.textContent = signedIn ? "Account" : "Sign In";
  syncNowButton.hidden = !signedIn;
  signOutButton.hidden = !signedIn;
  syncNowButton.disabled = !signedIn || cloudSyncing;
  signOutButton.disabled = cloudSyncing;
  signInButton.disabled = !configured || cloudSyncing;
  signUpButton.disabled = !configured || cloudSyncing;
}

function setSharedInviteStatus(message = "", tone = "") {
  sharedInviteFeedback.textContent = message;
  sharedInviteFeedback.className = "shared-feedback";
  if (tone) {
    sharedInviteFeedback.classList.add(`is-${tone}`);
  }
}

function setSharedNoteStatus(message = "", tone = "") {
  sharedNoteFeedback.textContent = message;
  sharedNoteFeedback.className = "shared-feedback";
  if (tone) {
    sharedNoteFeedback.classList.add(`is-${tone}`);
  }
}

function resetSharedFeedback() {
  setSharedInviteStatus();
  setSharedNoteStatus();
}

function getCurrentUserEmail() {
  return cloudUser?.email?.trim().toLowerCase() || "";
}

function getDefaultDisplayName(email = "") {
  const [name] = email.split("@");
  return name || "Friend";
}

function getProfileDisplayName(profile, fallbackEmail = "") {
  return profile?.display_name?.trim() || profile?.email || fallbackEmail || "Friend";
}

function getSharedTimestampLabel(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isMissingSharedSchemaError(error) {
  const message = String(error?.message || "");
  return ["friend_connections", "user_profiles", "shared_notes"].some((name) => message.includes(name));
}

function resetSharedCollections() {
  sharedConnections = [];
  sharedProfiles = new Map();
  sharedBoards = new Map();
  sharedNotes = [];
  selectedFriendId = "";
  resetSharedFeedback();
}

function getFriendIdFromConnection(connection) {
  if (!cloudUser) return "";
  return connection.requester_id === cloudUser.id ? connection.invitee_id || "" : connection.requester_id;
}

function getFriendEmailFromConnection(connection) {
  if (!cloudUser) return connection.invitee_email || "";
  if (connection.requester_id === cloudUser.id) {
    return connection.invitee_email || "";
  }
  const friendProfile = sharedProfiles.get(connection.requester_id);
  return friendProfile?.email || connection.invitee_email || "";
}

function getAcceptedFriends() {
  const entries = new Map();

  sharedConnections
    .filter((connection) => connection.status === "accepted")
    .forEach((connection) => {
      const friendId = getFriendIdFromConnection(connection);
      if (!friendId) return;
      const profile = sharedProfiles.get(friendId);
      const board = sharedBoards.get(friendId);
      const boardState = board?.board_state ? buildNormalizedStateSnapshot(board.board_state) : cloneSeedState();

      entries.set(friendId, {
        id: friendId,
        connectionId: connection.id,
        email: getFriendEmailFromConnection(connection),
        name: getProfileDisplayName(profile, getFriendEmailFromConnection(connection)),
        boardState,
        updatedAt: board?.updated_at || connection.updated_at || connection.accepted_at || connection.created_at,
      });
    });

  return [...entries.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function isResolvedByAcceptedFriend(connection) {
  const acceptedFriends = getAcceptedFriends();
  const inviteEmail = (connection.invitee_email || "").toLowerCase();

  return acceptedFriends.some((friend) => {
    const friendEmail = (friend.email || "").toLowerCase();
    return (friend.id && friend.id === connection.requester_id)
      || (friend.id && friend.id === connection.invitee_id)
      || (inviteEmail && friendEmail && inviteEmail === friendEmail);
  });
}

function getIncomingRequests() {
  const currentUserEmail = getCurrentUserEmail();
  return sharedConnections.filter((connection) => {
    if (connection.status !== "pending") return false;
    if (connection.requester_id === cloudUser?.id) return false;
    if (!(connection.invitee_id === cloudUser?.id || connection.invitee_email === currentUserEmail)) return false;
    return !isResolvedByAcceptedFriend(connection);
  });
}

function getOutgoingRequests() {
  return sharedConnections.filter((connection) => {
    if (connection.status !== "pending") return false;
    if (connection.requester_id !== cloudUser?.id) return false;
    return !isResolvedByAcceptedFriend(connection);
  });
}

async function upsertOwnProfile() {
  if (!supabaseClient || !cloudUser) return;
  const email = getCurrentUserEmail();
  if (!email) return;

  const displayName =
    cloudUser.user_metadata?.display_name?.trim() ||
    cloudUser.user_metadata?.full_name?.trim() ||
    getDefaultDisplayName(email);

  const { error } = await supabaseClient.from(PROFILE_TABLE).upsert(
    {
      user_id: cloudUser.id,
      email,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}

async function claimPendingFriendConnections() {
  if (!supabaseClient || !cloudUser) return;
  const currentUserEmail = getCurrentUserEmail();
  if (!currentUserEmail) return;

  const { error } = await supabaseClient
    .from(CONNECTION_TABLE)
    .update({
      invitee_id: cloudUser.id,
      updated_at: new Date().toISOString(),
    })
    .is("invitee_id", null)
    .eq("invitee_email", currentUserEmail);

  if (error) {
    throw error;
  }
}

async function loadSharedData(options = {}) {
  const { preserveSelection = true } = options;

  if (!supabaseClient || !cloudUser) {
    resetSharedCollections();
    renderSharedPage();
    return;
  }

  try {
    await upsertOwnProfile();
    await claimPendingFriendConnections();

    const { data: connectionsData, error: connectionsError } = await supabaseClient
      .from(CONNECTION_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (connectionsError) {
      throw connectionsError;
    }

    sharedConnections = connectionsData || [];

    const friendIds = [...new Set(getAcceptedFriends().map((friend) => friend.id).filter(Boolean))];
    const relatedUserIds = [
      ...new Set(
        sharedConnections
          .flatMap((connection) => [connection.requester_id, connection.invitee_id])
          .filter((id) => id && id !== cloudUser.id),
      ),
    ];

    if (relatedUserIds.length || friendIds.length) {
      const [{ data: profilesData, error: profilesError }, { data: boardsData, error: boardsError }, { data: notesData, error: notesError }] =
        await Promise.all([
          supabaseClient.from(PROFILE_TABLE).select("user_id, email, display_name").in("user_id", relatedUserIds),
          supabaseClient.from(CLOUD_TABLE).select("user_id, board_state, updated_at").in("user_id", friendIds),
          supabaseClient
            .from(NOTE_TABLE)
            .select("id, author_id, body, created_at, updated_at")
            .in("author_id", [...new Set([cloudUser.id, ...friendIds])])
            .order("created_at", { ascending: false })
            .limit(120),
        ]);

      if (profilesError) throw profilesError;
      if (boardsError) throw boardsError;
      if (notesError) throw notesError;

      sharedProfiles = new Map((profilesData || []).map((profile) => [profile.user_id, profile]));
      sharedBoards = new Map((boardsData || []).map((row) => [row.user_id, row]));
      sharedNotes = notesData || [];
    } else {
      sharedProfiles = new Map();
      sharedBoards = new Map();
      sharedNotes = [];
    }

    sharedSchemaReady = true;
    const acceptedFriends = getAcceptedFriends();
    if (!preserveSelection || !acceptedFriends.some((friend) => friend.id === selectedFriendId)) {
      selectedFriendId = acceptedFriends[0]?.id || "";
    }
    renderSharedPage();
  } catch (error) {
    if (isMissingSharedSchemaError(error)) {
      sharedSchemaReady = false;
      resetSharedCollections();
      renderSharedPage();
      setSharedInviteStatus("Supabase SQL を最新に更新すると共有機能が有効になります。", "error");
      return;
    }
    throw error;
  }
}

async function sendFriendInvite() {
  const client = await ensureSupabaseClient();
  if (!client || !cloudUser) {
    openCloudModal();
    setSharedInviteStatus("まずサインインしてください。", "error");
    return;
  }

  const inviteEmail = friendInviteEmailInput.value.trim().toLowerCase();
  if (!inviteEmail) {
    setSharedInviteStatus("招待したいメールアドレスを入力してください。", "error");
    return;
  }
  if (inviteEmail === getCurrentUserEmail()) {
    setSharedInviteStatus("自分自身には招待を送れません。", "error");
    return;
  }

  const { error } = await client.from(CONNECTION_TABLE).insert({
    requester_id: cloudUser.id,
    invitee_email: inviteEmail,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      setSharedInviteStatus("その相手にはすでに招待を送っています。", "error");
      return;
    }
    throw error;
  }

  friendInviteEmailInput.value = "";
  setSharedInviteStatus("招待を送りました。相手が承認すると友達一覧に出ます。", "success");
  await loadSharedData();
}

async function acceptFriendInvite(connectionId) {
  if (!supabaseClient || !cloudUser) return;

  const { error } = await supabaseClient
    .from(CONNECTION_TABLE)
    .update({
      invitee_id: cloudUser.id,
      status: "accepted",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", connectionId);

  if (error) {
    throw error;
  }

  setSharedInviteStatus("共有リクエストを承認しました。", "success");
  await loadSharedData({ preserveSelection: false });
}

async function removeFriendConnection(connectionId, message) {
  if (!supabaseClient || !cloudUser) return;

  const { error } = await supabaseClient.from(CONNECTION_TABLE).delete().eq("id", connectionId);
  if (error) {
    throw error;
  }

  setSharedInviteStatus(message, "success");
  await loadSharedData({ preserveSelection: false });
}

async function postSharedNote() {
  const client = await ensureSupabaseClient();
  if (!client || !cloudUser) {
    openCloudModal();
    setSharedNoteStatus("まずサインインしてください。", "error");
    return;
  }

  const body = sharedNoteInput.value.trim();
  if (!body) {
    setSharedNoteStatus("メモを入力してください。", "error");
    return;
  }

  const { error } = await client.from(NOTE_TABLE).insert({
    author_id: cloudUser.id,
    body,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  sharedNoteInput.value = "";
  setSharedNoteStatus("メモを共有しました。", "success");
  await loadSharedData();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return cloneSeedState();

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return cloneSeedState();
  }
}

function normalizeState(source) {
  const nextState = source || cloneSeedState();
  nextState.activeReview = ["weekly", "monthly", "yearly"].includes(nextState.activeReview) ? nextState.activeReview : "weekly";
  nextState.selectedMonth = nextState.selectedMonth || getCurrentMonthKey();
  nextState.selectedYear = nextState.selectedYear || getCurrentYearKey();
  nextState.selectedWeekId = nextState.selectedWeekId || "";

  if (Array.isArray(nextState.tasks)) {
    nextState.tasks = nextState.tasks.map((task) => ({
      id: task.id || createId(),
      text: task.text || "Untitled",
    }));
    nextState.dateChecks = normalizeDateChecks(nextState);
    nextState.weeks = [];
    return nextState;
  }

  const taskMap = new Map();
  (nextState.weeks || []).forEach((week) => {
    (week.tasks || []).forEach((task) => {
      const key = (task.text || "Untitled").trim().toLowerCase();
      if (!taskMap.has(key)) {
        taskMap.set(key, {
          id: createId(),
          text: task.text || "Untitled",
        });
      }
    });
  });

  const tasks = Array.from(taskMap.values());
  const weeks = (nextState.weeks || []).map((week, weekIndex) => {
    const checks = {};
    tasks.forEach((task) => {
      checks[task.id] = Array(7).fill(false);
    });

    (week.tasks || []).forEach((oldTask) => {
      const key = (oldTask.text || "Untitled").trim().toLowerCase();
      const task = taskMap.get(key);
      if (!task) return;
      const legacyDays = Array.isArray(oldTask.days) ? oldTask.days : Array(7).fill(Boolean(oldTask.done));
      checks[task.id] = days.map((_, index) => Boolean(legacyDays[index]));
    });

    return {
      id: week.id || createId(),
      title: week.title || `Week ${weekIndex + 1}`,
      checks,
    };
  });

  return {
    ...nextState,
    tasks,
    weeks: [],
    dateChecks: migrateWeeksToDateChecks(tasks, weeks),
  };
}

function normalizeDateChecks(source) {
  const dateChecks = source.dateChecks || migrateWeeksToDateChecks(source.tasks, source.weeks || []);
  source.tasks.forEach((task) => {
    if (!dateChecks[task.id]) {
      dateChecks[task.id] = {};
    }
  });

  return dateChecks;
}

function migrateWeeksToDateChecks(tasks, weeks) {
  const dateChecks = {};
  tasks.forEach((task) => {
    dateChecks[task.id] = {};
  });

  weeks.forEach((week, weekIndex) => {
    tasks.forEach((task) => {
      (week.checks?.[task.id] || []).forEach((isDone, dayIndex) => {
        const dateKey = getDateKey(addDays(new Date(), weekIndex * 7 + dayIndex));
        dateChecks[task.id][dateKey] = Boolean(isDone);
      });
    });
  });

  return dateChecks;
}

function buildNormalizedStateSnapshot(source = state) {
  if (!source) {
    return cloneSeedState();
  }
  return normalizeState(JSON.parse(JSON.stringify(source)));
}

function buildNormalizedPresetSnapshot(source = loadPresets()) {
  return source.map((preset) => ({
    ...preset,
    state: buildNormalizedStateSnapshot(preset.state),
  }));
}

function buildCloudDocument() {
  syncEditableState();
  return {
    user_id: cloudUser?.id || null,
    board_state: buildNormalizedStateSnapshot(state),
    preserved_boards: buildNormalizedPresetSnapshot(),
    updated_at: new Date().toISOString(),
  };
}

function serializeCloudDocument(document) {
  return JSON.stringify({
    board_state: buildNormalizedStateSnapshot(document.board_state || cloneSeedState()),
    preserved_boards: buildNormalizedPresetSnapshot(document.preserved_boards || []),
  });
}

function hasMeaningfulLocalData() {
  return serializeCloudDocument(buildCloudDocument()) !== serializeCloudDocument({
    board_state: cloneSeedState(),
    preserved_boards: [],
  });
}

function queueCloudSync(options = {}) {
  const { immediate = false, showMessage = false } = options;
  if (hydratingFromCloud || !supabaseClient || !cloudUser) return;

  cloudSyncPending = true;
  renderCloudState();
  clearTimeout(cloudSyncTimer);
  if (immediate) {
    syncCloudNow({ showMessage }).catch(handleCloudError);
    return;
  }

  cloudSyncTimer = window.setTimeout(() => {
    syncCloudNow({ showMessage: false }).catch(handleCloudError);
  }, 900);
}

function saveState(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (options.queueCloud !== false) {
    queueCloudSync();
  }
}

function loadPresets() {
  const saved = localStorage.getItem(PRESET_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved).map((preset) => ({
      ...preset,
      state: normalizeState(preset.state),
    }));
  } catch {
    return [];
  }
}

function savePresets(presets, options = {}) {
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  if (options.queueCloud !== false) {
    queueCloudSync();
  }
}

function handleCloudError(error) {
  console.error(error);
  cloudSyncPending = false;
  cloudSyncing = false;
  renderCloudState();
  setCloudFeedback(error?.message || "Cloud sync failed.", "error");
}

function handleSharedError(error) {
  console.error(error);
  setSharedInviteStatus(error?.message || "共有機能でエラーが起きました。", "error");
  setSharedNoteStatus(error?.message || "共有機能でエラーが起きました。", "error");
}

async function loadSupabaseModule() {
  if (!supabaseModulePromise) {
    supabaseModulePromise = import(SUPABASE_MODULE_URL);
  }
  return supabaseModulePromise;
}

async function ensureSupabaseClient() {
  const config = getCloudConfig();
  if (!hasCloudConfig(config)) {
    supabaseClient = null;
    activeCloudConfigSignature = "";
    cloudSession = null;
    cloudUser = null;
    loadedCloudUserId = "";
    resetSharedCollections();
    renderCloudState();
    renderSharedPage();
    return null;
  }

  const nextSignature = getCloudConfigSignature(config);
  if (supabaseClient && activeCloudConfigSignature === nextSignature) {
    return supabaseClient;
  }

  if (cloudSubscription?.unsubscribe) {
    cloudSubscription.unsubscribe();
  }

  const { createClient } = await loadSupabaseModule();
  supabaseClient = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  activeCloudConfigSignature = nextSignature;

  const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }

  cloudSession = sessionData.session;
  cloudUser = sessionData.session?.user || null;
  const { data: authData } = supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => {
      handleAuthStateChange(event, session).catch(handleCloudError);
    }, 0);
  });
  cloudSubscription = authData.subscription;
  renderCloudState();

  if (cloudUser) {
    await hydrateFromCloud();
    await loadSharedData();
  }

  return supabaseClient;
}

function getAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

async function fetchCloudRow() {
  if (!supabaseClient || !cloudUser) return null;

  const { data, error } = await supabaseClient
    .from(CLOUD_TABLE)
    .select("user_id, board_state, preserved_boards, updated_at")
    .eq("user_id", cloudUser.id)
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}

function applyCloudRow(row) {
  const nextState = row?.board_state ? buildNormalizedStateSnapshot(row.board_state) : cloneSeedState();
  const nextPresets = row?.preserved_boards ? buildNormalizedPresetSnapshot(row.preserved_boards) : [];

  hydratingFromCloud = true;
  state = nextState;
  saveState({ queueCloud: false });
  savePresets(nextPresets, { queueCloud: false });
  heroTextElement.textContent = state.heroText || seedState.heroText;
  if (brandTextElement) {
    brandTextElement.textContent = state.brandText || seedState.brandText;
  }
  boardTitleElement.textContent = state.boardTitle || seedState.boardTitle;
  selectedPresetId = nextPresets[0]?.id || "";
  hydratingFromCloud = false;
  render();
}

async function syncCloudNow(options = {}) {
  const { showMessage = false } = options;
  if (!supabaseClient || !cloudUser) return;

  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = null;
  cloudSyncPending = false;
  cloudSyncing = true;
  renderCloudState();
  if (showMessage) {
    setCloudFeedback("Saving to the cloud...", "");
  }

  const payload = buildCloudDocument();
  const { data, error } = await supabaseClient
    .from(CLOUD_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("updated_at")
    .limit(1);

  cloudSyncing = false;
  if (error) {
    renderCloudState();
    throw error;
  }

  loadedCloudUserId = cloudUser.id;
  lastCloudSyncAt = data?.[0]?.updated_at || payload.updated_at;
  renderCloudState();
  if (showMessage) {
    setCloudFeedback("Saved to your cloud account.", "success");
  }
}

async function hydrateFromCloud() {
  if (!supabaseClient || !cloudUser) return;
  if (loadedCloudUserId === cloudUser.id) {
    renderCloudState();
    return;
  }

  const remoteRow = await fetchCloudRow();
  const localSnapshot = buildCloudDocument();
  const localMeaningful = hasMeaningfulLocalData();

  if (!remoteRow) {
    loadedCloudUserId = cloudUser.id;
    await syncCloudNow({ showMessage: true });
    return;
  }

  const remoteSnapshotText = serializeCloudDocument(remoteRow);
  const localSnapshotText = serializeCloudDocument(localSnapshot);
  const shouldPrompt = localMeaningful && remoteSnapshotText !== localSnapshotText;

  if (shouldPrompt) {
    const useRemote = window.confirm("このアカウントには既存のクラウドデータがあります。OKでクラウドを読み込み、キャンセルでこの端末の内容をクラウドへ上書きします。");
    if (!useRemote) {
      loadedCloudUserId = cloudUser.id;
      await syncCloudNow({ showMessage: true });
      setCloudFeedback("This device's board is now the cloud version.", "success");
      return;
    }
  }

  applyCloudRow(remoteRow);
  loadedCloudUserId = cloudUser.id;
  lastCloudSyncAt = remoteRow.updated_at || "";
  renderCloudState();
  setCloudFeedback("Cloud board loaded.", "success");
}

async function handleAuthStateChange(event, session) {
  cloudSession = session;
  cloudUser = session?.user || null;
  sanitizeTaskInputAutofill();
  resetSharedFeedback();
  if (!cloudUser) {
    loadedCloudUserId = "";
    cloudSyncPending = false;
    cloudSyncing = false;
    lastCloudSyncAt = "";
    resetSharedCollections();
    renderCloudState();
    renderSharedPage();
    if (event === "SIGNED_OUT") {
      setCloudFeedback("Signed out. The local copy stays on this device.", "success");
    }
    return;
  }

  if (event === "TOKEN_REFRESHED") {
    renderCloudState();
    return;
  }

  if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
    loadedCloudUserId = "";
    renderCloudState();
    await hydrateFromCloud();
    await loadSharedData();
  }
}

function getAuthCredentials() {
  return {
    email: authEmailInput.value.trim(),
    password: authPasswordInput.value,
  };
}

function renderPasswordVisibility() {
  const isVisible = authPasswordInput.type === "text";
  authPasswordToggle.classList.toggle("is-visible", isVisible);
  authPasswordToggle.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
  authPasswordToggle.setAttribute("aria-pressed", String(isVisible));
  authPasswordToggle.title = isVisible ? "Hide password" : "Show password";
}

async function signUpWithEmail() {
  const client = await ensureSupabaseClient();
  if (!client) {
    setCloudFeedback("Cloud sign-in is temporarily unavailable.", "error");
    return;
  }

  const { email, password } = getAuthCredentials();
  if (!email || !password) {
    setCloudFeedback("Email and password are required.", "error");
    return;
  }

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });

  if (error) {
    throw error;
  }

  setCloudFeedback("Account created. If Supabase email confirmation is on, finish it from your inbox.", "success");
}

async function signInWithEmail() {
  const client = await ensureSupabaseClient();
  if (!client) {
    setCloudFeedback("Cloud sign-in is temporarily unavailable.", "error");
    return;
  }

  const { email, password } = getAuthCredentials();
  if (!email || !password) {
    setCloudFeedback("Email and password are required.", "error");
    return;
  }

  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  closeCloudModal();
  setCloudFeedback("Signed in. Checking your cloud board...", "success");
}

async function signOutFromCloud() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    throw error;
  }
}

function syncEditableState() {
  state.heroText = heroTextElement.textContent.trim() || seedState.heroText;
  if (brandTextElement) {
    state.brandText = brandTextElement.textContent.trim() || seedState.brandText;
  }
  state.boardTitle = boardTitleElement.textContent.trim() || seedState.boardTitle;
}

function bindEditable(element, key, fallback) {
  element.textContent = state[key] || fallback;
  element.addEventListener("blur", () => {
    state[key] = element.textContent.trim() || fallback;
    element.textContent = state[key];
    saveState();
  });
  element.addEventListener("keydown", stopEnterLineBreak);
}

function stopEnterLineBreak(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.blur();
  }
}

function renderPresetOptions() {
  const presets = loadPresets();
  presetList.innerHTML = "";
  presetCount.textContent = presets.length;

  if (!presets.length) {
    const empty = document.createElement("div");
    empty.className = "empty-preset";
    empty.textContent = "No preserved boards";
    presetList.append(empty);
    selectedPresetId = "";
    loadButton.disabled = true;
    return;
  }

  if (!presets.some((preset) => preset.id === selectedPresetId)) {
    selectedPresetId = presets[0].id;
  }

  presets.forEach((preset) => {
    const button = document.createElement("div");
    const textWrap = document.createElement("span");
    const name = document.createElement("span");
    const date = document.createElement("span");
    const deleteButton = document.createElement("button");

    button.className = `preset-item${preset.id === selectedPresetId ? " is-active" : ""}`;
    button.role = "button";
    button.tabIndex = 0;
    textWrap.className = "preset-text";
    name.className = "preset-name";
    name.contentEditable = "true";
    name.spellcheck = false;
    date.className = "preset-date";
    deleteButton.type = "button";
    deleteButton.className = "preset-delete";
    deleteButton.textContent = "x";
    deleteButton.ariaLabel = `Delete ${preset.name}`;
    name.textContent = preset.name;
    date.textContent = formatPresetDate(preset.createdAt);

    button.addEventListener("click", () => {
      selectedPresetId = preset.id;
      renderPresetOptions();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedPresetId = preset.id;
        renderPresetOptions();
      }
    });
    name.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedPresetId = preset.id;
      document.querySelectorAll(".preset-item").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
    name.addEventListener("blur", () => {
      renamePreset(preset.id, name.textContent);
    });
    name.addEventListener("keydown", stopEnterLineBreak);
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      deletePreset(preset.id);
    });

    textWrap.append(name, date);
    button.append(textWrap, deleteButton);
    presetList.append(button);
  });
  loadButton.disabled = false;
}

function renderReviewRate() {
  weeklyReviewButton.classList.toggle("is-active", state.activeReview === "weekly");
  monthlyReviewButton.classList.toggle("is-active", state.activeReview === "monthly");
  yearlyReviewButton.classList.toggle("is-active", state.activeReview === "yearly");
  reviewPageWeeklyButton.classList.toggle("is-active", state.activeReview === "weekly");
  reviewPageMonthlyButton.classList.toggle("is-active", state.activeReview === "monthly");
  reviewPageYearlyButton.classList.toggle("is-active", state.activeReview === "yearly");
}

function renderDashboardInsights() {
  renderLineChart(dashboardChart, getVisibleDateGroups().map((group) => getWeekStats({
    title: getDateGroupTitle(group),
    dates: group.dates,
  })));
  const visibleDates = getDashboardDates();
  taskProgressList.innerHTML = "";

  state.tasks.forEach((task) => {
    const total = visibleDates.length;
    const done = visibleDates.reduce((sum, date) => sum + Number(Boolean(state.dateChecks[task.id]?.[date.key])), 0);
    const rate = getRate(done, total);
    const row = document.createElement("div");
    const top = document.createElement("div");
    const name = document.createElement("span");
    const value = document.createElement("span");
    const track = document.createElement("div");
    const fill = document.createElement("span");

    row.className = "task-progress-row";
    top.className = "task-progress-top";
    track.className = "rate-track";
    fill.style.width = `${rate}%`;
    name.textContent = task.text;
    value.textContent = `${rate}%`;

    top.append(name, value);
    track.append(fill);
    row.append(top, track);
    taskProgressList.append(row);
  });
}

function setReviewMode(mode) {
  state.activeReview = mode;
  if (mode === "monthly" && !getMonthKeys().includes(state.selectedMonth)) {
    state.selectedMonth = getMonthKeys()[0] || getCurrentMonthKey();
  }
  if (mode === "yearly" && !getYearKeys().includes(state.selectedYear)) {
    state.selectedYear = getCurrentYearKey();
  }
  saveState();
  renderReviewRate();
  showReviewPage();
}

function getMonthKeys() {
  const dateKeys = getKnownDateKeys();
  return [...new Set(dateKeys.map((dateKey) => dateKey.slice(0, 7)))].sort();
}

function getYearKeys() {
  const yearKeys = new Set(getKnownDateKeys().map((dateKey) => dateKey.slice(0, 4)));
  yearKeys.add(getCurrentYearKey());
  return [...yearKeys].sort((a, b) => b.localeCompare(a));
}

function formatMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function getYearMonthKeys(yearKey) {
  return Array.from({ length: 12 }, (_, index) => `${yearKey}-${String(index + 1).padStart(2, "0")}`);
}

function getKnownDateKeys() {
  const dateKeys = new Set(getDashboardDates().map((date) => date.key));
  Object.values(state.dateChecks).forEach((taskChecks) => {
    Object.keys(taskChecks).forEach((dateKey) => dateKeys.add(dateKey));
  });
  return [...dateKeys].sort();
}

function getWeekStartDate(date) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  return weekStart;
}

function getWeekRanges() {
  const starts = new Map();
  getKnownDateKeys().forEach((dateKey) => {
    const weekStart = getWeekStartDate(new Date(`${dateKey}T00:00:00`));
    const startKey = getDateKey(weekStart);
    if (!starts.has(startKey)) {
      const dates = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return {
          date,
          key: getDateKey(date),
        };
      });
      starts.set(startKey, {
        id: startKey,
        title: `Week of ${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })}`,
        month: startKey.slice(0, 7),
        dates,
      });
    }
  });
  return [...starts.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function getMonthWeekStats(monthKey) {
  return getWeekRanges()
    .map((week) => ({
      ...week,
      dates: week.dates.filter((date) => date.key.startsWith(monthKey)),
    }))
    .filter((week) => week.dates.length)
    .map((week) => getWeekStats(week));
}

function getMonthStats(monthKey) {
  const dates = getMonthDates(monthKey);
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const done = dates.reduce((dateSum, item) => {
    return dateSum + state.tasks.reduce((taskSum, task) => taskSum + Number(Boolean(state.dateChecks[task.id]?.[item.key])), 0);
  }, 0);
  const total = state.tasks.length * dates.length;

  return {
    title: date.toLocaleDateString("en", { month: "long" }),
    chartLabel: date.toLocaleDateString("en", { month: "short" }),
    done,
    total,
    rate: getRate(done, total),
  };
}

function getYearMonthStats(yearKey) {
  return getYearMonthKeys(yearKey).map((monthKey) => getMonthStats(monthKey));
}

function getWeekStats(week) {
  const done = week.dates.reduce((dateSum, date) => {
    return dateSum + state.tasks.reduce((taskSum, task) => taskSum + Number(Boolean(state.dateChecks[task.id]?.[date.key])), 0);
  }, 0);
  const total = state.tasks.length * week.dates.length;

  return {
    title: week.title,
    done,
    total,
    rate: getRate(done, total),
  };
}

function getDayStats(week) {
  return week.dates.map((date) => {
    const done = state.tasks.reduce((sum, task) => sum + Number(Boolean(state.dateChecks[task.id]?.[date.key])), 0);
    const total = state.tasks.length;
    const actualDate = new Date(`${date.key}T00:00:00`);

    return {
      title: new Date(`${date.key}T00:00:00`).toLocaleDateString("en", { weekday: "short" }),
      chartLabel: actualDate.toLocaleDateString("en", { month: "numeric", day: "numeric" }),
      done,
      total,
      rate: getRate(done, total),
    };
  });
}

function getDateStats(date) {
  const done = state.tasks.reduce((sum, task) => sum + Number(Boolean(state.dateChecks[task.id]?.[date.key])), 0);
  const total = state.tasks.length;

  return {
    title: date.label || new Date(`${date.key}T00:00:00`).toLocaleDateString("en", { day: "numeric" }),
    done,
    total,
    rate: getRate(done, total),
  };
}

function getRate(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

function showReviewPage() {
  dashboardView.hidden = true;
  sharedPage.hidden = true;
  reviewPage.hidden = false;
  renderReviewPage();
}

function showDashboard() {
  reviewPage.hidden = true;
  sharedPage.hidden = true;
  dashboardView.hidden = false;
}

function renderReviewPage() {
  reviewWeekSelect.innerHTML = "";
  const weekRanges = getWeekRanges();
  weekRanges.forEach((week) => {
    const option = document.createElement("option");
    option.value = week.id;
    option.textContent = `${week.title} - ${formatMonthKey(week.month)}`;
    reviewWeekSelect.append(option);
  });

  const monthKeys = getMonthKeys();
  monthSelect.innerHTML = "";
  monthKeys.forEach((monthKey) => {
    const option = document.createElement("option");
    option.value = monthKey;
    option.textContent = formatMonthKey(monthKey);
    monthSelect.append(option);
  });

  const yearKeys = getYearKeys();
  yearSelect.innerHTML = "";
  yearKeys.forEach((yearKey) => {
    const option = document.createElement("option");
    option.value = yearKey;
    option.textContent = yearKey;
    yearSelect.append(option);
  });

  const isMonthly = state.activeReview === "monthly";
  const isYearly = state.activeReview === "yearly";
  monthSelect.hidden = !isMonthly;
  yearSelect.hidden = !isYearly;
  reviewWeekSelect.hidden = isMonthly || isYearly;
  reviewDetailGrid.classList.toggle("is-yearly", isYearly);

  if (isMonthly && !monthKeys.includes(state.selectedMonth)) {
    state.selectedMonth = monthKeys[0] || getCurrentMonthKey();
  }
  monthSelect.value = state.selectedMonth;

  if (isYearly && !yearKeys.includes(state.selectedYear)) {
    state.selectedYear = getCurrentYearKey();
  }
  yearSelect.value = state.selectedYear;

  if (!weekRanges.some((week) => week.id === state.selectedWeekId)) {
    state.selectedWeekId = weekRanges.find((week) => week.dates.some((date) => date.key === getTodayKey()))?.id || weekRanges[weekRanges.length - 1]?.id || "";
  }
  reviewWeekSelect.value = state.selectedWeekId;

  const periodStats = isYearly
    ? getYearMonthStats(state.selectedYear)
    : isMonthly
      ? getMonthWeekStats(state.selectedMonth)
      : weekRanges.map((week) => getWeekStats(week));
  const selectedWeek = weekRanges.find((week) => week.id === state.selectedWeekId) || weekRanges[weekRanges.length - 1];
  const selectedWeekStats = selectedWeek ? getWeekStats(selectedWeek) : { title: "Week", rate: 0, done: 0, total: 0 };
  const totalDone = periodStats.reduce((sum, item) => sum + item.done, 0);
  const totalChecks = periodStats.reduce((sum, item) => sum + item.total, 0);
  const totalRate = getRate(totalDone, totalChecks);

  reviewPageTitle.textContent = isYearly ? "Yearly Review" : isMonthly ? "Monthly Review" : "Weekly Review";
  reviewPageLabel.textContent = isYearly ? state.selectedYear : isMonthly ? formatMonthKey(state.selectedMonth) : selectedWeekStats.title;
  reviewPageScore.textContent = `${isYearly || isMonthly ? totalRate : selectedWeekStats.rate}%`;
  reviewPageMeta.textContent = isYearly || isMonthly
    ? `${totalDone} / ${totalChecks} checks completed`
    : `${selectedWeekStats.done} / ${selectedWeekStats.total} checks completed`;

  const detailStats = isYearly ? periodStats : isMonthly ? periodStats : getDayStats(selectedWeek);
  reviewChartTitle.textContent = isYearly ? "Month progress curve" : isMonthly ? "Week progress curve" : "Day progress curve";
  renderReviewChart(detailStats);

  reviewDetailGrid.innerHTML = "";
  detailStats.forEach((item) => {
    const card = document.createElement("article");
    const title = document.createElement("h2");
    const score = document.createElement("strong");
    const meta = document.createElement("span");
    const track = document.createElement("div");
    const fill = document.createElement("span");

    card.className = "review-detail-card";
    title.textContent = item.title;
    score.textContent = `${item.rate}%`;
    meta.textContent = `${item.done} / ${item.total} checks`;
    track.className = "rate-track";
    fill.style.width = `${item.rate}%`;

    track.append(fill);
    card.append(title, score, meta, track);
    reviewDetailGrid.append(card);
  });
}

function renderReviewChart(items) {
  renderLineChart(reviewChart, items);
}

function renderLineChart(svgElement, items) {
  const width = 640;
  const height = 220;
  const padding = 28;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = items.map((item, index) => {
    const x = items.length === 1 ? width / 2 : padding + (chartWidth / (items.length - 1)) * index;
    const y = padding + chartHeight - (chartHeight * item.rate) / 100;
    return { ...item, x, y };
  });
  const linePoints =
    points.length === 1
      ? `${padding},${points[0].y} ${width - padding},${points[0].y}`
      : points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length ? `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}` : "";

  svgElement.innerHTML = `
    <defs>
      <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#b7ee8e" stop-opacity="0.55"></stop>
        <stop offset="100%" stop-color="#b7ee8e" stop-opacity="0.06"></stop>
      </linearGradient>
    </defs>
    <line class="chart-grid" x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}"></line>
    <line class="chart-grid" x1="${padding}" y1="${padding + chartHeight / 2}" x2="${width - padding}" y2="${padding + chartHeight / 2}"></line>
    <line class="chart-grid" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
    <polygon class="chart-area" points="${area}"></polygon>
    <polyline class="chart-line" points="${linePoints}"></polyline>
    ${points
      .map(
        (point) => `
          <g>
            <circle class="chart-dot" cx="${point.x}" cy="${point.y}" r="5"></circle>
            <text class="chart-label" x="${point.x}" y="${height - 8}" text-anchor="middle">${point.chartLabel || point.title.slice(0, 3)}</text>
          </g>
        `,
      )
      .join("")}
  `;
}

function getKnownDateKeysForBoard(boardState) {
  const dateKeys = new Set(getMonthDates(getCurrentMonthKey()).map((date) => date.key));
  Object.values(boardState.dateChecks || {}).forEach((taskChecks) => {
    Object.keys(taskChecks || {}).forEach((dateKey) => dateKeys.add(dateKey));
  });
  return [...dateKeys].sort();
}

function getWeekRangesForBoard(boardState) {
  const starts = new Map();
  getKnownDateKeysForBoard(boardState).forEach((dateKey) => {
    const weekStart = getWeekStartDate(new Date(`${dateKey}T00:00:00`));
    const startKey = getDateKey(weekStart);
    if (!starts.has(startKey)) {
      const dates = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return {
          date,
          key: getDateKey(date),
        };
      });
      starts.set(startKey, {
        id: startKey,
        title: `Week of ${weekStart.toLocaleDateString("en", { month: "short", day: "numeric" })}`,
        month: startKey.slice(0, 7),
        dates,
      });
    }
  });
  return [...starts.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function getBoardMonthStats(boardState, monthKey) {
  const dates = getMonthDates(monthKey);
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  const done = dates.reduce((dateSum, item) => {
    return dateSum + boardState.tasks.reduce((taskSum, task) => taskSum + Number(Boolean(boardState.dateChecks[task.id]?.[item.key])), 0);
  }, 0);
  const total = boardState.tasks.length * dates.length;

  return {
    title: date.toLocaleDateString("en", { month: "long" }),
    chartLabel: date.toLocaleDateString("en", { month: "short" }),
    done,
    total,
    rate: getRate(done, total),
  };
}

function getBoardWeekStats(boardState, week) {
  const done = week.dates.reduce((dateSum, date) => {
    return dateSum + boardState.tasks.reduce((taskSum, task) => taskSum + Number(Boolean(boardState.dateChecks[task.id]?.[date.key])), 0);
  }, 0);
  const total = boardState.tasks.length * week.dates.length;

  return {
    title: week.title,
    done,
    total,
    rate: getRate(done, total),
  };
}

function getBoardMonthWeekStats(boardState, monthKey) {
  return getWeekRangesForBoard(boardState)
    .map((week) => ({
      ...week,
      dates: week.dates.filter((date) => date.key.startsWith(monthKey)),
    }))
    .filter((week) => week.dates.length)
    .map((week) => getBoardWeekStats(boardState, week));
}

function getBoardYearMonthStats(boardState, yearKey) {
  return getYearMonthKeys(yearKey).map((monthKey) => getBoardMonthStats(boardState, monthKey));
}

function getBoardDateStats(boardState, dateKey) {
  const done = boardState.tasks.reduce((sum, task) => sum + Number(Boolean(boardState.dateChecks[task.id]?.[dateKey])), 0);
  const total = boardState.tasks.length;
  return {
    done,
    total,
    rate: getRate(done, total),
  };
}

function getBoardTopHabits(boardState, monthKey, limit = 3) {
  const dates = getMonthDates(monthKey);
  return boardState.tasks
    .map((task) => {
      const done = dates.reduce((sum, date) => sum + Number(Boolean(boardState.dateChecks[task.id]?.[date.key])), 0);
      return {
        id: task.id,
        text: task.text,
        done,
        total: dates.length,
        rate: getRate(done, dates.length),
      };
    })
    .sort((a, b) => (b.rate - a.rate) || a.text.localeCompare(b.text))
    .slice(0, limit);
}

function setSharedViewMode(mode) {
  sharedViewMode = mode;
  sharedBoardTabButton.classList.toggle("is-active", mode === "board");
  sharedReviewTabButton.classList.toggle("is-active", mode === "review");
  sharedNotesTabButton.classList.toggle("is-active", mode === "notes");
  sharedBoardPane.hidden = mode !== "board";
  sharedReviewPane.hidden = mode !== "review";
  sharedNotesPane.hidden = mode !== "notes";
}

function renderFriendList(friends) {
  friendsList.innerHTML = "";
  friendsCountBadge.textContent = String(friends.length);

  if (!friends.length) {
    const empty = document.createElement("div");
    empty.className = "shared-empty-list";
    empty.textContent = "まだ友達がいません。";
    friendsList.append(empty);
    return;
  }

  friends.forEach((friend) => {
    const tile = document.createElement("article");
    const top = document.createElement("div");
    const info = document.createElement("div");
    const name = document.createElement("strong");
    const meta = document.createElement("small");
    const stats = document.createElement("div");
    const todayStat = getBoardDateStats(friend.boardState, getTodayKey());
    const monthStat = getBoardMonthStats(friend.boardState, getCurrentMonthKey());
    const yearStats = getBoardYearMonthStats(friend.boardState, getCurrentYearKey());
    const yearDone = yearStats.reduce((sum, item) => sum + item.done, 0);
    const yearTotal = yearStats.reduce((sum, item) => sum + item.total, 0);
    const statValues = [
      `Today ${todayStat.rate}%`,
      `Month ${monthStat.rate}%`,
      `Year ${getRate(yearDone, yearTotal)}%`,
    ];

    tile.className = `friend-tile${friend.id === selectedFriendId ? " is-active" : ""}`;
    top.className = "friend-tile-top";
    stats.className = "friend-tile-stats";
    name.textContent = friend.name;
    meta.textContent = `${friend.email} · ${getSharedTimestampLabel(friend.updatedAt)}`;

    tile.addEventListener("click", () => {
      selectedFriendId = friend.id;
      renderSharedPage();
    });

    statValues.forEach((label) => {
      const stat = document.createElement("span");
      stat.textContent = label;
      stats.append(stat);
    });

    info.append(name, meta);
    top.append(info);
    tile.append(top, stats);
    friendsList.append(tile);
  });
}

function renderRequestList(container, items, type) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "shared-empty-list";
    empty.textContent = type === "incoming" ? "まだ届いていません。" : "送信中の招待はありません。";
    container.append(empty);
    return;
  }

  items.forEach((connection) => {
    const card = document.createElement("article");
    const name = document.createElement("strong");
    const meta = document.createElement("small");
    const actions = document.createElement("div");

    card.className = "request-card";
    actions.className = "request-actions";
    name.textContent =
      type === "incoming"
        ? getProfileDisplayName(sharedProfiles.get(connection.requester_id), "Friend")
        : connection.invitee_email;
    meta.textContent = `${type === "incoming" ? "Incoming" : "Sent"} · ${getSharedTimestampLabel(connection.created_at)}`;

    if (type === "incoming") {
      const acceptButton = document.createElement("button");
      const declineButton = document.createElement("button");
      acceptButton.className = "cloud-primary";
      declineButton.className = "cloud-secondary";
      acceptButton.type = "button";
      declineButton.type = "button";
      acceptButton.textContent = "Accept";
      declineButton.textContent = "Decline";
      acceptButton.addEventListener("click", () => {
        acceptFriendInvite(connection.id).catch(handleSharedError);
      });
      declineButton.addEventListener("click", () => {
        removeFriendConnection(connection.id, "招待を断りました。").catch(handleSharedError);
      });
      actions.append(acceptButton, declineButton);
    } else {
      const cancelButton = document.createElement("button");
      cancelButton.className = "cloud-secondary";
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => {
        removeFriendConnection(connection.id, "招待を取り消しました。").catch(handleSharedError);
      });
      actions.append(cancelButton);
    }

    card.append(name, meta, actions);
    container.append(card);
  });
}

function renderSharedHero(friend) {
  const todayStats = getBoardDateStats(friend.boardState, getTodayKey());
  const monthStats = getBoardMonthStats(friend.boardState, getCurrentMonthKey());
  const yearStats = getBoardYearMonthStats(friend.boardState, getCurrentYearKey());
  const yearDone = yearStats.reduce((sum, item) => sum + item.done, 0);
  const yearTotal = yearStats.reduce((sum, item) => sum + item.total, 0);
  const topHabits = getBoardTopHabits(friend.boardState, getCurrentMonthKey())
    .map((item) => item.text)
    .join(" / ") || "No habits yet";
  const items = [
    { label: "Today", value: `${todayStats.rate}%`, meta: `${todayStats.done} / ${todayStats.total} checks` },
    { label: "This month", value: `${monthStats.rate}%`, meta: `${monthStats.done} / ${monthStats.total} checks` },
    { label: "This year", value: `${getRate(yearDone, yearTotal)}%`, meta: topHabits },
  ];

  sharedHeroStats.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    const meta = document.createElement("small");

    card.className = "shared-stat-card";
    label.textContent = item.label;
    value.textContent = item.value;
    meta.textContent = item.meta;

    card.append(label, value, meta);
    sharedHeroStats.append(card);
  });
}

function renderSharedBoard(friend) {
  const dates = getMonthDates(getCurrentMonthKey());
  const groups = getDateGroupsFromDates(dates);
  const boardState = friend.boardState;
  sharedBoardDateLabel.textContent = formatMonthKey(getCurrentMonthKey());
  sharedBoardPreview.innerHTML = "";

  const board = document.createElement("div");
  board.className = "shared-board-view";

  const taskColumn = document.createElement("section");
  taskColumn.className = "shared-task-column";
  const taskHeader = document.createElement("div");
  taskHeader.className = "shared-task-column-header";
  taskHeader.textContent = "Tasks";
  taskColumn.append(taskHeader);

  boardState.tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = "shared-task-row";
    row.textContent = task.text;
    taskColumn.append(row);
  });

  board.append(taskColumn);

  groups.forEach((group, groupIndex) => {
    const groupElement = document.createElement("section");
    groupElement.className = `shared-date-group${group.dates.some((date) => date.isToday) ? " has-today" : ""}`;
    groupElement.style.setProperty("--week-color", colors[groupIndex % colors.length]);

    const header = document.createElement("div");
    header.className = "shared-date-group-header";
    header.textContent = getDateGroupTitle(group);
    groupElement.append(header);

    const dateHeader = document.createElement("div");
    dateHeader.className = "shared-date-header";
    group.dates.forEach((date) => {
      const dateCell = document.createElement("div");
      dateCell.className = `shared-date-head-cell${date.isToday ? " is-today" : ""}`;
      dateCell.innerHTML = `<span>${date.day}</span><strong>${date.label}</strong><small>${date.month}</small>`;
      dateHeader.append(dateCell);
    });
    groupElement.append(dateHeader);

    boardState.tasks.forEach((task) => {
      const row = document.createElement("div");
      const track = document.createElement("div");

      row.className = "shared-check-row";
      track.className = "shared-check-track";

      group.dates.forEach((date) => {
        const dot = document.createElement("span");
        dot.className = `shared-check${boardState.dateChecks[task.id]?.[date.key] ? " is-done" : ""}`;
        track.append(dot);
      });

      row.append(track);
      groupElement.append(row);
    });

    board.append(groupElement);
  });

  sharedBoardPreview.append(board);
}

function renderSharedReview(friend) {
  const monthStats = getBoardMonthWeekStats(friend.boardState, getCurrentMonthKey());
  const chartItems = monthStats.length
    ? monthStats.map((item) => ({
        ...item,
        chartLabel: item.title.replace("Week of ", ""),
      }))
    : [{ title: "This month", chartLabel: "Now", done: 0, total: 0, rate: 0 }];

  sharedReviewChartTitle.textContent = `${formatMonthKey(getCurrentMonthKey())} progress curve`;
  renderLineChart(sharedReviewChart, chartItems);
  sharedReviewGrid.innerHTML = "";

  chartItems.forEach((item) => {
    const card = document.createElement("article");
    const title = document.createElement("h2");
    const score = document.createElement("strong");
    const meta = document.createElement("span");
    const track = document.createElement("div");
    const fill = document.createElement("span");

    card.className = "review-detail-card";
    title.textContent = item.title;
    score.textContent = `${item.rate}%`;
    meta.textContent = `${item.done} / ${item.total} checks`;
    track.className = "rate-track";
    fill.style.width = `${item.rate}%`;
    track.append(fill);
    card.append(title, score, meta, track);
    sharedReviewGrid.append(card);
  });
}

function renderSharedNotes(friend) {
  const relevantNotes = sharedNotes.filter((note) => note.author_id === cloudUser?.id || note.author_id === friend.id);
  sharedFriendNotesList.innerHTML = "";

  if (!relevantNotes.length) {
    const empty = document.createElement("div");
    empty.className = "shared-empty-list";
    empty.textContent = "まだ共有メモはありません。";
    sharedFriendNotesList.append(empty);
    return;
  }

  relevantNotes.forEach((note) => {
    const card = document.createElement("article");
    const top = document.createElement("div");
    const author = document.createElement("strong");
    const meta = document.createElement("span");
    const body = document.createElement("p");
    const isSelf = note.author_id === cloudUser?.id;
    const authorProfile = isSelf ? null : sharedProfiles.get(friend.id);

    card.className = `shared-note-card${isSelf ? " is-self" : ""}`;
    top.className = "shared-note-top";
    meta.className = "shared-note-meta";
    author.textContent = isSelf ? "You" : getProfileDisplayName(authorProfile, friend.email);
    meta.textContent = getSharedTimestampLabel(note.created_at);
    body.textContent = note.body;

    top.append(author, meta);
    card.append(top, body);
    sharedFriendNotesList.append(card);
  });
}

function renderSharedPage() {
  const signedIn = Boolean(cloudUser);
  const acceptedFriends = getAcceptedFriends();
  if (acceptedFriends.length && !acceptedFriends.some((friend) => friend.id === selectedFriendId)) {
    selectedFriendId = acceptedFriends[0].id;
  }
  const incoming = getIncomingRequests();
  const outgoing = getOutgoingRequests();
  const selectedFriend = acceptedFriends.find((friend) => friend.id === selectedFriendId) || null;

  incomingCountBadge.textContent = String(incoming.length);
  outgoingCountBadge.textContent = String(outgoing.length);
  renderFriendList(acceptedFriends);
  renderRequestList(incomingRequestsList, incoming, "incoming");
  renderRequestList(outgoingRequestsList, outgoing, "outgoing");

  friendInviteEmailInput.disabled = !signedIn || !sharedSchemaReady;
  sendFriendInviteButton.disabled = !signedIn || !sharedSchemaReady;
  sharedNoteInput.disabled = !signedIn || !sharedSchemaReady || !selectedFriend;
  postSharedNoteButton.disabled = !signedIn || !sharedSchemaReady || !selectedFriend;

  if (!signedIn) {
    sharedPageStatusTag.textContent = "Sign in";
    sharedPageStatusText.textContent = "Sign in to invite friends and see each other's board.";
    sharedEmptyState.hidden = false;
    sharedDetail.hidden = true;
    return;
  }

  if (!sharedSchemaReady) {
    sharedPageStatusTag.textContent = "Setup";
    sharedPageStatusText.textContent = "Supabase に最新の SQL を流すと、共有機能がここで動きます。";
    sharedEmptyState.hidden = false;
    sharedDetail.hidden = true;
    return;
  }

  sharedPageStatusTag.textContent = acceptedFriends.length ? "Connected" : "Ready";
  sharedPageStatusText.textContent = acceptedFriends.length
    ? `${acceptedFriends.length}人とつながっています。相手のボードはここで確認できます。`
    : "友達を招待すると、ここに相手のボードとメモが表示されます。";

  if (!selectedFriend) {
    sharedEmptyState.hidden = false;
    sharedDetail.hidden = true;
    return;
  }

  sharedEmptyState.hidden = true;
  sharedDetail.hidden = false;
  sharedFriendMeta.textContent = "Connected friend";
  sharedFriendName.textContent = selectedFriend.name;
  sharedFriendStatus.textContent = `${selectedFriend.email} · Last sync ${getSharedTimestampLabel(selectedFriend.updatedAt)}`;
  renderSharedHero(selectedFriend);
  renderSharedBoard(selectedFriend);
  renderSharedReview(selectedFriend);
  renderSharedNotes(selectedFriend);
  setSharedViewMode(sharedViewMode);
}

function showSharedPage() {
  dashboardView.hidden = true;
  reviewPage.hidden = true;
  sharedPage.hidden = false;
  resetSharedFeedback();
  renderSharedPage();
  if (cloudUser) {
    loadSharedData().catch(handleSharedError);
  }
}

function renamePreset(id, value) {
  const presets = loadPresets();
  const preset = presets.find((item) => item.id === id);
  if (!preset) return;

  preset.name = value.trim() || "Untitled preset";
  savePresets(presets);
  renderPresetOptions();
}

function deletePreset(id) {
  const presets = loadPresets();
  const preset = presets.find((item) => item.id === id);
  if (!preset) return;

  const confirmed = window.confirm(`"${preset.name}" を削除しますか？`);
  if (!confirmed) return;

  const nextPresets = presets.filter((item) => item.id !== id);
  if (selectedPresetId === id) {
    selectedPresetId = nextPresets[0]?.id || "";
  }
  savePresets(nextPresets);
  renderPresetOptions();
}

function renderSidebarState() {
  workbench.classList.toggle("is-sidebar-closed", !isSidebarOpen);
  sidebarToggle.textContent = isSidebarOpen ? "Hide Tab" : "Show Tab";
  localStorage.setItem("organize-labs-sidebar-open", String(isSidebarOpen));
}

function formatPresetDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function render() {
  state = normalizeState(state);
  weeksElement.innerHTML = "";
  sanitizeTaskInputAutofill();
  renderPresetOptions();
  renderReviewRate();

  const taskColumn = document.createElement("section");
  taskColumn.className = "task-column";
  const taskHeader = document.createElement("div");
  taskHeader.className = "task-column-header";
  taskHeader.textContent = "Tasks";
  taskColumn.append(taskHeader);

  state.tasks.forEach((task) => {
    const row = document.createElement("div");
    const label = document.createElement("span");
    const deleteButton = document.createElement("button");

    row.className = "task-list-row";
    label.className = "task-name";
    label.contentEditable = "true";
    label.spellcheck = false;
    label.textContent = task.text;
    deleteButton.type = "button";
    deleteButton.textContent = "x";
    deleteButton.ariaLabel = "Delete task";

    label.addEventListener("blur", () => {
      task.text = label.textContent.trim() || "Untitled";
      label.textContent = task.text;
      saveState();
      renderTopHabits();
      renderDashboardInsights();
    });
    label.addEventListener("keydown", stopEnterLineBreak);

    deleteButton.addEventListener("click", () => {
      state.tasks = state.tasks.filter((item) => item.id !== task.id);
      delete state.dateChecks[task.id];
      saveState();
      render();
    });

    row.append(label, deleteButton);
    taskColumn.append(row);
  });

  weeksElement.append(taskColumn);

  const visibleGroups = getVisibleDateGroups();
  visibleGroups.forEach((group, groupIndex) => {
    const groupElement = document.createElement("section");
    groupElement.className = `date-group${group.dates.some((date) => date.isToday) ? " has-today" : ""}`;
    groupElement.dataset.today = String(group.dates.some((date) => date.isToday));
    groupElement.style.setProperty("--week-color", colors[groupIndex % colors.length]);

    const header = document.createElement("div");
    header.className = "date-group-header";
    header.textContent = getDateGroupTitle(group);
    groupElement.append(header);

    const dateHeader = document.createElement("div");
    dateHeader.className = "date-header";
    group.dates.forEach((date) => {
      const dateCell = document.createElement("div");
      dateCell.className = `date-head-cell${date.isToday ? " is-today" : ""}`;
      dateCell.dataset.today = String(date.isToday);
      dateCell.innerHTML = `<span>${date.day}</span><strong>${date.label}</strong><small>${date.month}</small>`;
      dateHeader.append(dateCell);
    });
    groupElement.append(dateHeader);

    state.tasks.forEach((task) => {
      const node = document.createElement("div");
      const checks = document.createElement("div");

      node.className = "check-row";
      checks.className = "day-checks";
      group.dates.forEach((date) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(state.dateChecks[task.id]?.[date.key]);
        checkbox.ariaLabel = `${task.text} ${date.key}`;
        checkbox.addEventListener("change", () => {
          if (!state.dateChecks[task.id]) {
            state.dateChecks[task.id] = {};
          }
          state.dateChecks[task.id][date.key] = checkbox.checked;
          saveState();
          updateProgress();
          renderTopHabits();
          renderDashboardInsights();
          renderReviewRate();
          if (!reviewPage.hidden) renderReviewPage();
        });
        checks.append(checkbox);
      });

      node.append(checks);
      groupElement.append(node);
    });

    weeksElement.append(groupElement);
  });

  requestAnimationFrame(scrollTodayToStart);

  updateProgress();
  renderTopHabits();
  renderDashboardInsights();
}

function scrollTodayToStart() {
  const todayCell = weeksElement.querySelector('.date-head-cell[data-today="true"]');
  const targetCell = todayCell || weeksElement.querySelector(".date-head-cell");
  if (!targetCell) return;

  weeksElement.scrollLeft = targetCell.offsetLeft - weeksElement.querySelector(".task-column").offsetWidth;
}

function updateProgress() {
  const visibleDates = getDashboardDates();
  const done = visibleDates.reduce((dateSum, date) => {
    return dateSum + state.tasks.reduce((taskSum, task) => taskSum + Number(Boolean(state.dateChecks[task.id]?.[date.key])), 0);
  }, 0);
  const total = visibleDates.length * state.tasks.length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  document.querySelector("#progressRing").style.setProperty("--progress", progress);
  document.querySelector("#progressText").textContent = `${progress}%`;
  document.querySelector("#doneCount").textContent = done;
  document.querySelector("#totalCount").textContent = total;
}

function renderTopHabits() {
  const visibleDates = getDashboardDates();
  const topHabits = state.tasks
    .filter((task) => visibleDates.some((date) => !state.dateChecks[task.id]?.[date.key]))
    .slice(0, 3);

  const list = document.querySelector("#topHabits");
  list.innerHTML = "";

  if (!topHabits.length) {
    const item = document.createElement("li");
    item.textContent = "All clear. Plan the next move.";
    list.append(item);
    return;
  }

  topHabits.forEach((task) => {
    const item = document.createElement("li");
    item.textContent = task.text;
    list.append(item);
  });
}

function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const task = {
    id: createId(),
    text,
  };
  state.tasks.push(task);
  state.dateChecks[task.id] = {};

  input.value = "";
  saveState();
  render();
}

function preserveCurrentBoard() {
  syncEditableState();
  saveState();

  const defaultName = `${state.boardTitle} ${new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())}`;
  const name = window.prompt("保存名を入力", defaultName);
  if (!name) return;

  const presets = loadPresets();
  presets.unshift({
    id: createId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state)),
  });
  savePresets(presets);
  selectedPresetId = presets[0].id;
  renderPresetOptions();
}

function loadSelectedPreset() {
  const presets = loadPresets();
  const preset = presets.find((item) => item.id === selectedPresetId);
  if (!preset) return;

  state = JSON.parse(JSON.stringify(preset.state));
  state = normalizeState(state);
  saveState();
  heroTextElement.textContent = state.heroText || seedState.heroText;
  if (brandTextElement) {
    brandTextElement.textContent = state.brandText || seedState.brandText;
  }
  boardTitleElement.textContent = state.boardTitle || seedState.boardTitle;
  render();
}

bindEditable(heroTextElement, "heroText", seedState.heroText);
if (brandTextElement) {
  bindEditable(brandTextElement, "brandText", seedState.brandText);
}
bindEditable(boardTitleElement, "boardTitle", seedState.boardTitle);

addButton.addEventListener("click", addTask);
sidebarToggle.addEventListener("click", () => {
  isSidebarOpen = !isSidebarOpen;
  renderSidebarState();
});
preserveButton.addEventListener("click", preserveCurrentBoard);
loadButton.addEventListener("click", loadSelectedPreset);
weeklyReviewButton.addEventListener("click", () => setReviewMode("weekly"));
monthlyReviewButton.addEventListener("click", () => setReviewMode("monthly"));
yearlyReviewButton.addEventListener("click", () => setReviewMode("yearly"));
reviewPageWeeklyButton.addEventListener("click", () => setReviewMode("weekly"));
reviewPageMonthlyButton.addEventListener("click", () => setReviewMode("monthly"));
reviewPageYearlyButton.addEventListener("click", () => setReviewMode("yearly"));
backToDashboardButton.addEventListener("click", showDashboard);
backFromSharedButton.addEventListener("click", showDashboard);
monthSelect.addEventListener("change", () => {
  state.selectedMonth = monthSelect.value;
  saveState();
  renderReviewPage();
});
yearSelect.addEventListener("change", () => {
  state.selectedYear = yearSelect.value;
  saveState();
  renderReviewPage();
});
reviewWeekSelect.addEventListener("change", () => {
  state.selectedWeekId = reviewWeekSelect.value;
  saveState();
  renderReviewPage();
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addTask();
});
friendInviteEmailInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendFriendInvite().catch(handleSharedError);
  }
});

window.addEventListener("resize", applyResponsiveLayout);
sharedPageButton.addEventListener("click", showSharedPage);
authOpenButton.addEventListener("click", openCloudModal);
cloudModalBackdrop.addEventListener("click", closeCloudModal);
cloudModalCloseButton.addEventListener("click", closeCloudModal);
signInButton.addEventListener("click", () => {
  signInWithEmail().catch(handleCloudError);
});
signUpButton.addEventListener("click", () => {
  signUpWithEmail().catch(handleCloudError);
});
authPasswordToggle.addEventListener("click", () => {
  authPasswordInput.type = authPasswordInput.type === "password" ? "text" : "password";
  renderPasswordVisibility();
});
sendFriendInviteButton.addEventListener("click", () => {
  sendFriendInvite().catch(handleSharedError);
});
postSharedNoteButton.addEventListener("click", () => {
  postSharedNote().catch(handleSharedError);
});
sharedBoardTabButton.addEventListener("click", () => {
  setSharedViewMode("board");
});
sharedReviewTabButton.addEventListener("click", () => {
  setSharedViewMode("review");
});
sharedNotesTabButton.addEventListener("click", () => {
  setSharedViewMode("notes");
});
syncNowButton.addEventListener("click", () => {
  queueCloudSync({ immediate: true, showMessage: true });
});
signOutButton.addEventListener("click", () => {
  signOutFromCloud().catch(handleCloudError);
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cloudModal.hidden) {
    closeCloudModal();
  }
});

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("現在のボードを初期状態に戻しますか？Preserveした保存版は残ります。");
  if (!confirmed) return;

  state = cloneSeedState();
  saveState({ queueCloud: false });
  heroTextElement.textContent = state.heroText || seedState.heroText;
  if (brandTextElement) {
    brandTextElement.textContent = state.brandText || seedState.brandText;
  }
  boardTitleElement.textContent = state.boardTitle || seedState.boardTitle;
  render();
  queueCloudSync({ immediate: true, showMessage: true });
});

document.querySelector("#currentDate").textContent = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
}).format(new Date());

applyResponsiveLayout();
renderSidebarState();
render();
renderCloudState();
renderSharedPage();
renderPasswordVisibility();
ensureSupabaseClient().catch(handleCloudError);
