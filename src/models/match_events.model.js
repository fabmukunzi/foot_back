// Auto-generated model for match_events
const pool = require("../../config/db");

function buildInsertQuery(table, data){
  const keys = Object.keys(data);
  const cols = keys.join(", ");
  const placeholders = keys.map((_, i) => "$" + (i+1)).join(", ");
  const values = keys.map(k => data[k]);
  return { text: `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`, values };
}

function buildUpdateQuery(table, id, data){
  const keys = Object.keys(data);
  const set = keys.map((k,i)=> `${k} = $${i+1}`).join(", ");
  const values = keys.map(k=> data[k]);
  values.push(id);
  return { text: `UPDATE ${table} SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length+1} RETURNING *`, values };
}

const MatchEventsModel = {
  async findAll(){
    const res = await pool.query(`SELECT * FROM match_events ORDER BY id DESC`);
    return res.rows;
  },

  async findById(id){
    const res = await pool.query(`SELECT * FROM match_events WHERE id = $1`, [id]);
    return res.rows[0];
  },

  async create(data){
    const q = buildInsertQuery("match_events", data);
    const res = await pool.query(q.text, q.values);
    return res.rows[0];
  },

  async update(id, data){
    const q = buildUpdateQuery("match_events", id, data);
    const res = await pool.query(q.text, q.values);
    return res.rows[0];
  },

  async remove(id){
    const res = await pool.query(`DELETE FROM match_events WHERE id = $1 RETURNING *`, [id]);
    return res.rows[0];
  }
};

module.exports = MatchEventsModel;