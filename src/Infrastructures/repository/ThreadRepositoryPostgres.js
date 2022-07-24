const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const { mapThreadComments } = require('../helper/mapper');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(thread) {
    const {
      title, body, owner,
    } = thread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async getDetailThreadById(id) {
    const queryThread = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username
      FROM threads 
      LEFT JOIN users ON threads.owner = users.id 
      WHERE threads.id = $1`,
      values: [id],
    };

    const queryComments = {
      text: `SELECT comment_threads.id, comment_threads.content, 
      comment_threads.date, comment_threads.is_delete, users.username
      FROM comment_threads
      LEFT JOIN users ON comment_threads.owner = users.id
      WHERE comment_threads.thread_id = $1
      GROUP BY comment_threads.id, users.username`,
      values: [id],
    };

    const queryReplies = {
      text: `SELECT replies.*, users.username
      FROM replies
      LEFT JOIN users ON replies.owner = users.id
      WHERE 1=1`,
    };

    const [thread, comments, replies] = await Promise.all([
      this._pool.query(queryThread),
      this._pool.query(queryComments),
      this._pool.query(queryReplies),
    ]);

    return mapThreadComments({
      thread: thread.rows[0],
      comments: comments.rows,
      replies: replies.rows,
    });
  }

  async checkThreadById(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
