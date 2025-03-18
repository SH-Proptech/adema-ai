import request from "supertest";

const url = process.env.URL || "http://localhost:8181";

describe("GET /thread/:threadId", () => {
  it("should not return thread data", async () => {
    const response = await request(url)
      .get("/thread/some-loser-1")
      .expect("Content-Type", /json/)
      .expect(404);

    // Add assertions for the response body here
    expect(response.body).toEqual({ message: "History not found" });
  });
  it("should return thread data", async () => {
    const response = await request(url)
      .get("/thread/test-user-1-1")
      .expect("Content-Type", /json/)
      .expect(200);

    // Add assertions for the response body here
    expect(response.body).toHaveProperty("messages");
    expect(response.body.messages.length).toBeGreaterThan(0);
  });
});

describe("POST /thread/:threadId", () => {
  it("should post to thread", async () => {
    const newMessage = { message: "Hello, this is a test message" };

    const response = await request(url)
      .post("/thread/test-user-1-1")
      .send(newMessage)
      .expect("Content-Type", /json/)
      .expect(200);

    // Add assertions for the response body here
    expect(response.body).toHaveProperty("response");
  }, 10000);
});
