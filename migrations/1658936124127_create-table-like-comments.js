exports.up = (pgm) => {
  pgm.createTable('like_comments', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
      unique: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'comment_threads(id)',
      onDelete: 'CASCADE',
      unique: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('like_comments');
};
