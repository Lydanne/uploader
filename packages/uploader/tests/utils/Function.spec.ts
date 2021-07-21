import { optionHander } from "../../src/utils/Function";

describe("Function.ts", () => {
  it("optionHander hander option", () => {
    const option = {
      a: 1,
      b: 2,
      obj: {
        a: 3,
        c: 1,
      },
    };
    const defaultOption = {
      a: 3,
      c: 2,
      obj: {
        a: 1,
        b: 2,
      },
    };

    expect(optionHander(option, defaultOption)).toEqual({
      a: 1,
      b: 2,
      c: 2,
      obj: {
        a: 3,
        b: 2,
        c: 1,
      },
    });
  });
});
