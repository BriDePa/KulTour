const express = require("express");
const {
  getLists,
  createList,
  updateList,
  deleteList,
  addItem,
  removeItem,
  getListItems,
} = require("../controllers/favoriteLists.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/lists", authenticate, getLists);
router.post("/lists", authenticate, createList);
router.put("/lists/:id", authenticate, updateList);
router.delete("/lists/:id", authenticate, deleteList);
router.get("/lists/:id/items", authenticate, getListItems);
router.post("/lists/:id/items", authenticate, addItem);
router.delete("/lists/:id/items/:itemId", authenticate, removeItem);

module.exports = router;