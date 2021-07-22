export async function describe(desc, cb) {
  console.log("TEST:", desc);
  try {
    await cb();
  } catch (error) {
    console.error("TEST:" + desc + "" + error);
  }
}

export async function it(desc, cb) {
  try {
    await cb();
    console.info("Test[Pass]:" + desc);
  } catch (error) {
    console.error("TEST[NoPass]:" + desc + " " + error);
  }
}

export async function expect(targetValue) {
  return {
    toBe(expectValue) {
      if (targetValue !== expectValue) {
        throw new Error(
          "Expect:" + expectValue + "\n\r" + "Received:" + targetValue
        );
      }
    },
  };
}
