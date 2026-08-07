/*

* Author: Malik Nisar Jamil
* Email: khokharmaliknisar@gmail.com


_________________________________________________________________
* Date: Fri Aug 07 2026
            
*/
const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.get("/test-db", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  res.json({
    success: true,
    data,
  });
});

module.exports = router;
