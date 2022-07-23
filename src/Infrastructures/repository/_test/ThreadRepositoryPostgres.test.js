const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('AuthenticationRepository postgres', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-thread-123', username: 'userthread' });
      const fakeIdGenerator = () => '123'; // stub
      const threadRepository = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-thread-123',
      };

      await threadRepository.addThread(threadPayload);

      const threads = await ThreadTableTestHelper.findThread('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe('thread-123');
    });

    it('should return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-thread-23', username: 'userthreads' });
      const fakeIdGenerator = () => '1234'; // stub
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const threadPayload = {
        title: 'thread title',
        body: 'thread body',
        owner: 'user-thread-23',
      };

      const thread = await threadRepositoryPostgres.addThread(threadPayload);

      expect(thread).toStrictEqual(new AddedThread({
        id: 'thread-1234',
        title: 'thread title',
        owner: 'user-thread-23',
      }));
    });
  });
});
