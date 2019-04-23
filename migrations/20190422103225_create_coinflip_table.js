
exports.up = knex => 
  knex.schema.createTable('coinflip', t => {
    t.increments('id').primary();
    t.boolean('isFlipped').defaultTo(false);
    t.boolean('heads');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

exports.down = knex => knex.schema.dropTableIfExists('coinflip');