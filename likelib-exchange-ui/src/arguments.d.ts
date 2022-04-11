declare module "@likelib/core" {
  const Account = {
    createAccount(): {
      getPrivKey(): string;
      getAddress(): string;
    };,
  };
}
