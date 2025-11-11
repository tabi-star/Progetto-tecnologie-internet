// models/discountModel.js
import db from "../db.js";

export const createDiscountCode = (discount, cb) => {
  db.query("INSERT INTO discount_codes SET ?", discount, cb);
};

export const deleteDiscountCode = (id, callback) => {
  const query = "DELETE FROM discount_codes WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

export const getAdminDiscountCodes = (admin_id, cb) => {
  db.query("SELECT * FROM discount_codes WHERE created_by = ? ORDER BY created_at DESC", [admin_id], cb);
};

export const getValidDiscountCode = (code, cb) => {
  db.query("SELECT * FROM discount_codes WHERE code = ? AND valid_until > NOW() AND used = FALSE", [code], cb);
};

export const markDiscountAsUsed = (code_id, user_id, cb) => {
  db.query("UPDATE discount_codes SET used = TRUE, used_by = ?, used_at = NOW() WHERE id = ?", [user_id, code_id], cb);
};