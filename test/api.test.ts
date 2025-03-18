import request from "supertest";

const url = process.env.URL || "http://localhost:8181";
const basicAuthUser = process.env.CLIENT_ID;
const basicAuthPass = process.env.CLIENT_SECRET;
const basicAuth = Buffer.from(`${basicAuthUser}:${basicAuthPass}`).toString(
  "base64"
);

describe("POST /thread/:threadId", () => {
  it("should not be authorized", async () => {
    await request(url)
      .post("/thread/unauthorized-user-1-a")
      .set("Authorization", `Basic bullshit`)
      .send({ message: "Hello, this is a test message" })
      .expect("Content-Type", /text/)
      .expect(401);
  });

  it("should post to thread", async () => {
    const response = await request(url)
      .post("/thread/authorized-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .send({ message: "Hello, this is a test message" })
      .expect("Content-Type", /json/)
      .expect(200);

    // Add assertions for the response body here
    expect(response.body).toHaveProperty("response");
  }, 10000);
});

describe("GET /thread/:threadId", () => {
  it("should not be authorized", async () => {
    await request(url)
      .get("/thread/unauthorized-user-1-a")
      .set("Authorization", `Basic bullshit`)
      .expect("Content-Type", /text/)
      .expect(401);
  });

  it("should not return thread data", async () => {
    const response = await request(url)
      .get("/thread/nonexisitent-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect("Content-Type", /json/)
      .expect(404);

    // Add assertions for the response body here
    expect(response.body).toEqual({ message: "History not found" });
  });

  it("should return thread data", async () => {
    const response = await request(url)
      .get("/thread/authorized-user-1-a")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect("Content-Type", /json/)
      .expect(200);

    // Add assertions for the response body here
    expect(response.body).toHaveProperty("messages");
    expect(response.body.messages.length).toBeGreaterThan(0);
  });
});
