const bcrypt = require('bcrypt');
const db = require('./index');

async function seed() {
  // Wipe data, reset ids
  await db.query(`TRUNCATE audit_logs, expenditures, assignments, transfers, purchases,
                  users, equipment_types, bases RESTART IDENTITY CASCADE`);

  await db.query(`INSERT INTO bases (name, location) VALUES
    ('Alpha Base','North'), ('Bravo Base','East'), ('Charlie Base','West')`);

  await db.query(`INSERT INTO equipment_types (name, category, unit) VALUES
    ('INSAS Rifle','WEAPON','units'), ('Glock 17','WEAPON','units'),
    ('Tata Safari Storme','VEHICLE','units'),
    ('5.56mm Ammo','AMMUNITION','rounds'), ('9mm Ammo','AMMUNITION','rounds')`);

  const hash = await bcrypt.hash('password123', 10);
  await db.query(
    `INSERT INTO users (name, email, password_hash, role, base_id) VALUES
     ('Admin User','admin@mams.com',$1,'ADMIN',NULL),
     ('Cmdr Alpha','alpha@mams.com',$1,'BASE_COMMANDER',1),
     ('Cmdr Bravo','bravo@mams.com',$1,'BASE_COMMANDER',2),
     ('Log Officer','logistics@mams.com',$1,'LOGISTICS_OFFICER',NULL)`,
    [hash]
  );

  // Sample movements (created_by = admin, id 1)
  await db.query(`INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, created_by) VALUES
    (1,1,100,'2026-08-01',1), (1,4,5000,'2026-08-05',1), (2,3,10,'2026-08-10',1), (1,1,50,'2026-09-05',1)`);
  await db.query(`INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, created_by) VALUES
    (1,2,1,20,'2026-08-20',1), (2,3,3,2,'2026-09-10',1)`);
  await db.query(`INSERT INTO assignments (base_id, equipment_type_id, quantity, personnel_name, assignment_date, created_by) VALUES
    (1,1,10,'Sgt. Rao','2026-09-12',1)`);
  await db.query(`INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason, expenditure_date, created_by) VALUES
    (1,4,500,'Training exercise','2026-09-15',1)`);

  console.log('Seed done');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
