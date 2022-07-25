const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper');

describe('DeleteReplyUseCase', () => {
  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  it('should throw error if use case param not contain reply id', async () => {
    // Arrange
    const useCaseParams = {};

    // Action & Assert
    await expect(new DeleteReplyUseCase({}).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_REPLY_ID');
  });

  it('should throw error if reply id not string', async () => {
    // Arrange
    const useCaseParams = {
      replyId: 123,
    };

    // Action & Assert
    await expect(new DeleteReplyUseCase({}).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if reply not found', async () => {
    // Arrange
    const useCaseParams = {
      replyId: 'reply-id-1',
    };
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    // Action & Assert
    await expect(new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    }).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND');
  });

  it('should throw error if reply not owner of reply', async () => {
    await UsersTableTestHelper.addUser({ username: 'usernamereplydel', id: 'replydel' });
    await ThreadTableTestHelper.addThread({ id: 'threaddel', owner: 'replydel' });
    await CommentTableTestHelper.addComment({ id: 'commentreplydel', userId: 'replydel', threadId: 'threaddel' });
    await ReplyTableTestHelper.addReply({ id: 'replyfordel', userId: 'replydel', commentId: 'commentreplydel' });
    // Arrange
    const useCaseParams = {
      replyId: 'replyfordel',
      owner: 'user-12333',
    };
    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve({ owner: 'replydel' }));
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action & Assert
    await expect(new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    }).execute(useCaseParams))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.REPLY_NOT_OWNER');
  });

  it('should orchestrating the delete reply action corretly', async () => {
    await UsersTableTestHelper.addUser({ username: 'usernamereplydelete', id: 'replydel22' });
    await ThreadTableTestHelper.addThread({ id: 'threaddelete', owner: 'replydel22' });
    await CommentTableTestHelper.addComment({ id: 'commentreplydelete', userId: 'replydel22', threadId: 'threaddelete' });
    await ReplyTableTestHelper.addReply({ id: 'replyfordelete', userId: 'replydel22', commentId: 'commentreplydelete' });
    // Arrange
    const useCaseParams = {
      replyId: 'replyfordelete',
      owner: 'replydel22',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'replyfordelete', owner: 'replydel22' }));
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    }).execute(useCaseParams);

    // Assert
    expect(mockReplyRepository.findReplyById).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.findReplyById).toHaveBeenCalledWith('replyfordelete');
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledTimes(1);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith('replyfordelete');
  });
});
