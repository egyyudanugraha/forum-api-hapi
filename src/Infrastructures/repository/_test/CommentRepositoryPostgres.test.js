const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-123', username: 'usercomment' });
      await ThreadTableTestHelper.addThread({ id: 'thread-comment-123', title: 'thread title', owner: 'user-comment-123' });
      const fakeIdGenerator = () => '123'; // stub
      const commentRepository = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'comment content',
        threadId: 'thread-comment-123',
        owner: 'user-comment-123',
      };

      await commentRepository.addComment(commentPayload);

      const comments = await CommentTableTestHelper.findComment('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('comment-123');
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-23', username: 'usercomments' });
      await ThreadTableTestHelper.addThread({ id: 'thread-comment-23', title: 'thread title', owner: 'user-comment-23' });
      const fakeIdGenerator = () => '1234'; // stub
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const commentPayload = {
        content: 'comment content',
        threadId: 'thread-comment-23',
        owner: 'user-comment-23',
      };

      const comment = await commentRepositoryPostgres.addComment(commentPayload);

      expect(comment).toStrictEqual(new AddedComment({
        id: 'comment-1234',
        content: 'comment content',
        owner: 'user-comment-23',
      }));
    });
  });
});
