const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const db = require('../database');
const authenticate = require('../middleware/auth');
const router = express.Router();
