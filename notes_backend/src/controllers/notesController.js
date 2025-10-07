const { v4: uuidv4 } = require('uuid');
const {
  getNotes,
  addNote,
  findNoteById,
  updateNote,
  deleteNote
} = require('../store/db');

// Helpers
function parseBool(value) {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(v)) return true;
    if (['false', '0', 'no'].includes(v)) return false;
  }
  return undefined;
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (!value.trim()) return [];
    return value.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function ensureNoteOwnership(note, userId) {
  return note && note.userId === userId;
}

// PUBLIC_INTERFACE
function listNotes(req, res, next) {
  /** Lists notes for the authenticated user with search, filters, and pagination. */
  try {
    const userId = req.user.id;
    const { q, tag, pinned, archived, page = '1', limit = '10' } = req.query;

    let notes = getNotes().filter((n) => n.userId === userId);

    // Filtering
    const pinnedVal = parseBool(pinned);
    const archivedVal = parseBool(archived);

    if (typeof pinnedVal === 'boolean') {
      notes = notes.filter((n) => n.pinned === pinnedVal);
    }
    if (typeof archivedVal === 'boolean') {
      notes = notes.filter((n) => n.archived === archivedVal);
    }
    const tagVal = tag ? String(tag).trim() : undefined;
    if (tagVal) {
      notes = notes.filter((n) => Array.isArray(n.tags) && n.tags.includes(tagVal));
    }

    // Search
    const query = q ? String(q).toLowerCase() : null;
    if (query) {
      notes = notes.filter((n) => {
        const title = (n.title || '').toLowerCase();
        const content = (n.content || '').toLowerCase();
        const tagsStr = (Array.isArray(n.tags) ? n.tags.join(' ') : '').toLowerCase();
        return title.includes(query) || content.includes(query) || tagsStr.includes(query);
      });
    }

    // Sort by updatedAt desc
    notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const total = notes.length;
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const offset = (pageNum - 1) * limitNum;
    const items = notes.slice(offset, offset + limitNum);

    return res.status(200).json({
      status: 'success',
      data: items,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
function getNote(req, res, next) {
  /** Retrieves a single note by ID for the authenticated user. */
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const note = findNoteById(id);
    if (!ensureNoteOwnership(note, userId)) {
      return res.status(404).json({ status: 'error', message: 'Note not found' });
    }
    return res.status(200).json({ status: 'success', data: note });
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
function createNote(req, res, next) {
  /** Creates a new note for the authenticated user. */
  try {
    const userId = req.user.id;
    const { title, content, tags, pinned, archived } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ status: 'error', message: 'Title is required' });
    }

    const now = new Date().toISOString();
    const note = {
      id: uuidv4(),
      userId,
      title: title.trim(),
      content: typeof content === 'string' ? content : '',
      tags: parseArray(tags),
      createdAt: now,
      updatedAt: now,
      pinned: typeof pinned === 'boolean' ? pinned : false,
      archived: typeof archived === 'boolean' ? archived : false
    };
    addNote(note);
    return res.status(201).json({ status: 'success', data: note });
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
function updateNoteById(req, res, next) {
  /** Updates an existing note by ID for the authenticated user. */
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const existing = findNoteById(id);
    if (!ensureNoteOwnership(existing, userId)) {
      return res.status(404).json({ status: 'error', message: 'Note not found' });
    }

    const { title, content, tags, pinned, archived } = req.body || {};
    const updates = {};
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ status: 'error', message: 'Invalid title' });
      }
      updates.title = title.trim();
    }
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Invalid content' });
      }
      updates.content = content;
    }
    if (tags !== undefined) {
      const t = parseArray(tags);
      if (!Array.isArray(t)) {
        return res.status(400).json({ status: 'error', message: 'Invalid tags' });
      }
      updates.tags = t;
    }
    if (pinned !== undefined) {
      const p = parseBool(pinned);
      if (typeof p !== 'boolean') {
        return res.status(400).json({ status: 'error', message: 'Invalid pinned value' });
      }
      updates.pinned = p;
    }
    if (archived !== undefined) {
      const a = parseBool(archived);
      if (typeof a !== 'boolean') {
        return res.status(400).json({ status: 'error', message: 'Invalid archived value' });
      }
      updates.archived = a;
    }

    const updated = updateNote(id, updates);
    return res.status(200).json({ status: 'success', data: updated });
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
function deleteNoteById(req, res, next) {
  /** Deletes a note by ID for the authenticated user. */
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const existing = findNoteById(id);
    if (!ensureNoteOwnership(existing, userId)) {
      return res.status(404).json({ status: 'error', message: 'Note not found' });
    }
    const ok = deleteNote(id);
    if (!ok) {
      return res.status(500).json({ status: 'error', message: 'Failed to delete note' });
    }
    return res.status(200).json({ status: 'success', data: { id } });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listNotes,
  getNote,
  createNote,
  updateNoteById,
  deleteNoteById
};
