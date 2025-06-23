exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('password').notNullable();
      table.string('email').unique();
      table.string('profilePicture');
    })
    .createTable('posts', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.integer('userId').notNullable().references('id').inTable('users');
      table.string('username').notNullable();
      table.string('createdAt').notNullable();
    })
    .createTable('comments', (table) => {
      table.increments('id').primary();
      table.text('content').notNullable();
      table.integer('userId').notNullable().references('id').inTable('users');
      table.string('username').notNullable();
      table.integer('postId').notNullable().references('id').inTable('posts');
      table.string('createdAt').notNullable();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('comments')
    .dropTableIfExists('posts')
    .dropTableIfExists('users');
};