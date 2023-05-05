"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/get", (req, res) => {
    console.log("This is a get call");
});
router.post("/post", (req, res) => {
    console.log("This is a post call");
});
exports.default = router;
