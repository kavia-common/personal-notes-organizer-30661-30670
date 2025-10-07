const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Initial default data structure
const defaultData = {
  users: [], // { id, email, passwordHash, name, createdAt }
  notes: [], // { id, userId, title, content, tags: [], createdAt, updatedAt, pinned, archived }
  meta: {
    version: 1
  }
};

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // As a safe fallback for environments where fs might not be writable
    // We won't throw here; the app can run purely in-memory if writing fails.
    console.warn('[store] Unable to ensure data directory:', e.message);
  }
}

// Load data from file or return defaults
function loadData() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.warn('[store] Failed to read data file, continuing with in-memory data:', e.message);
  }
  return JSON.parse(JSON.stringify(defaultData));
}

// Persist data to file (best-effort)
function saveData(data) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[store] Failed to write data file (running in-memory only):', e.message);
  }
}

let db = loadData();

// PUBLIC_INTERFACE
function getUsers() {
  /** Returns all users (internal use). */
  return db.users;
}

// PUBLIC_INTERFACE
function getNotes() {
  /** Returns all notes (internal use). */
  return db.notes;
}

// PUBLIC_INTERFACE
function addUser(user) {
  /** Adds a new user and persists. */
  db.users.push(user);
  saveData(db);
  return user;
}

// PUBLIC_INTERFACE
function findUserByEmail(email) {
  /** Finds a user by email. */
  return db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

// PUBLIC_INTERFACE
function findUserById(id) {
  /** Finds a user by ID. */
  return db.users.find((u) => u.id === id);
}

// PUBLIC_INTERFACE
function addNote(note) {
  /** Adds a new note and persists. */
  db.notes.push(note);
  saveData(db);
  return note;
}

// PUBLIC_INTERFACE
function findNoteById(id) {
  /** Finds a note by ID. */
  return db.notes.find((n) => n.id === id);
}

// PUBLIC_INTERFACE
function updateNote(id, updates) {
  /** Updates a note with partial updates and persists. */
  const idx = db.notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  db.notes[idx] = { ...db.notes[idx], ...updates, updatedAt: new Date().toISOString() };
  saveData(db);
  return db.notes[idx];
}

// PUBLIC_INTERFACE
function deleteNote(id) {
  /** Deletes a note by ID and persists. */
  const before = db.notes.length;
  db.notes = db.notes.filter((n) => n.id !== id);
  const changed = db.notes.length !== before;
  if (changed) saveData(db);
  return changed;
}

// PUBLIC_INTERFACE
function replaceAllNotesForUser(userId, notes) {
  /** Utility for bulk operations (not used initially). */
  db.notes = db.notes.filter((n) => n.userId !== userId).concat(notes);
  saveData(db);
  return true;
}

module.exports = {
  getUsers,
  getNotes,
  addUser,
  findUserByEmail,
  findUserById,
  addNote,
  findNoteById,
  updateNote,
  deleteNote,
  replaceAllNotesForUser
};
