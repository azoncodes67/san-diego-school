(function () {
  "use strict";

  const IMAGE_DATA = {
    "hb-1f": "assets/hb-1f.jpg",
    "hb-2f": "assets/hb-2f.jpg",
    "hb-3f": "assets/hb-3f.jpg",
    "hb-4f": "assets/hb-4f.jpg",
    "shared-1f": "assets/shared-1f.jpg",
    "shared-2f": "assets/shared-2f.jpg",
    "shared-3f": "assets/shared-3f.jpg",
    "shared-4f": "assets/shared-4f.jpg"
  };

  const BUILDINGS = ["HB BLDG", "SB BLDG", "CASTELO BLDG", "LIBAN BLDG"];
  const CLASSROOM_INVENTORY_ITEMS = [
    { id: "tv", label: "T.V" },
    { id: "speakers", label: "SPEAKERS" },
    { id: "waterDispenser", label: "WATER DISPENSER" },
    { id: "printer", label: "PRINTER" },
    { id: "standFan", label: "ELECTRIC FAN (STAND FAN)" },
    { id: "orbitWallFan", label: "ELECTRIC FAN (ORBIT/WALL)" },
    { id: "laptop", label: "LAPTOP" },
    { id: "teachersTable", label: "TEACHERS TABLE" },
    { id: "studentChairWood", label: "STUDENT CHAIR - WOOD" },
    { id: "scMetalWood", label: "S.C METAL + WOOD" },
    { id: "scBlueChairOld", label: "S.C BLUE CHAIR - OLD" },
    { id: "scBlueChairNew", label: "S.C BLUE CHAIR - NEW" },
    { id: "blackBoard", label: "BLACK BOARD" },
    { id: "whiteBoard", label: "WHITE BOARD" }
  ];
  const INVENTORY_COUNT_FIELDS = [
    { id: "schoolProvided", label: "SCHOOL PROVIDED (No. of Items)" },
    { id: "personal", label: "PERSONAL (No. of Items)" },
    { id: "classroomProject", label: "CLASSROOM PROJECT (No. of Items)" }
  ];
  const $ = (id) => document.getElementById(id);
  let selected = "HB BLDG";
  let currentFloor = "1F";
  let selectedRoomKey = null;
  let currentUserRole = null;
  let currentUsername = "";
  let recordCache = new Map();
  let databaseReady = false;
  let activeRoomInfoKey = null;
  let activeRoomContext = null;
  let lastRoomTrigger = null;
  let editingBookId = null;
  let roomListPage = 1;
  let recordsPage = 1;
  let activeRecordsBuilding = null;
  let lastResponsiveBand = window.innerWidth <= 620 ? "phone" : window.innerWidth <= 980 ? "tablet" : "desktop";
  const roomKey = (room) => `${room.name}::${room.x}::${room.y}`;
  const r = (name, x, y, w, h, kind = "Room") => ({ name, x, y, w, h, kind });
  const floor = (image, caption, rooms) => ({ image, caption, rooms });

  const MAPS = {
    'HB BLDG': {
      name: 'HB BUILDING', floors: {
        '1F': floor(IMAGE_DATA['hb-1f'], 'First floor · HB Building', [
          r('MKR',174,12,35,144,'Office / facility'), r('Washing area',209,12,14,144,'Facility'),
          r('Room 104 – Property Office',244,33,156,104), r('Room 105',418,33,146,104), r('Room 106',582,33,289,104),
          r('Reading Corner',888,34,67,89,'Learning area'), r('Room 109',1033,32,140,104), r("Men's restroom",1183,32,133,104,'Restroom'),
          r('Room 103 – Library / SBM',244,211,98,344,'Library'), r('Room 102 – Principal Office',430,211,128,344,'Office'),
          r('Room 107',574,211,293,129), r('Room 108',1002,210,172,132), r('Electrical Room',1178,217,49,124,'Facility'),
          r("Women's restroom",244,574,98,122,'Restroom'), r('Room 101 – Function Room',430,573,128,201), r('Staircase',244,712,99,63,'Facility')
        ]),
        '2F': floor(IMAGE_DATA['hb-2f'], 'Second floor · HB Building', [
          r('Room 204',245,43,179,109), r('Room 205',444,43,147,109), r('Room 206',612,43,263,109), r('Staircase',895,43,120,74,'Facility'), r('Room 209',1035,43,145,109), r("Men's restroom",1190,43,136,109,'Restroom'),
          r('Room 203',245,235,99,339), r("Women's restroom",245,594,98,123,'Restroom'), r('Staircase',245,737,99,69,'Facility'),
          r('Room 202',465,235,126,331), r('Room 201',465,588,126,209), r('Room 207',612,235,263,128), r('LRC',895,235,120,128,'Learning resource center'), r('Room 208',1035,235,145,128), r('Staircase',1254,253,74,110,'Facility')
        ]),
        '3F': floor(IMAGE_DATA['hb-3f'], 'Third floor · HB Building', [
          r('Room 304',216,59,183,108), r('Room 305',418,59,146,108), r('Room 306',583,59,270,108), r('Staircase',871,59,123,75,'Facility'), r('Room 309',1010,59,145,108), r("Men's restroom",1166,59,140,108,'Restroom'),
          r('Room 303',216,253,99,328), r("Women's restroom",216,599,98,121,'Restroom'), r('Staircase',216,740,100,70,'Facility'), r('Room 302',435,253,130,328), r('Room 301',435,600,130,206),
          r('Room 307',583,253,270,127), r('Faculty Room',871,253,122,127,'Staff area'), r('Room 308',1010,253,145,127), r('Training Room',1168,253,44,126), r('Staircase',1231,253,74,126,'Facility')
        ]),
        '4F': floor(IMAGE_DATA['hb-4f'], 'Fourth floor · HB Building', [
          r('Stock Room',216,49,184,112,'Storage'), r('Science Room Stock Room',418,49,82,112,'Storage'), r('Room 403',520,49,171,112), r('Room 404',712,49,146,112), r('Staircase',880,49,124,79,'Facility'), r('Room 407',1025,49,147,112), r("Men's restroom",1180,49,145,112,'Restroom'),
          r('Room 402',216,240,124,351), r("Women's restroom",217,614,123,122,'Restroom'), r('Staircase',217,760,122,54,'Facility'), r('Room 401-B – Conference Room',437,241,132,352,'Conference room'), r('Room 401-A – Conference Room',437,614,132,196,'Conference room'),
          r('Room 405',589,241,271,128), r('ALS Room',880,241,126,128,'Learning area'), r('Room 406',1027,241,139,128), r('Staircase',1249,265,79,105,'Facility')
        ])
      }
    },
    'SB BLDG': {
      name: 'SB BUILDING', floors: {
        '1F': floor(IMAGE_DATA['shared-1f'], 'First floor · shared campus plan (SB Building areas highlighted)', [
          r('Room 106',333,365,111,79), r('Room 105',333,452,111,65), r('Room 104',333,527,111,76), r('Room 103',333,612,111,76), r('Registrar / Clinic / Guidance',333,700,111,99,'Office / student services'),
          r("Women's restroom",482,566,107,54,'Restroom'), r("Men's restroom",482,621,107,60,'Restroom'), r('SDRRM',598,566,66,115,'Safety / DRRM'), r('Room 101-B',821,565,205,55), r('Room 101-A',821,621,205,58), r('Staircase',674,565,149,74,'Facility'), r('Washing area',921,477,95,30,'Facility')
        ]),
        '2F': floor(IMAGE_DATA['shared-2f'], 'Second floor · shared campus plan (SB Building areas highlighted)', [
          r('Room 212',362,391,99,63), r('Room 211',362,472,99,67), r('Room 210',362,562,99,73), r('Room 209',362,657,99,78), r('Room 208',362,752,99,75),
          r("Women's restroom",503,585,89,62,'Restroom'), r("Men's restroom",503,647,89,63,'Restroom'), r('Staircase',672,585,114,83,'Facility'), r('Room 207',784,585,215,126)
        ]),
        '3F': floor(IMAGE_DATA['shared-3f'], 'Third floor · shared campus plan (SB Building areas highlighted)', [
          r('Room 318',377,373,86,63), r('Room 317',377,444,86,72), r('Room 316',377,538,86,72), r('Room 315',377,629,86,79), r('Room 314',377,732,86,91),
          r("Women's restroom",519,582,88,60,'Restroom'), r("Men's restroom",519,642,88,66,'Restroom'), r('Staircase',689,582,179,72,'Facility'), r('Room 313',868,582,205,126)
        ]),
        '4F': floor(IMAGE_DATA['shared-4f'], 'Fourth floor · shared campus plan (SB Building areas highlighted)', [
          r('Room 424',379,371,94,72), r('Room 423',379,460,94,92), r('Room 422',379,571,94,88), r('Room 421',379,677,94,61), r('Room 420',379,751,94,72),
          r("Women's restroom",524,575,97,62,'Restroom'), r("Men's restroom",524,638,97,67,'Restroom'), r('Staircase',696,575,157,74,'Facility'), r('Room 419',854,575,205,126)
        ])
      }
    },
    'CASTELO BLDG': {
      name: 'CASTELO BUILDING', floors: {
        '1F': floor(IMAGE_DATA['shared-1f'], 'First floor · shared campus plan (Castelo Building areas highlighted)', [
          r('Stock Room',274,101,51,114,'Storage'), r("Women's restroom",326,101,39,114,'Restroom'), r('SNED',385,88,195,129,'Learning area'), r('Room 101 – west section',599,89,95,128), r('Room 101 – east section',710,89,93,128), r('Room 102 – west section',847,89,37,128), r('Room 102 – east section',900,89,72,128), r('Sports Room',991,101,83,114), r("Men's restroom",1034,101,39,114,'Restroom'), r('Feeding Room',1196,70,91,102), r('Washing area',1133,69,44,100,'Facility')
        ]),
        '2F': floor(IMAGE_DATA['shared-2f'], 'Second floor · shared campus plan (Castelo Building areas highlighted)', [
          r("Women's restroom",224,92,104,128,'Restroom'), r('Room 204',392,115,143,85), r('Room 205',552,115,155,85), r('Room 206',705,115,170,85), r("Men's restroom",936,95,43,124,'Restroom'), r('Staircase',982,95,53,124,'Facility')
        ]),
        '3F': floor(IMAGE_DATA['shared-3f'], 'Third floor · shared campus plan (Castelo Building areas highlighted)', [
          r("Women's restroom",248,95,59,114,'Restroom'), r('Room 309',365,113,185,78), r('Room 308',573,113,176,78), r('Room 307',766,113,205,78), r("Men's restroom",1028,95,54,114,'Restroom'), r('Staircase',1078,95,39,114,'Facility')
        ]),
        '4F': floor(IMAGE_DATA['shared-4f'], 'Fourth floor · shared campus plan (Castelo Building areas highlighted)', [
          r("Women's restroom",248,85,99,117,'Restroom'), r('Room 410',399,103,152,78), r('Room 411',572,103,164,78), r('Room 412',750,103,202,78), r("Men's restroom",1001,85,98,117,'Restroom'), r('Room 408',1130,50,134,126)
        ])
      }
    },
    'LIBAN BLDG': {
      name: 'LIBAN BUILDING', floors: {
        '1F': floor(IMAGE_DATA['shared-1f'], 'First floor · shared campus plan (Liban Building areas highlighted)', [
          r('Canteen',1195,289,90,202,'Food service'), r('Staircase',1195,494,90,29,'Facility'), r('Common CR',1195,527,94,38,'Restroom'), r('Soup Room',1137,635,147,175,'Food service')
        ]),
        '2F': floor(IMAGE_DATA['shared-2f'], 'Second floor · shared campus plan (Liban Building areas highlighted)', [
          r('Room 204',1113,54,135,112), r('Learning Room',1184,196,64,68,'Learning area'), r('Room 203-B',1112,280,138,109), r('Room 203-A',1112,399,137,106), r('Staircase',1169,522,77,85,'Facility')
        ]),
        '3F': floor(IMAGE_DATA['shared-3f'], 'Third floor · shared campus plan (Liban Building areas highlighted)', [
          r('Room 306',1162,51,104,127), r('ARAL Room',1218,190,76,76,'Learning area'), r('Room 305-B',1191,287,105,104), r('Room 305-A',1191,409,105,86), r('Staircase',1192,518,105,86,'Facility')
        ]),
        '4F': floor(IMAGE_DATA['shared-4f'], 'Fourth floor · shared campus plan (Liban Building areas highlighted)', [
          r('Room 407-B',1162,287,100,102), r('Room 407-A',1162,404,100,90), r('Staircase',1195,514,105,95,'Facility')
        ])
      }
    }
  };

  const BUILDING_LABELS = {
    "HB BLDG": "HB BUILDING",
    "SB BLDG": "SB BUILDING",
    "CASTELO BLDG": "CASTELO BUILDING",
    "LIBAN BLDG": "LIBAN BUILDING"
  };

  function showScreen(screenName) {
    document.body.classList.toggle("app-session-active", screenName !== "loginScreen");
    ["loginScreen", "dashboardScreen", "buildingScreen", "flowchartScreen", "recordsScreen"].forEach((id) => {
      const element = $(id);
      const shouldShow = id === screenName;
      element.classList.toggle("hidden", !shouldShow);
      if (shouldShow) {
        element.classList.remove("is-entering");
        // Restart the entry transition when navigating between screens.
        void element.offsetWidth;
        element.classList.add("is-entering");
        const clearEntryClass = () => {
          element.classList.remove("is-entering");
          element.removeEventListener("animationend", clearEntryClass);
        };
        element.addEventListener("animationend", clearEntryClass);
      } else {
        element.classList.remove("is-entering");
      }
    });
    $("appHeader").classList.toggle("hidden", screenName === "loginScreen");
    $("appFooter").classList.toggle("hidden", screenName === "loginScreen");
    $("navBuildings").setAttribute("aria-current", screenName === "dashboardScreen" || screenName === "buildingScreen" ? "page" : "false");
    $("navRecords").setAttribute("aria-current", screenName === "recordsScreen" ? "page" : "false");
    $("navFlowchart").setAttribute("aria-current", screenName === "flowchartScreen" ? "page" : "false");
    document.body.dataset.screen = screenName;
  }

  function pageSizeForViewport(desktopSize, tabletSize, phoneSize) {
    if (window.innerWidth <= 620) return phoneSize;
    if (window.innerWidth <= 980) return tabletSize;
    return desktopSize;
  }

  function syncPaginationControls(prefix, page, pageCount) {
    const container = $(prefix + "Pagination");
    const previous = $(prefix + "Previous");
    const next = $(prefix + "Next");
    const info = $(prefix + "PageInfo");
    if (!container || !previous || !next || !info) return;
    container.classList.toggle("hidden", pageCount <= 1);
    previous.disabled = page <= 1;
    next.disabled = page >= pageCount;
    info.textContent = "Page " + page + " of " + pageCount;
  }

  function setMobileMapView(viewName) {
    const screen = $("buildingScreen");
    if (!screen) return;
    screen.dataset.mobileView = viewName === "rooms" ? "rooms" : "map";
    document.querySelectorAll("[data-map-view]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.mapView === screen.dataset.mobileView));
    });
  }

  function resetLogin() {
    $("loginForm").reset();
    $("loginError").textContent = "";
    $("password").type = "password";
    $("togglePassword").textContent = "Show";
    $("username").focus();
  }

  $("togglePassword").addEventListener("click", () => {
    const password = $("password");
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    $("togglePassword").textContent = show ? "Hide" : "Show";
    $("togglePassword").setAttribute("aria-label", show ? "Hide password" : "Show password");
  });

  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = $("username").value.trim();
    const password = $("password").value;
    if (!username || !password) {
      $("loginError").textContent = !username ? "Enter your school account email." : "Enter your password.";
      (!username ? $("username") : $("password")).focus();
      return;
    }
    $("loginError").textContent = "Signing in…";
    try {
      const result = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      currentUserRole = result.user.role;
      currentUsername = result.user.username;
      await refreshRecordCache();
      $("loginError").textContent = "";
      $("signedInAs").textContent = currentUsername + " · " + (currentUserRole === "admin" ? "Admin" : "User / Viewer");
      applyRolePermissions();
      renderRecordsDirectory();
      showScreen("dashboardScreen");
    } catch (error) {
      $("loginError").textContent = error.message || "Unable to sign in to the school database.";
      $("password").focus();
    }
  });

  $("signOutButton").addEventListener("click", async () => {
    try { await apiRequest("/api/logout", { method: "POST", body: "{}" }); } catch {}
    recordCache = new Map();
    selected = "HB BLDG";
    currentFloor = "1F";
    selectedRoomKey = null;
    currentUserRole = null;
    currentUsername = "";
    activeRoomContext = null;
    activeRoomInfoKey = null;
    $("roomSearch").value = "";
    closeRoomInfo(false);
    resetLogin();
    showScreen("loginScreen");
  });

  $("brandHome").addEventListener("click", (event) => {
    event.preventDefault();
    showScreen("dashboardScreen");
  });

  $("navBuildings").addEventListener("click", () => showScreen("dashboardScreen"));
  $("navRecords").addEventListener("click", () => { renderRecordsDirectory(); showScreen("recordsScreen"); });
  $("navFlowchart").addEventListener("click", () => {
    renderFlowchart();
    showScreen("flowchartScreen");
  });
  $("backToBuildings").addEventListener("click", () => showScreen("dashboardScreen"));
  $("backFromFlowchart").addEventListener("click", () => showScreen("dashboardScreen"));

  function renderBuildingCards() {
    const box = $("buildingCards");
    box.replaceChildren();
    BUILDINGS.forEach((key, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "building-card";
      button.style.setProperty("--card-index", String(index));
      button.style.setProperty("--card-delay", (index * 55) + "ms");
      button.setAttribute("aria-label", "Open " + MAPS[key].name);

      const icon = document.createElement("span");
      icon.className = "building-card-index";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("strong");
      title.textContent = MAPS[key].name;
      const detail = document.createElement("span");
      detail.className = "building-card-detail";
      detail.textContent = "Open building map";
      const arrow = document.createElement("span");
      arrow.className = "building-card-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "›";
      button.append(icon, title, detail, arrow);
      button.addEventListener("click", () => openBuilding(key));
      box.appendChild(button);
    });
  }

  function openBuilding(key) {
    selected = key;
    currentFloor = "1F";
    selectedRoomKey = null;
    roomListPage = 1;
    $("roomSearch").value = "";
    setMobileMapView("map");
    renderMap();
    showScreen("buildingScreen");
  }

  function renderFlowchart() {
    const box = $("flowBuildings");
    const stepsBox = $("flowSteps");
    box.replaceChildren();
    stepsBox.replaceChildren();
    BUILDINGS.forEach((key) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "flow-building";
      button.textContent = MAPS[key].name;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        box.querySelectorAll("button").forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });
        stepsBox.replaceChildren();
        [MAPS[key].name, "Select floor", "Select room", "View room details"].forEach((label, index, all) => {
          if (index > 0) {
            const arrow = document.createElement("div");
            arrow.className = "flow-arrow";
            arrow.setAttribute("aria-hidden", "true");
            stepsBox.appendChild(arrow);
          }
          const node = document.createElement("div");
          node.className = "flow-node" + (index === 0 ? " flow-selected" : index === all.length - 1 ? " decision" : "");
          node.textContent = label;
          stepsBox.appendChild(node);
        });
      });
      box.appendChild(button);
    });
  }

  function renderMap() {
    const building = MAPS[selected];
    if (!building.floors[currentFloor]) currentFloor = Object.keys(building.floors)[0];
    const floorData = building.floors[currentFloor];

    $("mapTitle").textContent = building.name;
    $("buildingTag").textContent = currentFloor;
    const floorNames = { "1F": "First floor", "2F": "Second floor", "3F": "Third floor", "4F": "Fourth floor" };
    $("mapCaption").textContent = (floorNames[currentFloor] || currentFloor) + " plan";

    const tabs = $("floorTabs");
    tabs.replaceChildren();
    Object.keys(building.floors).forEach((level) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "floor-tab";
      tab.textContent = level;
      tab.setAttribute("aria-pressed", String(level === currentFloor));
      tab.addEventListener("click", () => {
        currentFloor = level;
        selectedRoomKey = null;
        roomListPage = 1;
        $("roomSearch").value = "";
        setMobileMapView("map");
        renderMap();
      });
      tabs.appendChild(tab);
    });

    const image = $("floorImage");
    image.onerror = () => {
      $("mapCaption").textContent = "Floor plan image unavailable. Check the assets folder.";
      image.alt = "Floor plan image unavailable";
      image.classList.remove("floor-image-entering");
    };
    image.classList.remove("floor-image-entering");
    void image.offsetWidth;
    image.src = floorData.image;
    image.alt = building.name + ", " + currentFloor + " floor plan";
    image.classList.add("floor-image-entering");
    image.addEventListener("animationend", () => image.classList.remove("floor-image-entering"), { once: true });

    renderHotspots(floorData.rooms);
    renderRoomList(floorData.rooms);
  }

  function renderHotspots(rooms) {
    const layer = $("hotspots");
    layer.replaceChildren();
    rooms.filter(isNumberedRoom).forEach((room, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "room-hotspot";
      button.style.setProperty("--hotspot-index", String(index));
      button.style.setProperty("--hotspot-delay", (Math.min(index, 8) * 18) + "ms");
      button.style.left = (room.x / 1536 * 100) + "%";
      button.style.top = (room.y / 864 * 100) + "%";
      button.style.width = (room.w / 1536 * 100) + "%";
      button.style.height = (room.h / 864 * 100) + "%";
      button.title = room.name;
      button.dataset.roomKey = roomKey(room);
      button.setAttribute("aria-label", "Open information for " + room.name);
      button.setAttribute("aria-pressed", String(roomKey(room) === selectedRoomKey));
      button.addEventListener("click", (event) => selectRoom(room, event.currentTarget));
      layer.appendChild(button);
    });
  }

  function renderRoomList(rooms) {
    const list = $("roomList");
    const query = $("roomSearch").value.trim().toLocaleLowerCase();
    const filtered = rooms.filter((room) => (room.name + " " + room.kind).toLocaleLowerCase().includes(query));
    const pageSize = pageSizeForViewport(7, 5, 3);
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    roomListPage = Math.min(Math.max(1, roomListPage), pageCount);
    const startIndex = (roomListPage - 1) * pageSize;
    const visibleRooms = filtered.slice(startIndex, startIndex + pageSize);
    $("roomCount").textContent = String(filtered.length);
    list.replaceChildren();
    syncPaginationControls("roomList", roomListPage, pageCount);

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-results";
      empty.textContent = "No matching rooms on this floor.";
      list.appendChild(empty);
      return;
    }

    visibleRooms.forEach((room, offset) => {
      const index = startIndex + offset;
      const isRoom = isNumberedRoom(room);
      const entry = document.createElement(isRoom ? "button" : "div");
      entry.style.setProperty("--item-index", String(index));
      if (isRoom) {
        entry.type = "button";
        entry.dataset.roomKey = roomKey(room);
        entry.setAttribute("aria-pressed", String(roomKey(room) === selectedRoomKey));
        entry.addEventListener("click", (event) => selectRoom(room, event.currentTarget));
      } else {
        entry.setAttribute("aria-disabled", "true");
      }
      entry.className = "room-choice" + (isRoom ? "" : " room-choice-static");
      const title = document.createElement("strong");
      title.textContent = room.name;
      const meta = document.createElement("span");
      meta.textContent = isRoom ? room.kind : room.kind + " · No room popup";
      entry.append(title, meta);
      list.appendChild(entry);
    });
  }

  function canEditRecords() {
    return currentUserRole === "admin";
  }

  function emptyTeacherProfile() {
    return { name: "", gradeSection: "", yearsService: "", itemBorrowed: "" };
  }

  function normaliseTeacherProfile(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      name: typeof source.name === "string" ? source.name : "",
      gradeSection: typeof source.gradeSection === "string" ? source.gradeSection : "",
      yearsService: typeof source.yearsService === "string" ? source.yearsService : "",
      itemBorrowed: typeof source.itemBorrowed === "string" ? source.itemBorrowed : ""
    };
  }

  function normaliseRoomRecord(value) {
    const source = value && typeof value === "object" ? value : {};
    // Migrate the previous single-profile record into the morning schedule.
    const hasSchedules = source.morning || source.afternoon;
    const morning = hasSchedules ? normaliseTeacherProfile(source.morning) : normaliseTeacherProfile(source);
    const afternoon = normaliseTeacherProfile(source.afternoon);
    const books = Array.isArray(source.books) ? source.books.filter((book) => book && typeof book === "object").map((book, index) => ({
      id: typeof book.id === "string" ? book.id : "legacy-book-" + index,
      title: typeof book.title === "string" ? book.title : "",
      authorSubject: typeof book.authorSubject === "string" ? book.authorSubject : "",
      quantity: Number.isInteger(Number(book.quantity)) && Number(book.quantity) >= 0 ? Number(book.quantity) : 1
    })).filter((book) => book.title) : [];
    const inventorySource = source.inventory && typeof source.inventory === "object" && !Array.isArray(source.inventory)
      ? source.inventory : {};
    const itemSource = inventorySource.items && typeof inventorySource.items === "object" ? inventorySource.items : {};
    const inventoryItems = {};
    CLASSROOM_INVENTORY_ITEMS.forEach((item) => {
      const value = itemSource[item.id] && typeof itemSource[item.id] === "object" ? itemSource[item.id] : {};
      inventoryItems[item.id] = {
        schoolProvided: cleanInventoryValue(value.schoolProvided),
        personal: cleanInventoryValue(value.personal),
        classroomProject: cleanInventoryValue(value.classroomProject),
        remarks: cleanInventoryValue(value.remarks)
      };
    });
    // Older local records may contain WINS and duplicate signature fields; they are intentionally ignored.
    return { morning, afternoon, books, inventory: { items: inventoryItems } };
  }

  function cleanInventoryValue(value) {
    return typeof value === "string" ? value.slice(0, 240) : (value == null ? "" : String(value).slice(0, 240));
  }

  function emptyInventoryRecord() {
    const items = {};
    CLASSROOM_INVENTORY_ITEMS.forEach((item) => {
      items[item.id] = { schoolProvided: "", personal: "", classroomProject: "", remarks: "" };
    });
    return { items };
  }

  function roomInfoStorageKey(room, buildingKey = selected, floorKey = currentFloor) {
    return "sd-es-room-info::" + buildingKey + "::" + floorKey + "::" + roomKey(room);
  }

  // Hosted database adapter: works from the TrebEdit front end without running Node.js locally.
  const SD_CONFIG = window.SD_SUPABASE_CONFIG || {};
  const SUPABASE_URL = String(SD_CONFIG.url || "").trim().replace(/\/+$/, "");
  const SUPABASE_KEY = String(SD_CONFIG.publishableKey || SD_CONFIG.anonKey || "").trim();
  const SUPABASE_SESSION_KEY = "sdse_supabase_session_v1";
  let memorySession = null;

  function isSupabaseConfigured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(SUPABASE_URL) &&
      SUPABASE_KEY.length > 20 &&
      !/YOUR-|PASTE-|REPLACE_ME/i.test(SUPABASE_KEY);
  }

  function getStoredSession() {
    try {
      const raw = window.localStorage.getItem(SUPABASE_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* Some file previews restrict persistent storage; memory fallback still works. */ }
    return memorySession;
  }

  function setStoredSession(session) {
    memorySession = session || null;
    try {
      if (session) window.localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(SUPABASE_SESSION_KEY);
    } catch (_) { /* Keep session in memory for this preview if storage is blocked. */ }
  }

  function clearStoredSession() {
    memorySession = null;
    try { window.localStorage.removeItem(SUPABASE_SESSION_KEY); } catch (_) { /* no-op */ }
  }

  async function decodeResponse(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.msg || payload.message || payload.error_description || payload.error ||
        ("Online database request failed (" + response.status + ").");
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function rawSupabaseRequest(path, options = {}) {
    if (!isSupabaseConfigured()) throw new Error("Supabase is not configured. Follow the setup steps in README.txt and fill in config.js.");
    const { method = "GET", body, headers = {}, token = null, useApiKeyAuth = false } = options;
    const requestHeaders = { apikey: SUPABASE_KEY, ...headers };
    if (token) requestHeaders.Authorization = "Bearer " + token;
    else if (useApiKeyAuth) requestHeaders.Authorization = "Bearer " + SUPABASE_KEY;
    if (body !== undefined && !requestHeaders["Content-Type"]) requestHeaders["Content-Type"] = "application/json";
    const response = await fetch(SUPABASE_URL + path, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body)),
      cache: "no-store"
    });
    return decodeResponse(response);
  }

  async function refreshSupabaseSession() {
    const oldSession = getStoredSession();
    if (!oldSession || !oldSession.refresh_token) throw new Error("Your session has expired. Sign in again.");
    const refreshed = await rawSupabaseRequest("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: oldSession.refresh_token }
    });
    setStoredSession(refreshed);
    return refreshed;
  }

  async function authenticatedSupabaseRequest(path, options = {}, retried = false) {
    const session = getStoredSession();
    if (!session || !session.access_token) throw new Error("Sign in again to access the school database.");
    const headers = { ...(options.headers || {}) };
    const method = options.method || "GET";
    const response = await fetch(SUPABASE_URL + path, {
      method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + session.access_token,
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store"
    });
    if (response.status === 401 && !retried && session.refresh_token && !path.startsWith("/auth/v1/token")) {
      await refreshSupabaseSession();
      return authenticatedSupabaseRequest(path, options, true);
    }
    return decodeResponse(response);
  }

  async function getCurrentProfile(authUser) {
    if (!authUser || !authUser.id) throw new Error("Supabase did not return a valid account.");
    const rows = await authenticatedSupabaseRequest(
      "/rest/v1/profiles?select=id,email,username,role&id=eq." + encodeURIComponent(authUser.id) + "&limit=1"
    );
    const profile = Array.isArray(rows) ? rows[0] : null;
    if (!profile || !["admin", "user"].includes(profile.role)) {
      clearStoredSession();
      throw new Error("This account has no school role assigned. Ask the database administrator to add its profile row.");
    }
    return {
      id: profile.id,
      email: profile.email || authUser.email || "",
      username: profile.username || profile.email || authUser.email || "School user",
      role: profile.role
    };
  }

  async function apiRequest(path, options = {}) {
    const body = options.body ? JSON.parse(options.body) : undefined;
    if (path === "/api/status") {
      if (!isSupabaseConfigured()) throw new Error("Set your Supabase project URL and publishable/anon key in config.js, then reopen Preview.");
      return { setupRequired: false, provider: "supabase" };
    }
    if (path === "/api/setup") {
      throw new Error("Create accounts in the Supabase Dashboard. Follow README.txt; account setup is not exposed in the public app.");
    }
    if (path === "/api/login") {
      const email = String(body && body.username || "").trim().toLowerCase();
      const password = String(body && body.password || "");
      if (!email || !email.includes("@")) throw new Error("Enter the email address assigned to your school account.");
      const session = await rawSupabaseRequest("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: { email, password }
      });
      setStoredSession(session);
      try {
        const profile = await getCurrentProfile(session.user);
        return { user: profile };
      } catch (error) {
        try { await rawSupabaseRequest("/auth/v1/logout", { method: "POST", token: session.access_token }); } catch (_) {}
        clearStoredSession();
        throw error;
      }
    }
    if (path === "/api/logout") {
      const session = getStoredSession();
      try {
        if (session && session.access_token) {
          await rawSupabaseRequest("/auth/v1/logout", { method: "POST", token: session.access_token });
        }
      } finally { clearStoredSession(); }
      return {};
    }
    if (path === "/api/me") {
      const session = getStoredSession();
      if (!session || !session.access_token) throw new Error("Sign in again to access the school database.");
      const authUser = await authenticatedSupabaseRequest("/auth/v1/user");
      const profile = await getCurrentProfile(authUser);
      return { user: profile };
    }
    if (path === "/api/records") {
      const rows = await authenticatedSupabaseRequest("/rest/v1/classroom_records?select=record_key,record&order=record_key.asc");
      return { items: (Array.isArray(rows) ? rows : []).map((row) => ({ key: row.record_key, record: row.record })) };
    }
    if (path === "/api/records/save") {
      const session = getStoredSession();
      if (currentUserRole !== "admin") throw new Error("Viewer accounts cannot modify records.");
      if (!body || !body.recordKey || !body.buildingKey || !body.floorKey || !body.roomName) {
        throw new Error("The classroom record is missing required location information.");
      }
      const row = {
        record_key: String(body.recordKey).slice(0, 700),
        building_key: String(body.buildingKey),
        floor_key: String(body.floorKey),
        room_name: String(body.roomName).slice(0, 180),
        record: normaliseRoomRecord(body.record),
        updated_by: session && session.user && session.user.id ? session.user.id : null,
        updated_at: new Date().toISOString()
      };
      const rows = await authenticatedSupabaseRequest(
        "/rest/v1/classroom_records?on_conflict=record_key",
        { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: row }
      );
      const saved = Array.isArray(rows) ? rows[0] : null;
      if (!saved) throw new Error("The database did not return the saved classroom record.");
      return { record: saved.record };
    }
    throw new Error("Unsupported app request: " + path);
  }

  async function refreshRecordCache() {
    const result = await apiRequest("/api/records");
    const next = new Map();
    (Array.isArray(result.items) ? result.items : []).forEach((item) => {
      if (item && typeof item.key === "string") next.set(item.key, normaliseRoomRecord(item.record));
    });
    recordCache = next;
  }

  function readRoomRecord(key) {
    return normaliseRoomRecord(recordCache.get(key) || {});
  }

  async function writeActiveRoomRecord(record, statusElement) {
    if (!canEditRecords() || !activeRoomInfoKey || !activeRoomContext) {
      if (statusElement) statusElement.textContent = "Viewer accounts cannot modify records.";
      return false;
    }
    if (!databaseReady) {
      if (statusElement) statusElement.textContent = "Online database is not configured. Your changes were not saved.";
      return false;
    }
    if (statusElement) statusElement.textContent = "Saving to the shared school database…";
    try {
      const payload = await apiRequest("/api/records/save", {
        method: "POST",
        body: JSON.stringify({
          recordKey: activeRoomInfoKey,
          buildingKey: activeRoomContext.buildingKey,
          floorKey: activeRoomContext.floorKey,
          roomName: activeRoomContext.room.name,
          record: normaliseRoomRecord(record)
        })
      });
      recordCache.set(activeRoomInfoKey, normaliseRoomRecord(payload.record));
      if (statusElement) statusElement.textContent = "Saved to the shared school database.";
      return true;
    } catch (error) {
      if (statusElement) statusElement.textContent = error.message || "Could not save to the school database.";
      return false;
    }
  }

  async function initializeDatabaseClient() {
    const loginForm = $("loginForm");
    const statusLine = $("databaseConnectionStatus");
    loginForm.classList.remove("hidden");
    if (!isSupabaseConfigured()) {
      databaseReady = false;
      statusLine.textContent = "Database setup needed: enter your Supabase project URL and publishable/anon key in config.js. See README.txt.";
      showScreen("loginScreen");
      return;
    }
    databaseReady = true;
    statusLine.textContent = "Online database configured. Sign in with your school account email.";
    const stored = getStoredSession();
    if (stored && stored.access_token) {
      try {
        const session = await apiRequest("/api/me");
        if (session.user) {
          currentUserRole = session.user.role;
          currentUsername = session.user.username;
          await refreshRecordCache();
          statusLine.textContent = "";
          $("signedInAs").textContent = currentUsername + " · " + (currentUserRole === "admin" ? "Admin" : "User / Viewer");
          applyRolePermissions();
          renderRecordsDirectory();
          showScreen("dashboardScreen");
          return;
        }
      } catch (error) {
        clearStoredSession();
        statusLine.textContent = "Session expired. Sign in again to continue.";
      }
    }
    showScreen("loginScreen");
    $("username").focus();
  }

  function applyRolePermissions() {
    const admin = canEditRecords();
    document.querySelectorAll(".admin-only").forEach((element) => {
      element.classList.toggle("hidden", !admin);
    });
    ["morningName", "morningGradeSection", "morningYearsService", "morningItemBorrowed",
      "afternoonName", "afternoonGradeSection", "afternoonYearsService", "afternoonItemBorrowed",
      "bookTitle", "bookAuthorSubject", "bookQuantity"].forEach((id) => {
      const element = $(id);
      if (element) element.disabled = !admin;
    });
    document.querySelectorAll(".inventory-edit").forEach((element) => { element.disabled = !admin; });
    $("signedInAs").textContent = currentUsername ? currentUsername + " · " + (admin ? "Admin" : "User / Viewer") : "";
  }

  function isNumberedRoom(room) {
    return /^room[\s-]*\d{3}(?=$|[\s\-–—])/i.test(String(room && room.name || "").trim());
  }

  function getAllNumberedRooms() {
    const result = [];
    BUILDINGS.forEach((buildingKey) => {
      Object.keys(MAPS[buildingKey].floors).forEach((floorKey) => {
        MAPS[buildingKey].floors[floorKey].rooms.filter(isNumberedRoom).forEach((room) => {
          result.push({ room, buildingKey, floorKey, buildingName: MAPS[buildingKey].name });
        });
      });
    });
    return result;
  }

  function getRecordsBuildings() {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    return BUILDINGS.slice().sort((a, b) => collator.compare(MAPS[a].name, MAPS[b].name));
  }

  function renderRecordsBuildingTabs() {
    const tabs = $("recordsBuildingTabs");
    if (!tabs) return;
    tabs.replaceChildren();
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    getRecordsBuildings().forEach((buildingKey, index) => {
      const roomsInBuilding = getAllNumberedRooms().filter((item) => item.buildingKey === buildingKey);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "records-building-choice";
      button.dataset.buildingKey = buildingKey;
      button.setAttribute("aria-pressed", String(activeRecordsBuilding === buildingKey));
      button.style.setProperty("--building-order", String(index));

      const name = document.createElement("strong");
      name.textContent = MAPS[buildingKey].name;
      const count = document.createElement("span");
      count.className = "records-building-count";
      count.textContent = roomsInBuilding.length + (roomsInBuilding.length === 1 ? " classroom" : " classrooms");
      button.append(name, count);
      button.addEventListener("click", () => {
        activeRecordsBuilding = buildingKey;
        recordsPage = 1;
        $("recordsSearch").value = "";
        $("recordsSearch").disabled = false;
        $("recordsSearch").placeholder = "Search rooms in " + MAPS[buildingKey].name;
        renderRecordsDirectory();
      });
      tabs.appendChild(button);
    });
    tabs.querySelectorAll(".records-building-choice").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.buildingKey === activeRecordsBuilding));
    });
  }

  function renderRecordsDirectory() {
    const list = $("recordsRoomList");
    if (!list) return;
    renderRecordsBuildingTabs();
    const search = $("recordsSearch");
    const empty = $("recordsEmpty");
    const query = search ? search.value.trim().toLocaleLowerCase() : "";
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const allRooms = getAllNumberedRooms();
    const buildingRooms = activeRecordsBuilding
      ? allRooms.filter((item) => item.buildingKey === activeRecordsBuilding)
      : [];
    const records = buildingRooms
      .filter((item) => (item.room.name + " " + item.floorKey).toLocaleLowerCase().includes(query))
      .sort((a, b) => collator.compare(a.room.name, b.room.name) || collator.compare(a.floorKey, b.floorKey));
    const pageSize = pageSizeForViewport(9, 6, 3);
    const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
    recordsPage = Math.min(Math.max(1, recordsPage), pageCount);
    const startIndex = (recordsPage - 1) * pageSize;
    const visibleRecords = records.slice(startIndex, startIndex + pageSize);
    list.replaceChildren();
    if (search) {
      search.disabled = !activeRecordsBuilding;
      search.placeholder = activeRecordsBuilding ? "Search rooms in " + MAPS[activeRecordsBuilding].name : "Choose a building first";
    }
    list.classList.toggle("hidden", !activeRecordsBuilding);
    if (!activeRecordsBuilding) {
      empty.textContent = "Choose one of the buildings above to see its classroom records.";
      empty.classList.remove("hidden");
    } else {
      empty.textContent = "No numbered rooms in this building match your search.";
      empty.classList.toggle("hidden", records.length > 0);
    }
    syncPaginationControls("records", recordsPage, pageCount);
    visibleRecords.forEach((item, offset) => {
      const index = startIndex + offset;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "records-room-card";
      button.setAttribute("aria-label", (index + 1) + ". " + item.room.name + ", " + item.buildingName + ", " + item.floorKey);
      const number = document.createElement("span");
      number.className = "records-room-index";
      number.setAttribute("aria-hidden", "true");
      number.textContent = String(index + 1);
      const title = document.createElement("strong");
      title.textContent = item.room.name;
      const meta = document.createElement("span");
      meta.className = "records-room-meta";
      meta.textContent = item.floorKey;
      const role = document.createElement("span");
      role.className = "records-room-action";
      role.textContent = "View classroom records →";
      button.append(number, title, meta, role);
      button.addEventListener("click", (event) => openRoomInfo(item.room, event.currentTarget, item.buildingKey, item.floorKey));
      list.appendChild(button);
    });
  }

  function fillTeacherInputs(schedule, profile) {
    const prefix = schedule === "morning" ? "morning" : "afternoon";
    $(prefix + "Name").value = profile.name;
    $(prefix + "GradeSection").value = profile.gradeSection;
    $(prefix + "YearsService").value = profile.yearsService;
    $(prefix + "ItemBorrowed").value = profile.itemBorrowed;
  }

  function readTeacherInputs(schedule) {
    const prefix = schedule === "morning" ? "morning" : "afternoon";
    return {
      name: $(prefix + "Name").value.trim(),
      gradeSection: $(prefix + "GradeSection").value.trim(),
      yearsService: $(prefix + "YearsService").value.trim(),
      itemBorrowed: $(prefix + "ItemBorrowed").value.trim()
    };
  }

  function setPopupTab(tabName) {
    document.querySelectorAll("[data-popup-tab]").forEach((button) => {
      const active = button.dataset.popupTab === tabName;
      button.setAttribute("aria-selected", String(active));
      button.classList.toggle("is-active", active);
    });
    document.querySelectorAll("[data-popup-panel]").forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.popupPanel !== tabName);
    });
  }

  function renderInventoryList(record) {
    const inventory = normaliseRoomRecord(record).inventory;
    const meta = $("inventoryRoomMeta");
    const context = activeRoomContext;
    meta.textContent = context
      ? "Building: " + MAPS[context.buildingKey].name + " · Room No.: " + context.room.name + " · Floor: " + context.floorKey
      : "Building and room information unavailable";

    const tableWrap = $("classroomInventoryTable");
    tableWrap.replaceChildren();
    const table = document.createElement("table");
    table.className = "inventory-table";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["ITEMS", ...INVENTORY_COUNT_FIELDS.map((field) => field.label), "REMARKS (Usable/Broken/Have bad issue)"].forEach((label) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    const tbody = document.createElement("tbody");
    CLASSROOM_INVENTORY_ITEMS.forEach((item) => {
      const row = document.createElement("tr");
      const itemCell = document.createElement("th");
      itemCell.scope = "row";
      itemCell.className = "inventory-item-name";
      itemCell.textContent = item.label;
      row.appendChild(itemCell);
      const values = inventory.items[item.id] || {};
      INVENTORY_COUNT_FIELDS.forEach((field) => {
        const cell = document.createElement("td");
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "99999";
        input.step = "1";
        input.inputMode = "numeric";
        input.className = "inventory-edit inventory-count-input";
        input.value = values[field.id] || "";
        input.dataset.inventorySection = "items";
        input.dataset.itemId = item.id;
        input.dataset.inventoryField = field.id;
        input.setAttribute("aria-label", item.label + " — " + field.label);
        input.disabled = !canEditRecords();
        cell.appendChild(input);
        row.appendChild(cell);
      });
      const remarksCell = document.createElement("td");
      const remarks = document.createElement("input");
      remarks.type = "text";
      remarks.maxLength = 240;
      remarks.className = "inventory-edit inventory-remarks-input";
      remarks.value = values.remarks || "";
      remarks.placeholder = "Condition / issue";
      remarks.dataset.inventorySection = "items";
      remarks.dataset.itemId = item.id;
      remarks.dataset.inventoryField = "remarks";
      remarks.setAttribute("aria-label", item.label + " — remarks (usable/broken/have bad issue)");
      remarks.disabled = !canEditRecords();
      remarksCell.appendChild(remarks);
      row.appendChild(remarksCell);
      tbody.appendChild(row);
    });
    table.append(thead, tbody);
    tableWrap.appendChild(table);

    $("inventoryStatus").textContent = "";
  }

  function readInventoryInputs() {
    const inventory = emptyInventoryRecord();
    document.querySelectorAll('#inventoryForm [data-inventory-section="items"]').forEach((input) => {
      const itemId = input.dataset.itemId;
      const field = input.dataset.inventoryField;
      const value = input.value.trim();
      if (inventory.items[itemId] && Object.prototype.hasOwnProperty.call(inventory.items[itemId], field)) {
        inventory.items[itemId][field] = value;
      }
    });
    return inventory;
  }

  function resetBookForm() {
    editingBookId = null;
    $("bookRecordId").value = "";
    $("bookTitle").value = "";
    $("bookAuthorSubject").value = "";
    $("bookQuantity").value = "1";
    $("saveBookButton").textContent = "Add book";
    $("cancelBookEdit").classList.add("hidden");
  }

  function renderBookList(record) {
    const list = $("bookList");
    list.replaceChildren();
    const books = Array.isArray(record.books) ? record.books : [];
    if (!books.length) {
      const empty = document.createElement("p");
      empty.className = "empty-results";
      empty.textContent = "No books recorded for this classroom yet.";
      list.appendChild(empty);
      return;
    }
    books.forEach((book, index) => {
      const card = document.createElement("article");
      card.className = "book-record";
      card.style.setProperty("--item-index", String(index));
      card.style.setProperty("--item-delay", (Math.min(index, 10) * 18) + "ms");
      const title = document.createElement("strong");
      title.textContent = book.title;
      const meta = document.createElement("p");
      const pieces = [];
      if (book.authorSubject) pieces.push(book.authorSubject);
      pieces.push("Quantity: " + book.quantity);
      meta.textContent = pieces.join(" · ");
      card.append(title, meta);
      if (canEditRecords()) {
        const actions = document.createElement("div");
        actions.className = "book-record-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "secondary-button small-action";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => {
          if (!canEditRecords() || !activeRoomInfoKey) return;
          editingBookId = book.id;
          $("bookRecordId").value = book.id;
          $("bookTitle").value = book.title;
          $("bookAuthorSubject").value = book.authorSubject;
          $("bookQuantity").value = String(book.quantity);
          $("saveBookButton").textContent = "Save changes";
          $("cancelBookEdit").classList.remove("hidden");
          $("bookTitle").focus();
        });
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "secondary-button small-action danger-action";
        remove.textContent = "Delete";
        remove.addEventListener("click", async () => {
          if (!canEditRecords() || !activeRoomInfoKey) return;
          if (!window.confirm("Delete this book record from this classroom?")) return;
          const current = readRoomRecord(activeRoomInfoKey);
          current.books = current.books.filter((entry) => entry.id !== book.id);
          if (await writeActiveRoomRecord(current, $("bookStatus"))) {
            renderBookList(current);
            resetBookForm();
          }
        });
        actions.append(edit, remove);
        card.appendChild(actions);
      }
      list.appendChild(card);
    });
  }

  async function openRoomInfo(room, trigger, buildingKey = selected, floorKey = currentFloor) {
    // Only room names beginning with Room plus a three-digit number can open this popup.
    if (!isNumberedRoom(room)) return;
    activeRoomContext = { room, buildingKey, floorKey };
    activeRoomInfoKey = roomInfoStorageKey(room, buildingKey, floorKey);
    lastRoomTrigger = trigger || document.activeElement;
    selectedRoomKey = roomKey(room);
    document.querySelectorAll("#hotspots .room-hotspot, #roomList .room-choice[data-room-key]").forEach((entry) => {
      entry.setAttribute("aria-pressed", String(entry.dataset.roomKey === selectedRoomKey));
    });

    try {
      await refreshRecordCache();
    } catch (error) {
      window.alert("Could not refresh classroom records from the database. Check the server connection and sign in again.\n\n" + (error.message || "Connection error."));
      return;
    }
    const record = readRoomRecord(activeRoomInfoKey);
    $("roomPopupTitle").textContent = room.name;
    $("roomPopupDescription").textContent = MAPS[buildingKey].name + " · " + floorKey;
    fillTeacherInputs("morning", record.morning);
    fillTeacherInputs("afternoon", record.afternoon);
    $("roomInfoStatus").textContent = "";
    $("bookStatus").textContent = "";
    resetBookForm();
    renderBookList(record);
    renderInventoryList(record);
    setPopupTab("teachers");
    applyRolePermissions();
    $("roomInfoPopup").classList.remove("hidden");
    const popupCard = $("roomInfoPopup").querySelector(".room-popup-card");
    popupCard.classList.remove("popup-entering");
    void popupCard.offsetWidth;
    popupCard.classList.add("popup-entering");
    popupCard.addEventListener("animationend", () => popupCard.classList.remove("popup-entering"), { once: true });
    document.body.classList.add("popup-open");
    window.setTimeout(() => {
      const focusTarget = canEditRecords() ? $("morningName") : $("cancelRoomInfo");
      if (focusTarget) focusTarget.focus();
    }, 0);
  }

  function closeRoomInfo(restoreFocus = true) {
    if (!$("roomInfoPopup")) return;
    $("roomInfoPopup").classList.add("hidden");
    document.body.classList.remove("popup-open");
    activeRoomInfoKey = null;
    activeRoomContext = null;
    editingBookId = null;
    if (restoreFocus && lastRoomTrigger && lastRoomTrigger.isConnected && typeof lastRoomTrigger.focus === "function") lastRoomTrigger.focus();
    lastRoomTrigger = null;
  }

  function selectRoom(room, trigger) {
    if (!isNumberedRoom(room)) return;
    openRoomInfo(room, trigger);
  }

  $("roomInfoForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canEditRecords() || !activeRoomInfoKey) {
      $("roomInfoStatus").textContent = "Viewer accounts cannot modify records.";
      return;
    }
    const record = readRoomRecord(activeRoomInfoKey);
    record.morning = readTeacherInputs("morning");
    record.afternoon = readTeacherInputs("afternoon");
    await writeActiveRoomRecord(record, $("roomInfoStatus"));
  });

  $("inventoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canEditRecords() || !activeRoomInfoKey) {
      $("inventoryStatus").textContent = "Viewer accounts cannot modify records.";
      return;
    }
    const record = readRoomRecord(activeRoomInfoKey);
    record.inventory = readInventoryInputs();
    // Counts should be blank or non-negative whole numbers.
    for (const [itemId, item] of Object.entries(record.inventory.items)) {
      for (const field of ["schoolProvided", "personal", "classroomProject"]) {
        const value = item[field];
        if (value !== "" && (!/^\d+$/.test(value) || Number(value) > 99999)) {
          $("inventoryStatus").textContent = "Counts must be blank or whole numbers from 0 to 99,999.";
          const badInput = document.querySelector('[data-inventory-section="items"][data-item-id="' + itemId + '"][data-inventory-field="' + field + '"]');
          if (badInput) badInput.focus();
          return;
        }
      }
    }
    if (await writeActiveRoomRecord(record, $("inventoryStatus"))) {
      renderInventoryList(record);
      $("inventoryStatus").textContent = "Classroom inventory saved to the school database.";
    }
  });

  $("bookForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canEditRecords() || !activeRoomInfoKey) {
      $("bookStatus").textContent = "Viewer accounts cannot modify records.";
      return;
    }
    const title = $("bookTitle").value.trim();
    const authorSubject = $("bookAuthorSubject").value.trim();
    const quantityText = $("bookQuantity").value;
    const quantity = Number(quantityText);
    if (!title) {
      $("bookStatus").textContent = "Enter a book title.";
      $("bookTitle").focus();
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99999) {
      $("bookStatus").textContent = "Quantity must be a whole number from 0 to 99,999.";
      $("bookQuantity").focus();
      return;
    }
    const record = readRoomRecord(activeRoomInfoKey);
    if (editingBookId) {
      const book = record.books.find((entry) => entry.id === editingBookId);
      if (!book) {
        $("bookStatus").textContent = "This book record was not found. Refresh the room and try again.";
        resetBookForm();
        return;
      }
      book.title = title;
      book.authorSubject = authorSubject;
      book.quantity = quantity;
    } else {
      record.books.push({ id: "book-" + Date.now() + "-" + Math.floor(Math.random() * 100000), title, authorSubject, quantity });
    }
    if (await writeActiveRoomRecord(record, $("bookStatus"))) {
      renderBookList(record);
      resetBookForm();
      $("bookStatus").textContent = "Book record saved to the school database.";
    }
  });

  $("cancelBookEdit").addEventListener("click", resetBookForm);
  document.querySelectorAll("[data-popup-tab]").forEach((button) => {
    button.addEventListener("click", () => setPopupTab(button.dataset.popupTab));
  });
  $("closeRoomPopup").addEventListener("click", () => closeRoomInfo());
  $("cancelRoomInfo").addEventListener("click", () => closeRoomInfo());
  $("roomInfoPopup").addEventListener("click", (event) => {
    if (event.target === $("roomInfoPopup")) closeRoomInfo();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("roomInfoPopup").classList.contains("hidden")) closeRoomInfo();
  });

  $("recordsSearch").addEventListener("input", () => {
    recordsPage = 1;
    renderRecordsDirectory();
  });

  $("roomSearch").addEventListener("input", () => {
    roomListPage = 1;
    if (selected && MAPS[selected].floors[currentFloor]) {
      renderRoomList(MAPS[selected].floors[currentFloor].rooms);
    }
  });

  $("roomListPrevious").addEventListener("click", () => {
    if (roomListPage > 1) roomListPage -= 1;
    renderRoomList(MAPS[selected].floors[currentFloor].rooms);
  });
  $("roomListNext").addEventListener("click", () => {
    roomListPage += 1;
    renderRoomList(MAPS[selected].floors[currentFloor].rooms);
  });
  $("recordsPrevious").addEventListener("click", () => {
    if (recordsPage > 1) recordsPage -= 1;
    renderRecordsDirectory();
  });
  $("recordsNext").addEventListener("click", () => {
    recordsPage += 1;
    renderRecordsDirectory();
  });
  document.querySelectorAll("[data-map-view]").forEach((button) => {
    button.addEventListener("click", () => setMobileMapView(button.dataset.mapView));
  });

  window.addEventListener("resize", () => {
    const nextBand = window.innerWidth <= 620 ? "phone" : window.innerWidth <= 980 ? "tablet" : "desktop";
    if (nextBand === lastResponsiveBand) return;
    lastResponsiveBand = nextBand;
    roomListPage = 1;
    recordsPage = 1;
    if (selected && MAPS[selected].floors[currentFloor]) renderRoomList(MAPS[selected].floors[currentFloor].rooms);
    renderRecordsDirectory();
  });

  renderBuildingCards();
  renderRecordsDirectory();
  applyRolePermissions();
  showScreen("loginScreen");
  initializeDatabaseClient();
})();
