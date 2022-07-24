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

  describe('findCommentById function', () => {
    it('should return undefined if comment not found', async () => {
      const commentRepository = new CommentRepositoryPostgres(pool);
      const comment = await commentRepository.findCommentById('comment-123');

      expect(comment).toBeUndefined();
    });

    it('should return comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-345', username: 'usercomment345' });
      await ThreadTableTestHelper.addThread({ id: 'thread-comment-345', title: 'thread title', owner: 'user-comment-345' });
      await CommentTableTestHelper.addComment({
        id: 'comment-345',
        content: 'comment content',
        threadId: 'thread-comment-345',
        userId: 'user-comment-345',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await commentRepositoryPostgres.findCommentById('comment-345');

      expect(comment).toStrictEqual({ id: 'comment-345', owner: 'user-comment-345' });
    });
  });

  describe('deleteComment function', () => {
    it('should delete comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-comment-567', username: 'usercomment567' });
      await ThreadTableTestHelper.addThread({ id: 'thread-comment-567', title: 'thread title', owner: 'user-comment-567' });
      await CommentTableTestHelper.addComment({
        id: 'comment-567',
        content: 'comment content',
        threadId: 'thread-comment-567',
        userId: 'user-comment-567',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await commentRepositoryPostgres.deleteComment('comment-567');

      const comments = await CommentTableTestHelper.findComment('comment-567');
      expect(comments).toStrictEqual([
        {
          id: 'comment-567',
          content: 'comment content',
          thread_id: 'thread-comment-567',
          owner: 'user-comment-567',
          date: expect.any(String),
          is_delete: true,
        },
      ]);
    });
  });
});
