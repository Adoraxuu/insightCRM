const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('🔗 InsightCRM API Root');
});

module.exports = router;
