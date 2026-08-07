/*

* Author: Malik Nisar Jamil
* Email: khokharmaliknisar@gmail.com


_________________________________________________________________
* Date: Fri Aug 07 2026
            
*/
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send({ title: "Express" });
});

module.exports = router;
