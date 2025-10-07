const express = require('express');
const auth = require('../middleware/auth');
const {
  listNotes,
  getNote,
  createNote,
  updateNoteById,
  deleteNoteById
} = require('../controllers/notesController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Personal notes management
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: List notes for current user with filters and pagination
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query across title, content, and tags
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by a specific tag
 *       - in: query
 *         name: pinned
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of notes
 */
router.get('/', auth, listNotes);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               pinned: { type: boolean }
 *               archived: { type: boolean }
 *     responses:
 *       201:
 *         description: Note created
 */
router.post('/', auth, createNote);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Note found
 *       404:
 *         description: Note not found
 */
router.get('/:id', auth, getNote);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               pinned: { type: boolean }
 *               archived: { type: boolean }
 *     responses:
 *       200:
 *         description: Note updated
 *       404:
 *         description: Note not found
 */
router.put('/:id', auth, updateNoteById);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Note deleted
 *       404:
 *         description: Note not found
 */
router.delete('/:id', auth, deleteNoteById);

module.exports = router;
