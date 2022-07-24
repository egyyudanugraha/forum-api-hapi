const GetThread = require('../../Domains/threads/entities/GetThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    await this._verifyPayload(payload);
    const { threadId } = payload;

    const result = await this._threadRepository.getDetailThreadById(threadId);
    return new GetThread(result);
  }

  async _verifyPayload(payload) {
    const { threadId } = payload;

    if (!threadId) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
    }

    if (typeof threadId !== 'string') {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const result = await this._threadRepository.checkThreadById(threadId);

    if (!result) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
    }
  }
}

module.exports = GetDetailThreadUseCase;
