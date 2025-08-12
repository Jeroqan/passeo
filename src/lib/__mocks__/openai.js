const mockCreate = jest.fn();

const OpenAI = jest.fn().mockImplementation(() => {
  return {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  };
});

// mockCreate'i dışa aktararak testlerde erişilebilir ve kontrol edilebilir yapıyoruz.
OpenAI.mockCreate = mockCreate;

module.exports = OpenAI; 