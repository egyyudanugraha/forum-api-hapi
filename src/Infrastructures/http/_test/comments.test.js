const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

xdescribe('/threads/{id}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{id}/comments', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-xx-xx',
        id: 'user-xx-xx',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-xx-xx',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-xx-xx',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx/comments',
        payload: {
          content: 'comment content',
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingxyuda',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingxyuda',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx-22/comments',
        payload: {
          content: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 if payload no needed property', async () => {
      // Arrange
      // add user
      const server = await createServer(container);
      const addUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingxyudaa',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingxyudaa',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;
      const { id } = await addUser.result.data.addedUser;

      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-xx-xx1',
        title: 'thread title',
        body: 'thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx1/comments',
        payload: {
          body: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(400);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('harus mengirimkan content');
    });

    it('should response 201 and persisted comment with authentication', async () => {
      // Arrange
      // add user
      const server = await createServer(container);
      const addUser = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingxyudaaa',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingxyudaaa',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;
      const { id } = await addUser.result.data.addedUser;

      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-xx-xx12',
        title: 'thread title',
        body: 'thread body',
        owner: id,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xx-xx12/comments',
        payload: {
          content: 'comment content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(201);
      await expect(responseJson.status).toEqual('success');
      await expect(responseJson.data).toHaveProperty('addedComment');
      await expect(responseJson.data.addedComment).toHaveProperty('id');
      await expect(responseJson.data.addedComment).toHaveProperty('content');
      await expect(responseJson.data.addedComment).toHaveProperty('owner');
    });
  });

  describe('when DELETE /threads/{id}/comments/{commentId}', () => {
    it('should response 401 and persisted comment without authentication', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'user-example-xx',
        id: 'user-example-xx',
      });
      await ThreadTableTestHelper.addThread({
        id: 'thread-example-xx',
        title: 'thread title',
        body: 'thread body',
        owner: 'user-example-xx',
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-xx-xx',
        content: 'comment content',
        owner: 'user-example-xx',
        thread: 'thread-example-xx',
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-example-xx/comments/comment-xx-xx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 if thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicodingindonesia',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingindonesia',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xx-xx/comments/comment-xx-xx',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(404);
      await expect(responseJson.status).toEqual('fail');
      await expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 200 if authenticate and found comment', async () => {
      // Arrange
      const server = await createServer(container);
      // add user
      await UsersTableTestHelper.addUser({
        username: 'user-example-xx',
        id: 'dicodingindonesia',
      });
      // login user
      const user = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicodingindonesia',
          password: 'secret',
        },
      });
      const { accessToken } = await user.result.data;
      // add thread
      await ThreadTableTestHelper.addThread({
        id: 'thread-xx-xx',
        title: 'thread title',
        body: 'thread body',
        owner: 'dicodingindonesia',
      });
      // add comment
      await CommentTableTestHelper.addComment({
        id: 'comment-xx-xx',
        content: 'comment content',
        owner: 'dicodingindonesia',
        thread: 'thread-xx-xx',
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-xx-xx/comments/comment-xx-xx',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      await expect(response.statusCode).toEqual(200);
      await expect(responseJson.status).toEqual('success');
    });
  });
});
